import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

import { describe, expect, it } from 'vitest';
import * as Zod from 'zod';

import type { CastrSchemaComponent } from '../../ir/index.js';
import { parseZodSource, type ZodParseOptions } from '../../parsers/zod/index.js';
import type { ZodTypeAny } from 'zod';
import { isRecord, type UnknownRecord } from '../../../shared/type-utils/types.js';

const RECURSIVE_UNKNOWN_KEY_PAYLOAD = {
  name: 'root',
  extraRoot: 'root-extra',
  children: [
    {
      name: 'child',
      extraChild: 'child-extra',
      children: [
        {
          name: 'grandchild',
          extraGrandchild: 'grandchild-extra',
          children: [],
        },
      ],
    },
  ],
};

async function compileAndLoadSchemas(zodSourceCode: string): Promise<UnknownRecord> {
  const tempDir = await mkdtemp(join(process.cwd(), '.tmp-recursive-runtime-'));
  const tempFile = join(tempDir, 'schema.mjs');

  try {
    await writeFile(tempFile, zodSourceCode, 'utf8');
    const moduleNamespace: unknown = await import(pathToFileURL(tempFile).href);

    if (!isRecord(moduleNamespace)) {
      throw new Error('Expected imported schema module to expose named exports');
    }

    return moduleNamespace;
  } finally {
    await rm(tempDir, { force: true, recursive: true });
  }
}

function isZodSchema(value: unknown): value is ZodTypeAny {
  return value instanceof Zod.ZodType;
}

function expectSchemaParseResult(
  source: string,
  schemaName: string,
  options?: ZodParseOptions,
): { schemaComponent: CastrSchemaComponent } {
  const parseResult = parseZodSource(source, options);
  expect(parseResult.errors).toHaveLength(0);

  const schemaComponent = parseResult.ir.components.find(
    (component): component is CastrSchemaComponent =>
      component.type === 'schema' && component.name === schemaName,
  );

  expect(schemaComponent).toBeDefined();

  if (!schemaComponent) {
    throw new Error(`Expected parsed schema component ${schemaName}`);
  }

  return { schemaComponent };
}

async function getExportedSchema(source: string, exportName: string): Promise<ZodTypeAny> {
  const exports = await compileAndLoadSchemas(source);
  const schema = exports[exportName];

  expect(schema).toBeDefined();

  if (!isZodSchema(schema)) {
    throw new Error(`Expected exported schema ${exportName}`);
  }

  return schema;
}

