/**
 * Shared transform test helpers and fixture constants.
 *
 * Extracted from the original `transform-samples.integration.test.ts`
 * to enable per-scenario test file splitting and reuse across
 * scenarios 1–7.
 *
 * @module tests-transforms/utils/transform-helpers
 */

import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { expect } from 'vitest';

import { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
import type { CastrDocument } from '../../src/schema-processing/ir/index.js';
import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';
import { writeOpenApi } from '../../src/schema-processing/writers/openapi/index.js';
import { parseZodSource } from '../../src/schema-processing/parsers/zod/index.js';
import { generateZodClientFromOpenAPI } from '../../src/rendering/generate-from-context.js';
import { isSingleFileResult } from '../../src/rendering/generation-result.js';
import { parseComponentRef } from '../../src/shared/ref-resolution.js';

import * as Zod1 from 'zod';
import { ParityPayloadHarness } from '../../tests-fixtures/zod-parser/happy-path/payloads.js';

// ============================================================================
// Fixture Constants
// ============================================================================

const ARBITRARY_FIXTURES_DIR = resolve(__dirname, '../__fixtures__/arbitrary');

/**
 * Arbitrary fixtures — real-world OpenAPI specs for losslessness testing.
 * Format: [displayName, absolutePath]
 */
export const ARBITRARY_FIXTURES: [string, string][] = [
  ['tictactoe-3.1.yaml', `${ARBITRARY_FIXTURES_DIR}/tictactoe-3.1.yaml`],
  ['webhook-3.1.yaml', `${ARBITRARY_FIXTURES_DIR}/webhook-3.1.yaml`],
  ['petstore-3.0.yaml', `${ARBITRARY_FIXTURES_DIR}/petstore-3.0.yaml`],
  ['petstore-expanded-3.0.yaml', `${ARBITRARY_FIXTURES_DIR}/petstore-expanded-3.0.yaml`],
  ['callback-3.0.yaml', `${ARBITRARY_FIXTURES_DIR}/callback-3.0.yaml`],
];

const ZOD_FIXTURES_DIR = resolve(__dirname, '../../tests-fixtures/zod-parser/happy-path');

/**
 * Zod parser fixtures — valid Zod 4 schema declarations for transform testing.
 */
export interface ZodFixtureDefinition {
  name: string;
  path: string;
  roundTripSchemaNames?: readonly string[];
  generationFailures?: readonly ZodFixtureGenerationFailure[];
}

export interface ZodFixtureGenerationFailure {
  label: string;
  schemaNames: readonly string[];
  expectedError: RegExp;
}

export interface ZodFixtureGenerationFailureCase extends ZodFixtureGenerationFailure {
  fixtureName: string;
  fixturePath: string;
}

export const ZOD_FIXTURES: readonly ZodFixtureDefinition[] = [
  { name: 'objects', path: `${ZOD_FIXTURES_DIR}/objects.zod4.ts` },
  { name: 'string-formats', path: `${ZOD_FIXTURES_DIR}/string-formats.zod4.ts` },
  { name: 'constraints', path: `${ZOD_FIXTURES_DIR}/constraints.zod4.ts` },
  { name: 'unions', path: `${ZOD_FIXTURES_DIR}/unions.zod4.ts` },
  { name: 'intersections', path: `${ZOD_FIXTURES_DIR}/intersections.zod4.ts` },
  { name: 'recursion', path: `${ZOD_FIXTURES_DIR}/recursion.zod4.ts` },
];

export const ZOD_GENERATION_FAILURE_FIXTURES: readonly ZodFixtureGenerationFailureCase[] =
  ZOD_FIXTURES.flatMap((fixture) =>
    (fixture.generationFailures ?? []).map((generationFailure) => ({
      fixtureName: fixture.name,
      fixturePath: fixture.path,
      ...generationFailure,
    })),
  );

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Parses an OpenAPI spec to IR.
 */
export async function parseToIR(specPath: string): Promise<ReturnType<typeof buildIR>> {
  const result = await loadOpenApiDocument(specPath);
  return buildIR(result.document);
}

/**
 * Performs a transform round-trip pass: parse → write → parse.
 * Returns both the original IR and the transformed IR for comparison.
 */
export async function runTransformPass(
  specPath: string,
): Promise<{ originalIR: ReturnType<typeof buildIR>; transformedIR: ReturnType<typeof buildIR> }> {
  // Parse original spec to IR
  const originalIR = await parseToIR(specPath);

  // Write IR to OpenAPI
  const openApiOutput = writeOpenApi(originalIR);

  // Parse the output back to IR (using in-memory document)
  const transformedIR = buildIR(openApiOutput);

  return { originalIR, transformedIR };
}

/**
 * Generate Zod TypeScript source from an OpenAPI document using the REAL generator.
 * This tests actual system output, not a mock or test helper.
 */
export async function generateZodFromOpenAPI(
  openApiDoc: ReturnType<typeof writeOpenApi>,
): Promise<string> {
  const result = await generateZodClientFromOpenAPI({
    openApiDoc,
    disableWriteToFile: true,
  });

  if (!isSingleFileResult(result)) {
    throw new Error('Expected single file result');
  }

  return result.content;
}

/**
 * Assert that parsing produced no errors, with fixture-scoped context.
 */
export function expectNoParseErrors(
  fixtureName: string,
  stage: string,
  parseResult: ReturnType<typeof parseZodSource>,
): void {
  expect(
    parseResult.errors,
    `${fixtureName}: parse errors in ${stage}\n${JSON.stringify(parseResult.errors, null, 2)}`,
  ).toHaveLength(0);
}

/**
 * Execute dynamic Zod schemas to evaluate data.
 */
export async function loadDynamicZodSchemas(
  zodSourceCode: string,
): Promise<Record<string, Zod1.ZodTypeAny>> {
  // Transpile the generated Zod TS source (which contains top-level exports) into executable code
  const ts = await import('typescript');
  const compiled = ts.default.transpile(zodSourceCode, { module: ts.default.ModuleKind.CommonJS });

  // Safely execute the compiled module with a stubbed require
  const module: { exports: Record<string, Zod1.ZodTypeAny> } = { exports: {} };
  const requireHook = (id: string) => {
    if (id === 'zod') {
      return Zod1;
    }
    throw new Error(`Unexpected require in generated code: ${id}`);
  };

  // eslint-disable-next-line sonarjs/code-eval -- Allowed in test harness for dynamic schema evaluation
  const executableFn = new Function('require', 'module', 'exports', compiled);
  executableFn(requireHook, module, module.exports);

  return module.exports;
}

/**
 * Validates functional equivalence of two maps of schemas against shared payloads.
 * Ensures the 'before' schema and 'after' schema accept/reject identical data.
 */
export function assertValidationParity(
  fixtureName: string,
  originalSchemas: Record<string, Zod1.ZodTypeAny>,
  transformedSchemas: Record<string, Zod1.ZodTypeAny>,
  schemaNames?: readonly string[],
): void {
  const harness = ParityPayloadHarness[fixtureName];
  if (!harness) {
    return;
  } // Skip if no payloads defined

  for (const [schemaName, payloads] of Object.entries(harness)) {
    if (schemaNames && !schemaNames.includes(schemaName)) {
      continue;
    }

    const originalSchema = originalSchemas[schemaName];
    const transformedSchema =
      transformedSchemas[schemaName] || transformedSchemas[schemaName.replace(/Schema$/, '')];

    // Ensure the schema exists on both sides
    expect(originalSchema).toBeDefined();
    expect(transformedSchema).toBeDefined();

    if (!originalSchema || !transformedSchema) {
      throw new Error(`Parity schemas missing for ${schemaName}`);
    }

    // Assert same success/fail outcome for all valid payloads
    for (const validPayload of payloads.valid) {
      const originalResult = originalSchema.safeParse(validPayload);
      const transformedResult = transformedSchema.safeParse(validPayload);

      expect(
        transformedResult.success,
        `Schema ${schemaName} parity mismatch on valid payload`,
      ).toBe(originalResult.success);
      expect(transformedResult.success).toBe(true);
    }

    // Assert same success/fail outcome for all invalid payloads
    for (const invalidPayload of payloads.invalid) {
      const originalResult = originalSchema.safeParse(invalidPayload);
      const transformedResult = transformedSchema.safeParse(invalidPayload);

      expect(
        transformedResult.success,
        `Schema ${schemaName} parity mismatch on invalid payload`,
      ).toBe(originalResult.success);
      expect(transformedResult.success).toBe(false);
    }
  }
}

/**
 * Validates parsed-output equivalence for successful payloads.
 * Ensures the 'before' schema and 'after' schema produce identical parsed data.
 */
export function assertParsedOutputParity(
  fixtureName: string,
  originalSchemas: Record<string, Zod1.ZodTypeAny>,
  transformedSchemas: Record<string, Zod1.ZodTypeAny>,
  schemaNames?: readonly string[],
): void {
  const harness = ParityPayloadHarness[fixtureName];
  if (!harness) {
    return;
  }

  for (const [schemaName, payloads] of Object.entries(harness)) {
    if (schemaNames && !schemaNames.includes(schemaName)) {
      continue;
    }

    if (!payloads.parsedOutput) {
      continue;
    }

    const originalSchema = originalSchemas[schemaName];
    const transformedSchema =
      transformedSchemas[schemaName] || transformedSchemas[schemaName.replace(/Schema$/, '')];

    expect(originalSchema).toBeDefined();
    expect(transformedSchema).toBeDefined();

    if (!originalSchema || !transformedSchema) {
      throw new Error(`Parsed-output parity schemas missing for ${schemaName}`);
    }

    for (const payload of payloads.parsedOutput) {
      const originalResult = originalSchema.safeParse(payload);
      const transformedResult = transformedSchema.safeParse(payload);

      expect(
        originalResult.success,
        `Schema ${schemaName} original parse failed for parsed-output parity payload`,
      ).toBe(true);
      expect(
        transformedResult.success,
        `Schema ${schemaName} transformed parse failed for parsed-output parity payload`,
      ).toBe(true);

      if (!originalResult.success || !transformedResult.success) {
        throw new Error(`Parsed-output parity failed before comparison for ${schemaName}`);
      }

      expect(transformedResult.data, `Schema ${schemaName} parsed-output mismatch`).toEqual(
        originalResult.data,
      );
    }
  }
}

function toComponentName(schemaExportName: string): string {
  return schemaExportName.replace(/Schema$/, '');
}

function toComponentRef(schemaName: string): string {
  return `#/components/schemas/${schemaName}`;
}

function collectSchemaDependencyClosure(
  document: CastrDocument,
  selectedSchemaNames: ReadonlySet<string>,
): Set<string> {
  const selectedRefs = new Set<string>([...selectedSchemaNames].map(toComponentRef));
  const refsToVisit = [...selectedRefs];

  while (refsToVisit.length > 0) {
    const currentRef = refsToVisit.pop();
    if (!currentRef) {
      continue;
    }

    const node = document.dependencyGraph.nodes.get(currentRef);
    if (!node) {
      continue;
    }

    for (const dependencyRef of node.dependencies) {
      if (!selectedRefs.has(dependencyRef)) {
        selectedRefs.add(dependencyRef);
        refsToVisit.push(dependencyRef);
      }
    }
  }

  return new Set(
    [...selectedRefs].map((ref) => {
      const { componentName } = parseComponentRef(ref);
      return componentName;
    }),
  );
}

/**
 * Select a schema subset from an IR document by exported Zod schema names.
 */
export function selectSchemaComponents(
  document: CastrDocument,
  schemaExportNames?: readonly string[],
): CastrDocument {
  if (!schemaExportNames || schemaExportNames.length === 0) {
    return document;
  }

  const selectedSchemaNames = collectSchemaDependencyClosure(
    document,
    new Set(schemaExportNames.map(toComponentName)),
  );

  return {
    ...document,
    components: document.components.filter(
      (component) => component.type !== 'schema' || selectedSchemaNames.has(component.name),
    ),
    schemaNames: document.schemaNames.filter((schemaName) => selectedSchemaNames.has(schemaName)),
  };
}

/**
 * Select the schema subset that is expected to round-trip successfully for a fixture.
 */
export function selectFixtureRoundTripDocument(
  fixture: ZodFixtureDefinition,
  document: CastrDocument,
): CastrDocument {
  return selectSchemaComponents(document, fixture.roundTripSchemaNames);
}

/**
 * Read a Zod fixture file.
 */
export async function readZodFixture(path: string): Promise<string> {
  return readFile(path, 'utf-8');
}

export function parseFixtureZodSource(
  _fixture: ZodFixtureDefinition,
  source: string,
): ReturnType<typeof parseZodSource> {
  return parseZodSource(source);
}

// Re-export dependencies for test files
export { buildIR } from '../../src/schema-processing/parsers/openapi/index.js';
export { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';
export { writeOpenApi } from '../../src/schema-processing/writers/openapi/index.js';
export { parseZodSource } from '../../src/schema-processing/parsers/zod/index.js';
