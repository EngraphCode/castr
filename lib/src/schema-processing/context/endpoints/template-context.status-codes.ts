/**
 * Canonical endpoint status-code constants and predicates.
 *
 * Centralizes status-string semantics for template-context transformations.
 */

import type { StatusRangeToken } from '../../../endpoints/definition.types.js';
import { logger } from '../../../shared/utils/logger.js';

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
export const STATUS_2XX = '2XX';

const CHAR_CODE_DIGIT_2 = 0x32;

/**
 * Return true when a status code is treated as a success response.
 *
 * Success statuses are the entire HTTP 2xx class — every concrete code
 * `'200'`-`'299'`, per RFC 9110 §15.3 ("Successful 2xx"), derived from the
 * range rather than hand-enumerated — plus the OpenAPI `'2XX'` range
 * wildcard. `'default'` is never a success status here; default-only
 * operations are governed by {@link DefaultStatusBehavior}.
 *
 * @param statusCode - HTTP status code token from IR response
 * @returns `true` for 2xx-class statuses and the `2XX` wildcard
 *
 * @internal
 */
export function isSuccessStatusCode(statusCode: string): boolean {
  return (
    statusCode === STATUS_2XX ||
    (isConcreteStatusToken(statusCode) && statusCode.charCodeAt(0) === CHAR_CODE_DIGIT_2)
  );
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

/**
 * Sink for generation-time warnings.
 *
 * Injectable so tests and embedders capture warnings on a fake instead of
 * touching global console state; defaults to {@link logWarnSink}.
 */
export type WarnSink = (message: string) => void;

/**
 * Default {@link WarnSink}: routes to the shared logger's `warn`.
 */
export const logWarnSink: WarnSink = (message) => {
  logger.warn(message);
};

/**
 * The operation surface needed for default-status selection.
 */
interface DefaultStatusOperationLike {
  readonly method: string;
  readonly path: string;
  readonly operationId?: string | undefined;
  readonly responses: readonly { readonly statusCode: string }[];
}

/**
 * Return true when an operation declares responses and every one is `default`.
 *
 * @internal
 */
export function hasOnlyDefaultStatusResponses(
  operation: Pick<DefaultStatusOperationLike, 'responses'>,
): boolean {
  return (
    operation.responses.length > 0 &&
    operation.responses.every((response) => response.statusCode === STATUS_DEFAULT)
  );
}

function formatIgnoredDefaultOnlyOperationsWarning(
  ignored: readonly DefaultStatusOperationLike[],
): string {
  const identifiers = ignored.map(
    (operation) => operation.operationId ?? `${operation.method} ${operation.path}`,
  );
  return (
    'The following endpoints have no status code other than `default` and were ignored as the ' +
    'OpenAPI spec recommends. However they could be added by setting `defaultStatusBehavior` ' +
    `to \`${DEFAULT_STATUS_AUTO_CORRECT}\`: ${identifiers.join(', ')}`
  );
}

/**
 * Select the operations an emitter (endpoint definitions, MCP tools) includes
 * under a {@link DefaultStatusBehavior}.
 *
 * Under `'spec-compliant'`, default-only operations are dropped and a single
 * warning naming them is sent to `warn`. Under `'auto-correct'`, every
 * operation is kept. Shared by the endpoint and MCP builders so both emit
 * the same operation set (docs/DEFAULT-RESPONSE-BEHAVIOR.md).
 *
 * @internal
 */
export function selectOperationsByDefaultStatusBehavior<T extends DefaultStatusOperationLike>(
  operations: readonly T[],
  defaultStatusBehavior: DefaultStatusBehavior,
  warn: WarnSink,
): T[] {
  if (defaultStatusBehavior === DEFAULT_STATUS_AUTO_CORRECT) {
    return [...operations];
  }
  const ignored = operations.filter(hasOnlyDefaultStatusResponses);
  if (ignored.length > 0) {
    warn(formatIgnoredDefaultOnlyOperationsWarning(ignored));
  }
  return operations.filter((operation) => !hasOnlyDefaultStatusResponses(operation));
}