describe('Zod writer recursive unknown-key runtime characterisation', () => {
  it('distinguishes safe bare recursive strip output from explicit recursive .strip()', async () => {
    const bareRecursiveStripSource = `
      import { z } from 'zod';

      export const Category = z.object({
        name: z.string(),
        get children() {
          return z.array(Category);
        },
      });
    `;

    const explicitRecursiveStripSource = `
      import { z } from 'zod';

      export const Category = z.object({
        name: z.string(),
        get children() {
          return z.array(Category);
        },
      }).strip();
    `;

    const { schemaComponent } = expectSchemaParseResult(bareRecursiveStripSource, 'Category', {
      nonStrictObjectPolicy: 'strip',
    });
    expect(schemaComponent.schema.unknownKeyBehavior).toEqual({ mode: 'strip' });

    const bareSchema = await getExportedSchema(bareRecursiveStripSource, 'Category');
    const bareResult = bareSchema.safeParse(RECURSIVE_UNKNOWN_KEY_PAYLOAD);

    expect(bareResult.success).toBe(true);
    if (!bareResult.success) {
      throw new Error('Expected bare recursive strip schema to parse successfully');
    }

    expect(bareResult.data).toEqual({
      name: 'root',
      children: [
        {
          name: 'child',
          children: [
            {
              name: 'grandchild',
              children: [],
            },
          ],
        },
      ],
    });

    expectSchemaParseResult(explicitRecursiveStripSource, 'Category', {
      nonStrictObjectPolicy: 'strip',
    });
    await expect(compileAndLoadSchemas(explicitRecursiveStripSource)).rejects.toThrow(
      /Cannot access 'Category' before initialization/,
    );
  });

  it('shows explicit recursive .strict() fails while z.strictObject is runtime-viable and parser-accepted', async () => {
    const explicitRecursiveStrictSource = `
      import { z } from 'zod';

      export const Category = z.object({
        name: z.string(),
        get children() {
          return z.array(Category);
        },
      }).strict();
    `;

    const { schemaComponent } = expectSchemaParseResult(explicitRecursiveStrictSource, 'Category');
    expect(schemaComponent.schema.unknownKeyBehavior).toEqual({ mode: 'strict' });

    await expect(compileAndLoadSchemas(explicitRecursiveStrictSource)).rejects.toThrow(
      /Cannot access 'Category' before initialization/,
    );

    const recursiveStrictObjectSource = `
      import { z } from 'zod';

      export const Category = z.strictObject({
        name: z.string(),
        get children() {
          return z.array(Category);
        },
      });
    `;

    const strictObjectParseResult = parseZodSource(recursiveStrictObjectSource);

    expect(strictObjectParseResult.errors).toHaveLength(0);
    expect(strictObjectParseResult.ir.components).toHaveLength(1);
    expect(strictObjectParseResult.ir.components[0]?.type).toBe('schema');
    if (strictObjectParseResult.ir.components[0]?.type !== 'schema') {
      throw new Error('Expected recursive strictObject schema component');
    }

    expect(strictObjectParseResult.ir.components[0].schema.unknownKeyBehavior).toEqual({
      mode: 'strict',
    });

    const strictSchema = await getExportedSchema(recursiveStrictObjectSource, 'Category');
    const validResult = strictSchema.safeParse({ name: 'root', children: [] });
    const invalidResult = strictSchema.safeParse({
      name: 'root',
      extraRoot: 'unexpected',
      children: [],
    });

    expect(validResult.success).toBe(true);
    if (!validResult.success) {
      throw new Error('Expected recursive strictObject candidate to parse valid payloads');
    }

    expect(invalidResult.success).toBe(false);
  });

  it('parses canonical recursive passthrough source but fails during runtime initialization', async () => {
    const recursivePassthroughSource = `
      import { z } from 'zod';

      export const Category = z.object({
        name: z.string(),
        get children() {
          return z.array(Category);
        },
      }).passthrough();
    `;

    const { schemaComponent } = expectSchemaParseResult(recursivePassthroughSource, 'Category', {
      nonStrictObjectPolicy: 'strip',
    });
    expect(schemaComponent.schema.unknownKeyBehavior).toEqual({ mode: 'strip' });

    await expect(compileAndLoadSchemas(recursivePassthroughSource)).rejects.toThrow(
      /Cannot access 'Category' before initialization/,
    );
  });

  it('parses canonical recursive catchall source but fails during runtime initialization', async () => {
    const recursiveCatchallSource = `
      import { z } from 'zod';

      export const Category = z.object({
        name: z.string(),
        get children() {
          return z.array(Category);
        },
      }).catchall(z.string());
    `;

    const { schemaComponent } = expectSchemaParseResult(recursiveCatchallSource, 'Category', {
      nonStrictObjectPolicy: 'strip',
    });
    expect(schemaComponent.schema.unknownKeyBehavior?.mode).toBe('strip');

    await expect(compileAndLoadSchemas(recursiveCatchallSource)).rejects.toThrow(
      /Cannot access 'Category' before initialization/,
    );
  });

  it('shows z.looseObject is runtime-viable for recursive passthrough but outside parser lockstep', async () => {
    const recursiveLooseObjectSource = `
      import { z } from 'zod';

      export const Category = z.looseObject({
        name: z.string(),
        get children() {
          return z.array(Category);
        },
      });
    `;

    const parseResult = parseZodSource(recursiveLooseObjectSource);

    expect(parseResult.ir.components).toHaveLength(0);
    expect(parseResult.errors).toHaveLength(1);
    expect(parseResult.errors[0]?.message).toContain('Non-strict object input "z.looseObject()"');

    const schema = await getExportedSchema(recursiveLooseObjectSource, 'Category');
    const result = schema.safeParse(RECURSIVE_UNKNOWN_KEY_PAYLOAD);

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected recursive looseObject candidate to parse successfully');
    }

    expect(result.data).toEqual(RECURSIVE_UNKNOWN_KEY_PAYLOAD);
  });

  it('shows the two-step catchall candidate is not remediation-ready', async () => {
    const recursiveCatchallAliasSource = `
      import { z } from 'zod';

      const CategoryBase = z.object({
        name: z.string(),
        get children() {
          return z.array(CategoryBase);
        },
      });

      export const Category = CategoryBase.catchall(z.string());
    `;

    const parseResult = parseZodSource(recursiveCatchallAliasSource, {
      nonStrictObjectPolicy: 'strip',
    });

    expect(parseResult.errors).toHaveLength(0);
    expect(
      parseResult.ir.components.map((component) =>
        component.type === 'schema' ? component.name : component.type,
      ),
    ).toEqual(['CategoryBase']);

    const schema = await getExportedSchema(recursiveCatchallAliasSource, 'Category');
    const result = schema.safeParse({
      ...RECURSIVE_UNKNOWN_KEY_PAYLOAD,
      children: [
        {
          name: 'child',
          extraChild: 42,
          children: [],
        },
      ],
    });

    expect(result.success).toBe(true);
    if (!result.success) {
      throw new Error('Expected two-step recursive catchall candidate to initialize');
    }

    expect(result.data).toEqual({
      name: 'root',
      extraRoot: 'root-extra',
      children: [
        {
          name: 'child',
          children: [],
        },
      ],
    });
  });
});
