/**
 * Regex Literal Escaping
 *
 * Centralised utility for embedding a plain string literal inside a
 * regular-expression pattern so every character matches itself.
 *
 * Implemented character-by-character without replace() or regex
 * literals, per ADR-026's ban on string-heuristic APIs in product code.
 */

/**
 * Characters with special meaning inside a regular expression.
 * @internal
 */
const REGEX_METACHARACTERS: ReadonlySet<string> = new Set([
  '.',
  '*',
  '+',
  '?',
  '^',
  '$',
  '{',
  '}',
  '(',
  ')',
  '|',
  '[',
  ']',
  '\\',
]);

/**
 * Escape regex metacharacters so a string literal matches itself when
 * embedded in a pattern (e.g. "." becomes "\\.").
 *
 * @param literal - The plain string to embed in a pattern
 * @returns The escaped pattern fragment
 *
 * @public
 */
export function escapeRegexLiteral(literal: string): string {
  let escaped = '';
  for (const char of literal) {
    escaped += REGEX_METACHARACTERS.has(char) ? `\\${char}` : char;
  }
  return escaped;
}
