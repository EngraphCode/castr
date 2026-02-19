import { ToolSchema } from '@modelcontextprotocol/sdk/types.js';
import { Project, VariableDeclarationKind } from 'ts-morph';
import { describe, expect, it } from 'vitest';
import type { TemplateContextMcpTool } from '../../context/template-context.mcp.js';
import { createMcpToolWriter } from './mcp.js';

function createMcpTool(propertyOrder: 'alpha-first' | 'zeta-first'): TemplateContextMcpTool {
  const inputSchemaProperties =
    propertyOrder === 'alpha-first'
      ? {
          alpha: { type: 'number' },
          zeta: { type: 'string' },
        }
      : {
          zeta: { type: 'string' },
          alpha: { type: 'number' },
        };

  const tool = ToolSchema.parse({
    name: 'get_users',
    description: 'List users',
    inputSchema: {
      type: 'object',
      properties: inputSchemaProperties,
      required: ['alpha', 'zeta'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
    },
  });

  return {
    tool,
    method: 'get',
    path: '/users',
    originalPath: '/users',
    httpOperation: {
      method: 'get',
      path: '/users',
      originalPath: '/users',
    },
    security: {
      isPublic: true,
      usesGlobalSecurity: false,
      requirementSets: [],
    },
  };
}

describe('writers/typescript/mcp', () => {
  const project = new Project({ useInMemoryFileSystem: true });

  function generate(tool: TemplateContextMcpTool): string {
    const sourceFile = project.createSourceFile('test.ts', '', { overwrite: true });
    sourceFile.addVariableStatement({
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{ name: 'mcpTool', initializer: createMcpToolWriter(tool) }],
    });

    return sourceFile
      .getVariableDeclarationOrThrow('mcpTool')
      .getInitializerOrThrow()
      .getText()
      .replace(/\s+/g, ' ');
  }

  it('keeps nested object keys stable across insertion permutations', () => {
    const outputWithZetaFirst = generate(createMcpTool('zeta-first'));
    const outputWithAlphaFirst = generate(createMcpTool('alpha-first'));
    const alphaPropertyIndex = outputWithZetaFirst.search(
      /alpha\s*:\s*\{\s*type\s*:\s*"number"\s*\}/,
    );
    const zetaPropertyIndex = outputWithZetaFirst.search(
      /zeta\s*:\s*\{\s*type\s*:\s*"string"\s*\}/,
    );

    expect(outputWithZetaFirst).toBe(outputWithAlphaFirst);
    expect(alphaPropertyIndex).toBeGreaterThanOrEqual(0);
    expect(zetaPropertyIndex).toBeGreaterThanOrEqual(0);
    expect(alphaPropertyIndex).toBeLessThan(zetaPropertyIndex);
  });
});
