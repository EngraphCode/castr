/**
 * Canonical endpoint status-code constants and predicates.
 *
 * Centralizes status-string semantics for template-context transformations.
 *
 * @module context/template-context.status-codes
 */

export const STATUS_DEFAULT = 'default' as const;
export const STATUS_200 = '200' as const;
export const STATUS_201 = '201' as const;
export const STATUS_202 = '202' as const;
export const STATUS_203 = '203' as const;
export const STATUS_204 = '204' as const;
export const STATUS_2XX = '2XX' as const;

const SUCCESS_STATUS_CODES = new Set<string>([
  STATUS_200,
  STATUS_201,
  STATUS_202,
  STATUS_203,
  STATUS_204,
  STATUS_2XX,
]);

/**
 * Return true when a status code is treated as a success response.
 *
 * @param statusCode - HTTP status code token from IR response
 * @returns `true` for configured success statuses
 *
 * @internal
 */
export function isSuccessStatusCode(statusCode: string): boolean {
  return SUCCESS_STATUS_CODES.has(statusCode);
}
