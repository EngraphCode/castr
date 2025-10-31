/**
 * Type Guard: Assert value is a string
 *
 * Used in tests to narrow the type of generated code from `string | undefined` to `string`.
 * Follows fail-fast principle from RULES.md.
 *
 * @param value - The value to check
 * @param context - Optional context for error message
 * @throws {Error} If value is not a string
 */
export function assertIsString(value: unknown, context?: string): asserts value is string {
  if (typeof value !== 'string') {
    const contextPart = context ? ` for ${context}` : '';
    throw new Error(`Expected string${contextPart}, got ${typeof value}`);
  }
}
