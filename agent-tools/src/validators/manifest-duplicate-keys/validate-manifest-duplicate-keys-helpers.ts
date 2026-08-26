/**
 * Detect duplicate keys within a single JSON object scope by scanning the raw
 * source text. `JSON.parse` resolves duplicates silently (last wins), so any
 * gate that parses first cannot see the defect class; this scanner walks the
 * text itself.
 *
 * Escaped class this gate closes (2026-08-26, PR #62 round 7): an inserted
 * `"test:coverage"` script duplicated an existing sibling in two workspace
 * manifests and passed hooks, CI, and prettier — surfaced only as a
 * non-blocking tsup build warning.
 *
 * The helper is pure (no IO); the runtime that enumerates the repo's manifest
 * estate is in `validate-manifest-duplicate-keys.ts`.
 *
 * @packageDocumentation
 */

/**
 * A duplicate key found within one object scope of a JSON document.
 */
export interface DuplicateKeyViolation {
  /** The duplicated key text (unescaped source form, without quotes). */
  readonly key: string;
  /** 1-indexed line of the duplicate (second or later) occurrence. */
  readonly line: number;
  /** 1-indexed line of the first occurrence of the key in the same scope. */
  readonly firstLine: number;
}

interface ObjectFrame {
  readonly kind: 'object';
  /** First-occurrence line per decoded key in this scope. */
  readonly keys: Map<string, number>;
}

interface ArrayFrame {
  readonly kind: 'array';
}

type Frame = ObjectFrame | ArrayFrame;

const SIMPLE_ESCAPES: ReadonlyMap<string, string> = new Map([
  ['"', '"'],
  ['\\', '\\'],
  ['/', '/'],
  ['b', '\b'],
  ['f', '\f'],
  ['n', '\n'],
  ['r', '\r'],
  ['t', '\t'],
]);

interface LexedString {
  /** Decoded string value (escapes resolved, so `b` equals `b`). */
  readonly value: string;
  /** Index of the character after the closing quote. */
  readonly end: number;
  /** Lines consumed inside the string (raw newlines are invalid JSON but tolerated). */
  readonly linesConsumed: number;
}

/**
 * Lex one JSON string literal starting at its opening quote, decoding escapes
 * so that differently-escaped spellings of one key compare equal (JSON's own
 * key-identity semantics). Simple escapes and `\uXXXX` are decoded; an invalid
 * escape keeps its character literally and a truncated `\u` sequence decodes
 * its parseable hex prefix — this is a scanner for gate purposes, not a
 * validating parser, and JSON validity is owned by the tools that parse these
 * files. Raw newlines inside a string (invalid JSON) are tolerated and
 * counted so later line numbers stay right.
 *
 * @param source - The whole document text.
 * @param openQuoteIndex - Index of the opening `"`.
 * @returns The decoded value, the index after the closing quote, and how many
 *   lines the literal spanned.
 */
function lexString(source: string, openQuoteIndex: number): LexedString {
  let value = '';
  let linesConsumed = 0;
  let i = openQuoteIndex + 1;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '"') {
      return { value, end: i + 1, linesConsumed };
    }
    if (ch === '\\') {
      const next = source[i + 1];
      const simple = next === undefined ? undefined : SIMPLE_ESCAPES.get(next);
      if (simple !== undefined) {
        value += simple;
        i += 2;
        continue;
      }
      if (next === 'u') {
        const hex = source.slice(i + 2, i + 6);
        const code = Number.parseInt(hex, 16);
        value += Number.isNaN(code) ? hex : String.fromCharCode(code);
        i += 6;
        continue;
      }
      // Invalid escape: keep it literally and move on (scanner, not a parser).
      value += next ?? '';
      i += 2;
      continue;
    }
    if (ch === '\n') {
      linesConsumed += 1;
    }
    value += ch;
    i += 1;
  }
  // Unterminated string: treat the tail as the value.
  return { value, end: source.length, linesConsumed };
}

/**
 * Index of the first character at or after `start` that is neither whitespace
 * nor part of a JSONC comment. Look-ahead only: the main scan loop re-walks
 * the same trivia afterwards, so line accounting stays in one place and this
 * helper needs none.
 *
 * @param source - The whole document text.
 * @param start - Index to start skipping from.
 * @returns Index of the next non-trivia character (or `source.length`).
 */
function skipTrivia(source: string, start: number): number {
  let i = start;
  while (i < source.length) {
    if (/\s/.test(source[i])) {
      i += 1;
      continue;
    }
    if (source[i] === '/' && source[i + 1] === '/') {
      const newline = source.indexOf('\n', i);
      i = newline === -1 ? source.length : newline;
      continue;
    }
    if (source[i] === '/' && source[i + 1] === '*') {
      const close = source.indexOf('*/', i + 2);
      i = close === -1 ? source.length : close + 2;
      continue;
    }
    break;
  }
  return i;
}

/**
 * Scan raw JSON text for keys repeated within the same object scope.
 *
 * Strings are lexed with full escape handling, so braces, colons, and quotes
 * inside string values never confuse scope tracking, and differently-escaped
 * spellings of the same key text compare equal after decoding; the same key in
 * two DIFFERENT objects (including sibling objects inside an array) is legal
 * and not reported.
 *
 * @param source - Raw JSON document text.
 * @returns Violations in source order; empty for a duplicate-free document.
 */
export function findDuplicateJsonKeys(source: string): readonly DuplicateKeyViolation[] {
  const violations: DuplicateKeyViolation[] = [];
  const frames: Frame[] = [];
  let line = 1;
  let i = 0;

  while (i < source.length) {
    const ch = source[i];
    if (ch === '\n') {
      line += 1;
      i += 1;
      continue;
    }
    if (ch === '{') {
      frames.push({ kind: 'object', keys: new Map<string, number>() });
      i += 1;
      continue;
    }
    if (ch === '[') {
      frames.push({ kind: 'array' });
      i += 1;
      continue;
    }
    if (ch === '}' || ch === ']') {
      frames.pop();
      i += 1;
      continue;
    }
    if (ch === '/' && source[i + 1] === '/') {
      // JSONC line comment: skip to (not past) the newline so line accounting
      // stays with the main loop. turbo config is JSONC upstream, so quoted
      // key-like text inside a comment must not register as a key.
      const newline = source.indexOf('\n', i);
      i = newline === -1 ? source.length : newline;
      continue;
    }
    if (ch === '/' && source[i + 1] === '*') {
      // JSONC block comment: skip to the terminator, counting spanned lines.
      const close = source.indexOf('*/', i + 2);
      const end = close === -1 ? source.length : close + 2;
      for (let k = i; k < end; k += 1) {
        if (source[k] === '\n') {
          line += 1;
        }
      }
      i = end;
      continue;
    }
    if (ch === '"') {
      const stringLine = line;
      const lexed = lexString(source, i);
      line += lexed.linesConsumed;
      i = lexed.end;

      // A string is a KEY iff the enclosing frame is an object and the next
      // non-trivia character is a colon — JSONC allows comments between a
      // property name and its colon, so trivia includes comments here too.
      const j = skipTrivia(source, i);
      const frame = frames.at(-1);
      if (source[j] === ':' && frame !== undefined && frame.kind === 'object') {
        const firstLine = frame.keys.get(lexed.value);
        if (firstLine === undefined) {
          frame.keys.set(lexed.value, stringLine);
        } else {
          violations.push({ key: lexed.value, line: stringLine, firstLine });
        }
      }
      continue;
    }
    i += 1;
  }

  return violations;
}
