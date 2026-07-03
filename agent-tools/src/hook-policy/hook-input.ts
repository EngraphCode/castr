import { isJsonObject, type JsonObject } from '../collaboration-state/json.js';

import type { ContentChange } from './types.js';

/**
 * Parse JSON text from Claude's hook stdin payload.
 */
export function parseHookInput(hookInputText: string): unknown {
  try {
    return JSON.parse(hookInputText);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown JSON parse failure.';
    throw new Error(`Claude PreToolUse hook input was not valid JSON: ${message}`, {
      cause: error,
    });
  }
}

/**
 * Resolve the tool input object from various Claude hook payload shapes.
 */
function resolveInput(hookInput: unknown): JsonObject {
  if (!isJsonObject(hookInput)) {
    throw new Error('Claude PreToolUse hook input was not an object.');
  }
  if (isJsonObject(hookInput.tool_input)) {
    return hookInput.tool_input;
  }
  if (isJsonObject(hookInput.toolInput)) {
    return hookInput.toolInput;
  }
  return hookInput;
}

/**
 * Extract incoming content, prior-content references, and the target file path
 * from a Claude Edit or Write tool payload.
 *
 * For Edit: `new_string` is the incoming content; `old_string` is the prior;
 * `file_path` (when present) anchors path-scoped checks.
 *
 * For Write: `content` is the incoming content; `file_path` is both the
 * scope anchor AND the prior-content reference. The extraction step never
 * reads the file itself — the read is delegated to the caller.
 *
 * The hook blocks patterns that are being ADDED — present in the new content
 * but absent from the prior content. This allows edits that preserve an
 * already-present pattern without blocking.
 */
export function extractContentChange(hookInput: unknown): ContentChange {
  return extractSingleChange(resolveInput(hookInput));
}

/**
 * Extract every content change carried by a Claude write-capable tool
 * payload. Edit and Write carry exactly one change; MultiEdit carries one
 * change PER edit (`edits: [{ old_string, new_string }, …]`). Per-edit
 * pairs are essential: concatenating the edits would let a pattern removed
 * by one edit mask the same pattern being ADDED by another.
 */
export function extractContentChanges(hookInput: unknown): readonly ContentChange[] {
  const input = resolveInput(hookInput);

  if (Array.isArray(input.edits)) {
    const filePathInfo: { filePath?: string } =
      typeof input.file_path === 'string' ? { filePath: input.file_path } : {};
    return input.edits.map((edit, index) => {
      if (!isJsonObject(edit) || typeof edit.new_string !== 'string') {
        throw new Error(
          `Claude PreToolUse MultiEdit payload edit ${index} did not include a new_string.`,
        );
      }
      const prior = typeof edit.old_string === 'string' ? edit.old_string : '';
      return { newContent: edit.new_string, priorContent: prior, ...filePathInfo };
    });
  }

  return [extractSingleChange(input)];
}

function extractSingleChange(input: JsonObject): ContentChange {
  if (typeof input.new_string === 'string') {
    const prior = typeof input.old_string === 'string' ? input.old_string : '';
    const filePathInfo: { filePath?: string } =
      typeof input.file_path === 'string' ? { filePath: input.file_path } : {};
    return { newContent: input.new_string, priorContent: prior, ...filePathInfo };
  }

  if (typeof input.content === 'string') {
    if (typeof input.file_path === 'string') {
      return {
        newContent: input.content,
        priorContent: '',
        filePath: input.file_path,
        priorFilePath: input.file_path,
      };
    }
    return { newContent: input.content, priorContent: '' };
  }

  throw new Error('Claude PreToolUse hook input did not include writable content.');
}

/**
 * Resolve final new/prior content using an injected prior-content reader.
 */
export function resolveContentPair(
  change: ContentChange,
  readPriorContent: (filePath: string) => string | null,
): { newContent: string; priorContent: string } {
  if (change.priorFilePath === undefined) {
    return { newContent: change.newContent, priorContent: change.priorContent };
  }

  return {
    newContent: change.newContent,
    priorContent: readPriorContent(change.priorFilePath) ?? '',
  };
}

/**
 * Read all text from a stream.
 */
export async function readStreamText(stdin: AsyncIterable<string | Buffer>): Promise<string> {
  let text = '';

  for await (const chunk of stdin) {
    text += chunk.toString();
  }

  return text;
}
