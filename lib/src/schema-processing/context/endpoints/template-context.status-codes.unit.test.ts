/**
 * Unit proof of the canonical status-code predicates.
 *
 * `isSuccessStatusCode` must cover the entire HTTP 2xx success class
 * (RFC 9110 §15.3: any status `200`-`299`) plus the OpenAPI `2XX` range
 * wildcard — not a hand-enumerated subset. `default` is never a success
 * status here; default-only operations are governed by
 * `DefaultStatusBehavior` (docs/DEFAULT-RESPONSE-BEHAVIOR.md).
 */

import { describe, expect, it } from 'vitest';
import { isSuccessStatusCode } from './template-context.status-codes.js';

describe('isSuccessStatusCode', () => {
  it.each(['200', '201', '202', '203', '204', '205', '206', '207', '208', '226', '299'])(
    'treats concrete 2xx status %s as success',
    (statusCode) => {
      expect(isSuccessStatusCode(statusCode)).toBe(true);
    },
  );

  it('treats the 2XX range wildcard as success', () => {
    expect(isSuccessStatusCode('2XX')).toBe(true);
  });

  it.each(['100', '199', '300', '301', '400', '500', '599'])(
    'treats non-2xx concrete status %s as not success',
    (statusCode) => {
      expect(isSuccessStatusCode(statusCode)).toBe(false);
    },
  );

  it.each(['default', '1XX', '3XX', '4XX', '5XX', '2xx', '29', '2999', ''])(
    'treats non-success token %j as not success',
    (statusCode) => {
      expect(isSuccessStatusCode(statusCode)).toBe(false);
    },
  );
});
