/**
 * Canonical endpoint status-code constants and predicates.
 *
 * Centralizes status-string semantics for template-context transformations.
 */

import type { StatusRangeToken } from '../../../endpoints/definition.types.js';

export const STATUS_DEFAULT = 'default';

export const DEFAULT_STATUS_SPEC_COMPLIANT = 'spec-compliant';
export const DEFAULT_STATUS_AUTO_CORRECT = 'auto-correct';

/**
 * Controls how endpoints whose only response is `default` are handled.
 *
 * - `'spec-compliant'`: ignore them (with a warning), per the OpenAPI
 *   recommendation to declare explicit status codes.
 * - `'auto-correct'`: include them, treating `default` as the success
 *   response.
 *
 * @see docs/DEFAULT-RESPONSE-BEHAVIOR.md
 */
export type DefaultStatusBehavior =
  typeof DEFAULT_STATUS_SPEC_COMPLIANT | typeof DEFAULT_STATUS_AUTO_CORRECT;
export const STATUS_200 = '200';
export const STATUS_201 = '201';
export const STATUS_202 = '202';
export const STATUS_203 = '203';
export const STATUS_204 = '204';
export const STATUS_2XX = '2XX';

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

const STATUS_RANGE_TOKENS: readonly StatusRangeToken[] = ['1XX', '2XX', '3XX', '4XX', '5XX'];

/**
 * Return true when a status token is an OpenAPI wildcard range (`1XX`-`5XX`).
 *
 * Range tokens are uppercase per the OpenAPI specification; lowercase forms
 * (e.g. `'4xx'`) are not recognized and must fail-fast at the caller.
 *
 * @param value - Status token from an IR response
 * @returns `true` when the token is one of the five range wildcards
 *
 * @internal
 */
export function isStatusRangeToken(value: string): value is StatusRangeToken {
  return STATUS_RANGE_TOKENS.some((token) => token === value);
}

const STATUS_TOKEN_LENGTH = 3;
const CHAR_CODE_DIGIT_0 = 0x30;
const CHAR_CODE_DIGIT_1 = 0x31;
const CHAR_CODE_DIGIT_5 = 0x35;
const CHAR_CODE_DIGIT_9 = 0x39;

function isDigitCharCode(code: number): boolean {
  return code >= CHAR_CODE_DIGIT_0 && code <= CHAR_CODE_DIGIT_9;
}

/**
 * Return true when a status token is a concrete three-digit HTTP status code
 * in the `100`-`599` range.
 *
 * @param value - Status token from an IR response
 * @returns `true` for concrete HTTP status codes
 *
 * @internal
 */
export function isConcreteStatusToken(value: string): boolean {
  if (value.length !== STATUS_TOKEN_LENGTH) {
    return false;
  }
  const firstDigit = value.charCodeAt(0);
  if (firstDigit < CHAR_CODE_DIGIT_1 || firstDigit > CHAR_CODE_DIGIT_5) {
    return false;
  }
  return isDigitCharCode(value.charCodeAt(1)) && isDigitCharCode(value.charCodeAt(2));
}
