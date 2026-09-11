import type { Options } from 'prettier';
import { format } from 'prettier';
import parserTypescript from 'prettier/parser-typescript';
import { omit, trim } from 'lodash-es';

/** @see https://github.dev/stephenh/ts-poet/blob/5ea0dbb3c9f1f4b0ee51a54abb2d758102eda4a2/src/Code.ts#L231 */

/**
 * Format generated TypeScript source with Prettier.
 *
 * Fail-fast: if Prettier cannot parse the input, the generated source is
 * invalid TypeScript — a code-generation bug upstream — and this function
 * throws rather than silently passing the broken source through to disk.
 *
 * @param input - Generated TypeScript source to format.
 * @param options - Caller-supplied Prettier options. The `plugins` field is
 *   omitted: Prettier 3.x requires explicit plugin instances, and
 *   config-loaded `plugins` entries can be undefined/null, which crashes
 *   plugin resolution.
 * @returns The formatted source.
 * @throws Error when Prettier fails to format the input. The message names
 *   the offending source and the original formatter error is attached as
 *   `cause`.
 */
export async function maybePretty(input: string, options?: Options | null): Promise<string> {
  const callerOptions: Options = options ?? {};
  const safeOptions = omit(callerOptions, 'plugins');

  try {
    return await format(trim(input), {
      parser: 'typescript',
      plugins: [parserTypescript],
      ...safeOptions,
    });
  } catch (error) {
    throw new Error(
      `maybePretty: Prettier failed to format the generated TypeScript. ` +
        `This indicates invalid generated source upstream. Offending source:\n${input}`,
      { cause: error },
    );
  }
}
