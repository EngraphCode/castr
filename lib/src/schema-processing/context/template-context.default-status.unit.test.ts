/**
 * Proof that `TemplateContextOptions.defaultStatusBehavior` is consumed by
 * template-context building (H5).
 *
 * The documented contract (docs/DEFAULT-RESPONSE-BEHAVIOR.md):
 * - `'spec-compliant'` (default): operations whose only response is `default`
 *   are ignored — dropped from BOTH endpoint definitions and MCP tools — with
 *   a single warning listing them, routed through the injectable `warnSink`.
 * - `'auto-correct'`: those operations are included (endpoints and MCP tools),
 *   treating `default` as the success response.
 *
 * Warnings are asserted on the injected `warnSink` fake; tests never touch
 * global console state (.agent/rules/no-global-state-in-tests.md).
 */

import { describe, expect, it } from 'vitest';
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

function createWarnSinkFake(): {
  messages: string[];
  warnSink: (message: string) => void;
} {
  const messages: string[] = [];
  return {
    messages,
    warnSink: (message: string): void => {
      messages.push(message);
    },
  };
}

describe('getTemplateContext defaultStatusBehavior', () => {
  it('ignores default-only endpoints by default (spec-compliant) and warns via the injected sink', () => {
    const { messages, warnSink } = createWarnSinkFake();

    const context = getTemplateContext(createDocumentWithDefaultOnlyEndpoint(), { warnSink });

    expect(context.endpoints.map((e) => e.alias)).toEqual(['listUsers']);
    expect(messages).toHaveLength(1);
    expect(messages[0]).toContain('logoutUser');
    expect(messages[0]).toContain('auto-correct');
  });

  it('drops MCP tools for the same ignored default-only operations (spec-compliant)', () => {
    const { messages, warnSink } = createWarnSinkFake();

    const context = getTemplateContext(createDocumentWithDefaultOnlyEndpoint(), { warnSink });

    expect(context.mcpTools.map((tool) => tool.operationId)).toEqual(['listUsers']);
    // The identical ignored set is warned about exactly once, not once per builder.
    expect(messages).toHaveLength(1);
  });

  it('includes default-only endpoints under auto-correct with default promoted to success', () => {
    const { messages, warnSink } = createWarnSinkFake();

    const context = getTemplateContext(createDocumentWithDefaultOnlyEndpoint(), {
      defaultStatusBehavior: 'auto-correct',
      warnSink,
    });

    const logout = context.endpoints.find((e) => e.alias === 'logoutUser');

    expect(context.endpoints.map((e) => e.alias)).toEqual(['logoutUser', 'listUsers']);
    expect(context.mcpTools.map((tool) => tool.operationId)).toEqual(['logoutUser', 'listUsers']);
    expect(logout?.response.type).toBe('string');
    expect(logout?.errors).toEqual([]);
    expect(messages).toEqual([]);
  });
});
