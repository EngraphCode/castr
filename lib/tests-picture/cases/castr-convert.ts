import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { z } from 'zod';

import { generateZodClientFromOpenAPI } from '../../src/index.js';
import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

import type { Convert, Converted } from './run-case.js';
import { CASE_COMPONENT } from './schema-case.js';
import { firstLine } from './verdict.js';

const TEMP_ROOT = fileURLToPath(new URL('../.tmp/', import.meta.url));

function validatorIn(moduleExports: unknown): Converted {
  if (typeof moduleExports !== 'object' || moduleExports === null) {
    return { kind: 'no validator' };
  }
  const exported: unknown = Reflect.get(moduleExports, CASE_COMPONENT);
  if (!(exported instanceof z.ZodType)) {
    return { kind: 'no validator' };
  }
  return { kind: 'validator', accepts: (value) => exported.safeParse(value).success };
}

async function load(modulePath: string): Promise<Converted> {
  let loaded: unknown;
  try {
    loaded = await import(pathToFileURL(modulePath).href);
  } catch (error) {
    const reason = error instanceof Error ? firstLine(error.message) : String(error);
    return { kind: 'output does not load', reason };
  }
  return validatorIn(loaded);
}

/**
 * Castr as a consumer meets it: its public generation function, given a document on
 * disk, and the module it generates, loaded and run.
 *
 * The files live under `tests-picture/.tmp`, inside the package so that the generated
 * module resolves `zod` as a consumer's would, and are removed when `dispose` is called.
 */
export async function createCastrConvert(): Promise<{
  readonly convert: Convert;
  readonly dispose: () => Promise<void>;
}> {
  await mkdir(TEMP_ROOT, { recursive: true });
  const directory = await mkdtemp(join(TEMP_ROOT, 'cases-'));
  let count = 0;

  const convert: Convert = async (document: UnknownRecord) => {
    count += 1;
    const input = join(directory, `case-${String(count)}.json`);
    const output = join(directory, `case-${String(count)}.ts`);
    await writeFile(input, JSON.stringify(document), 'utf8');
    const result = await generateZodClientFromOpenAPI({
      input,
      disableWriteToFile: true,
      template: 'schemas-only',
    });
    if (result.type !== 'single') {
      return { kind: 'no validator' };
    }
    await writeFile(output, result.content, 'utf8');
    return load(output);
  };

  return { convert, dispose: () => rm(directory, { recursive: true, force: true }) };
}
