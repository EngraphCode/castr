import type { Options } from 'prettier';
import { format } from 'prettier';
import parserTypescript from 'prettier/parser-typescript';

/** @see https://github.dev/stephenh/ts-poet/blob/5ea0dbb3c9f1f4b0ee51a54abb2d758102eda4a2/src/Code.ts#L231 */

export async function maybePretty(input: string, options?: Options | null): Promise<string> {
  try {
    // Filter out the plugins field from options to prevent conflicts
    // Prettier 3.x requires explicit plugins, and config-loaded plugins
    // can be undefined/null which causes "Cannot read properties of undefined (reading 'languages')"
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- JC: it really is a pain to do it properly
    const { plugins, ...safeOptions } = options ?? {};

    return await format(input.trim(), {
      parser: 'typescript',
      plugins: [parserTypescript],
      ...safeOptions,
    });
  } catch {
    return input; // assume it's invalid syntax and ignore
  }
}
