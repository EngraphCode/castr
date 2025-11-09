import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { test, expect } from 'vitest';
import { generateZodClientFromOpenAPI } from '../../src/index.js';

test('jsdoc', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/test': {
        get: {
          operationId: '123_example',
          responses: {
            '200': {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/ComplexObject' } },
              },
            },
          },
        },
      },
    },
    components: {
      schemas: {
        SimpleObject: {
          type: 'object',
          properties: {
            str: { type: 'string' },
          },
        },
        ComplexObject: {
          type: 'object',
          properties: {
            example: {
              type: 'string',
              description: 'A string with example tag',
              example: 'example',
            },
            examples: {
              type: 'string',
              description: 'A string with examples tag',
              examples: ['example1', 'example2'],
            },
            manyTagsStr: {
              type: 'string',
              description: 'A string with many tags',
              minLength: 1,
              maxLength: 10,
              pattern: '^[a-z]*$',
              enum: ['a', 'b', 'c'],
            },
            numMin: {
              type: 'number',
              description: 'A number with minimum tag',
              minimum: 0,
            },
            numMax: {
              type: 'number',
              description: 'A number with maximum tag',
              maximum: 10,
            },
            manyTagsNum: {
              type: 'number',
              description: 'A number with many tags',
              minimum: 0,
              maximum: 10,
              default: 5,
              example: 3,
              deprecated: true,
              externalDocs: { url: 'https://example.com' },
            },
            bool: {
              type: 'boolean',
              description: 'A boolean',
              default: true,
            },
            ref: { $ref: '#/components/schemas/SimpleObject' },
            refArray: {
              type: 'array',
              description: 'An array of SimpleObject',
              items: {
                $ref: '#/components/schemas/SimpleObject',
              },
            },
          },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({
    disableWriteToFile: true,
    openApiDoc,
    options: {
      withDocs: true,
      shouldExportAllTypes: true,
    },
  });

  expect(output).toMatchInlineSnapshot(`
    "import { z } from "zod";

    type ComplexObject = Partial<{
      examples: unknown;
      manyTagsStr: "a" | "b" | "c";
      numMin: number;
      numMax: number;
      manyTagsNum: number;
      bool: boolean;
      ref: SimpleObject;
      refArray: Array<SimpleObject>;
    }>;
    type SimpleObject = Partial<{ str: string }>;

    export const SimpleObject: z.ZodType<SimpleObject> = z
      .object({ str: z.string() })
      .partial()
      .strict();
    export const ComplexObject: z.ZodType<ComplexObject> = z
      .object({
        examples: z.unknown(),
        manyTagsStr: z.enum(["a", "b", "c"]).regex(/^[a-z]*$/),
        numMin: z.number().gte(0),
        numMax: z.number().lte(10),
        manyTagsNum: z.number().gte(0).lte(10).default(5),
        bool: z.boolean().default(true),
        ref: SimpleObject,
        refArray: z.array(SimpleObject),
      })
      .partial()
      .strict();

    export const endpoints = [
      {
        method: "get" as const,
        path: "/test",
        operationId: "123_example",
        request: {},
        responses: { 200: { schema: ComplexObject } },
      },
    ] as const;

    /**
     * MCP (Model Context Protocol) tool metadata derived from the OpenAPI document.
     *
     * Each entry provides:
     * - \`tool\`: JSON Schema Draft 07 compliant tool definition (name, description, annotations, schemas)
     * - \`httpOperation\`: source HTTP metadata (method, templated path, original path, operationId)
     * - \`security\`: upstream API security requirements (Layer 2 metadata only)
     *
     * Use \`tool\` when wiring into the MCP SDK, and \`httpOperation\`/\`security\` when presenting
     * additional context to operators or logging.
     */
    export const mcpTools = [
      {
        tool: {
          name: "123_example",
          description: "GET /test",
          inputSchema: {
            type: "object",
          },
          outputSchema: {
            type: "object",
            properties: {
              manyTagsStr: {
                description: "A string with many tags",
                type: "string",
                enum: ["a", "b", "c"],
                minLength: 1,
                maxLength: 10,
                pattern: "^[a-z]*$",
              },
              numMin: {
                description: "A number with minimum tag",
                type: "number",
                minimum: 0,
              },
              numMax: {
                description: "A number with maximum tag",
                type: "number",
                maximum: 10,
              },
              manyTagsNum: {
                description: "A number with many tags",
                default: 5,
                examples: [3],
                type: "number",
                minimum: 0,
                maximum: 10,
              },
              bool: {
                description: "A boolean",
                default: true,
                type: "boolean",
              },
              ref: {
                type: "object",
                properties: {
                  str: {
                    type: "string",
                  },
                },
              },
              refArray: {
                description: "An array of SimpleObject",
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    str: {
                      type: "string",
                    },
                  },
                },
              },
            },
          },
          annotations: {
            readOnlyHint: true,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "get" as const,
          path: "/test",
          originalPath: "/test",
          operationId: "123_example",
        },
        security: {
          isPublic: true,
          usesGlobalSecurity: false,
          requirementSets: [],
        },
      },
    ] as const;
    "
  `);
});
