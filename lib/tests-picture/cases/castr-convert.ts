import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { join, sep } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { z } from 'zod';

import { generateZodClientFromOpenAPI, type GenerationResult } from '../../src/index.js';
import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

import type { Convert, Converted } from './run-case.js';
import { CASE_COMPONENT } from './schema-case.js';
import { onOneLine } from './verdict.js';

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

async function load(modulePath: string, directory: string): Promise<Converted> {
  let loaded: unknown;
  try {
    loaded = await import(pathToFileURL(modulePath).href);
  } catch (error) {
    const reason = error instanceof Error ? onOneLine(error.message) : String(error);
    return { kind: 'output does not load', reason: reason.replaceAll(directory + sep, '') };
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
    let result: GenerationResult;
    try {
      // Only what Castr itself throws is a cell. A failure to write a file, on either
      // side of this call, rejects and stops the run.
      result = await generateZodClientFromOpenAPI({
        input,
        disableWriteToFile: true,
        template: 'schemas-only',
      });
    } catch (error) {
      // The directory is new on every run; a message must not differ from run to run.
      if (error instanceof Error) {
        error.message = error.message.replaceAll(directory + sep, '');
      }
      return { kind: 'threw', thrown: error };
    }
    if (result.type !== 'single') {
      return { kind: 'no validator' };
    }
    await writeFile(output, result.content, 'utf8');
    return load(output, directory);
  };

  return { convert, dispose: () => rm(directory, { recursive: true, force: true }) };
}
