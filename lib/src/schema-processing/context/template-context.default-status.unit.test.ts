/**
 * Proof that `TemplateContextOptions.defaultStatusBehavior` is consumed by
 * template-context building (H5).
 *
 * The documented contract (docs/DEFAULT-RESPONSE-BEHAVIOR.md):
 * - `'spec-compliant'` (default): endpoints whose only response is `default`
 *   are ignored, with a warning listing them.
 * - `'auto-correct'`: those endpoints are included, treating `default` as the
 *   success response.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MockInstance } from 'vitest';
import { getTemplateContext } from './template-context.js';

function createDocumentWithDefaultOnlyEndpoint(): object {
  return {
    openapi: '3.0.3',
    info: { title: 'Default Status API', version: '1.0.0' },
    paths: {
      '/logout': {
        post: {
          operationId: 'logoutUser',
          responses: {
            default: {
              description: 'Logout response',
              content: { 'application/json': { schema: { type: 'string' } } },
            },
          },
        },
      },
      '/users': {
        get: {
          operationId: 'listUsers',
          responses: {
            '200': {
              description: 'User list',
              content: { 'application/json': { schema: { type: 'number' } } },
            },
          },
        },
      },
    },
  };
}

describe('getTemplateContext defaultStatusBehavior', () => {
  let warnSpy: MockInstance;

  beforeEach(() => {
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('ignores default-only endpoints by default (spec-compliant) and warns', () => {
    const context = getTemplateContext(createDocumentWithDefaultOnlyEndpoint());

    expect(context.endpoints.map((e) => e.alias)).toEqual(['listUsers']);
    expect(warnSpy).toHaveBeenCalledOnce();
    const warning = warnSpy.mock.calls[0]?.join(' ') ?? '';
    expect(warning).toContain('logoutUser');
    expect(warning).toContain('auto-correct');
  });

  it('includes default-only endpoints under auto-correct with default promoted to success', () => {
    const context = getTemplateContext(createDocumentWithDefaultOnlyEndpoint(), {
      defaultStatusBehavior: 'auto-correct',
    });

    const logout = context.endpoints.find((e) => e.alias === 'logoutUser');

    expect(context.endpoints.map((e) => e.alias)).toEqual(['logoutUser', 'listUsers']);
    expect(logout?.response.type).toBe('string');
    expect(logout?.errors).toEqual([]);
    expect(warnSpy).not.toHaveBeenCalled();
  });
});
