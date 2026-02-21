import { describe, expect, it } from 'vitest';
import type { OpenAPIObject } from 'openapi3-ts/oas31';
import type { TemplateContext } from '../schema-processing/context/index.js';
import { CastrSchemaProperties } from '../schema-processing/ir/index.js';
import { generateZodClientFromOpenAPI } from './generate-from-context.js';
import { handleFileGrouping } from './templating.js';
import { assertGroupedFileResult } from '../../tests-helpers/generation-result-assertions.js';
import type { CastrDocument } from '../schema-processing/ir/index.js';

function sortPaths(paths: string[]): string[] {
  return [...paths].sort((left, right) => left.localeCompare(right));
}

function createGroupedSpec(pathOrder: 'alpha-first' | 'zeta-first'): OpenAPIObject {
  const alphaPathItem = {
    get: {
      operationId: 'listAlphaUsers',
      tags: ['alpha'],
      responses: {
        '200': {
          description: 'OK',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
    },
  };

  const zetaPathItem = {
    get: {
      operationId: 'listZetaUsers',
      tags: ['zeta'],
      responses: {
        '200': {
          description: 'OK',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/User' },
            },
          },
        },
      },
    },
  };

  const paths =
    pathOrder === 'alpha-first'
      ? {
          '/alpha/users': alphaPathItem,
          '/zeta/users': zetaPathItem,
        }
      : {
          '/zeta/users': zetaPathItem,
          '/alpha/users': alphaPathItem,
        };

  return {
    openapi: '3.1.0',
    info: {
      title: 'Grouped Determinism API',
      version: '1.0.0',
    },
    paths,
    components: {
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
          },
          required: ['id'],
        },
      },
    },
  };
}

describe('rendering/templating grouped determinism', () => {
  it('keeps grouped result paths in canonical sorted order independent of file insertion order', async () => {
    const ir: CastrDocument = {
      version: '1.0.0',
      openApiVersion: '3.1.0',
      info: { title: 'Grouped Determinism API', version: '1.0.0' },
      servers: [],
      enums: new Map(),
      components: [
        {
          type: 'schema',
          name: 'User',
          schema: {
            type: 'object',
            properties: new CastrSchemaProperties({
              id: {
                type: 'string',
                metadata: {
                  required: true,
                  nullable: false,
                  circularReferences: [],
                  dependencyGraph: { references: [], referencedBy: [], depth: 0 },
                  zodChain: { presence: '', validations: [], defaults: [] },
                },
              },
            }),
            required: ['id'],
            metadata: {
              required: true,
              nullable: false,
              circularReferences: [],
              dependencyGraph: { references: [], referencedBy: [], depth: 0 },
              zodChain: { presence: '', validations: [], defaults: [] },
            },
          },
          metadata: {
            required: true,
            nullable: false,
            circularReferences: [],
            dependencyGraph: { references: [], referencedBy: [], depth: 0 },
            zodChain: { presence: '', validations: [], defaults: [] },
          },
        },
      ],
      operations: [],
      dependencyGraph: {
        nodes: new Map(),
        topologicalOrder: [],
        circularReferences: [],
      },
      schemaNames: [],
    };

    const context: TemplateContext = {
      sortedSchemaNames: ['#/components/schemas/User'],
      endpoints: [],
      endpointsGroups: {},
      commonSchemaNames: new Set(['#/components/schemas/User']),
      mcpTools: [],
      _ir: ir,
    };

    const groupedResult = await handleFileGrouping(
      context,
      { groupStrategy: 'tag-file' },
      false,
      false,
      undefined,
      null,
      false,
    );

    assertGroupedFileResult(groupedResult);

    const sortedFileKeys = sortPaths(Object.keys(groupedResult.files));

    expect(groupedResult.paths).toEqual(sortedFileKeys);
  });

  it('keeps generateZodClientFromOpenAPI grouped paths stable across repeated runs', async () => {
    const openApiDoc = createGroupedSpec('zeta-first');

    const firstRunResult = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
      options: {
        groupStrategy: 'tag-file',
      },
    });
    const secondRunResult = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
      options: {
        groupStrategy: 'tag-file',
      },
    });

    assertGroupedFileResult(firstRunResult);
    assertGroupedFileResult(secondRunResult);

    const firstRunSortedFileKeys = sortPaths(Object.keys(firstRunResult.files));
    const secondRunSortedFileKeys = sortPaths(Object.keys(secondRunResult.files));

    expect(firstRunResult.paths).toEqual(firstRunSortedFileKeys);
    expect(secondRunResult.paths).toEqual(secondRunSortedFileKeys);
    expect(firstRunResult.paths).toEqual(secondRunResult.paths);
  });
});
