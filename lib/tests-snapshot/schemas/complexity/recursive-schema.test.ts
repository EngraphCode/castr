import type { SchemaObject, SchemasObject } from 'openapi3-ts/oas30';
import { describe, expect, test } from 'vitest';
import {
  getOpenApiDependencyGraph,
  getZodClientTemplateContext,
  getEndpointDefinitionList,
  getZodSchema,
} from '../../../src/index.js';
import { generateZodClientFromOpenAPI } from '../../../src/generateZodClientFromOpenAPI.js';
import { topologicalSort } from '../../../src/topologicalSort.js';
import type { ConversionTypeContext } from '../../../src/CodeMeta.js';
import { asComponentSchema } from '../../../src/utils.js';

// Note: Recursive inline response/param schemas are a potential future enhancement

const makeOpenApiDoc = (schemas: SchemasObject, responseSchema: SchemaObject) => ({
  openapi: '3.0.3',
  info: { title: 'Swagger Petstore - OpenAPI 3.0', version: '1.0.11' },
  paths: {
    '/example': {
      get: {
        operationId: 'getExample',
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: responseSchema } } },
        },
      },
    },
  },
  components: { schemas },
});

describe('recursive-schema', () => {
  const UserSchema = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      parent: { $ref: '#/components/schemas/User' },
    },
  } as SchemaObject;

  test('indirect single recursive', async () => {
    const schemas = {
      User: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          middle: { $ref: '#/components/schemas/Middle' },
        },
      },
      Middle: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
        },
      },
      Root: {
        type: 'object',
        properties: {
          recursive: {
            $ref: '#/components/schemas/User',
          },
          basic: { type: 'number' },
        },
      },
    } as SchemasObject;
    const doc = {
      openapi: '3.0.0',
      info: { title: '', version: '' },
      paths: {},
      components: { schemas },
    } as const;
    const ctx: ConversionTypeContext = {
      zodSchemaByName: {},
      schemaByName: {},
      doc,
    };
    const rootSchema = schemas['Root'];
    if (!rootSchema) throw new Error('Root schema not found');
    expect(getZodSchema({ schema: rootSchema, ctx })).toMatchInlineSnapshot(
      '"z.object({ recursive: User, basic: z.number() }).partial().passthrough()"',
    );
    expect(ctx).toMatchInlineSnapshot(`
      {
          "doc": {
              "components": {
                  "schemas": {
                      "Middle": {
                          "properties": {
                              "user": {
                                  "$ref": "#/components/schemas/User",
                              },
                          },
                          "type": "object",
                      },
                      "Root": {
                          "properties": {
                              "basic": {
                                  "type": "number",
                              },
                              "recursive": {
                                  "$ref": "#/components/schemas/User",
                              },
                          },
                          "type": "object",
                      },
                      "User": {
                          "properties": {
                              "middle": {
                                  "$ref": "#/components/schemas/Middle",
                              },
                              "name": {
                                  "type": "string",
                              },
                          },
                          "type": "object",
                      },
                  },
              },
              "info": {
                  "title": "",
                  "version": "",
              },
              "openapi": "3.0.0",
              "paths": {},
          },
          "schemaByName": {},
          "zodSchemaByName": {
              "Middle": "z.object({ user: User }).partial().passthrough()",
              "User": "z.object({ name: z.string(), middle: Middle }).partial().passthrough()",
          },
      }
    `);

    const openApiDoc = makeOpenApiDoc(schemas, rootSchema);
    const depsGraph = getOpenApiDependencyGraph(
      Object.keys(ctx.zodSchemaByName).map((name) => asComponentSchema(name)),
      ctx.doc,
    );
    expect(depsGraph).toMatchInlineSnapshot(`
          {
              "deepDependencyGraph": {
                  "#/components/schemas/Middle": Set {
                      "#/components/schemas/User",
                      "#/components/schemas/Middle",
                  },
                  "#/components/schemas/User": Set {
                      "#/components/schemas/Middle",
                      "#/components/schemas/User",
                  },
              },
              "refsDependencyGraph": {
                  "#/components/schemas/Middle": Set {
                      "#/components/schemas/User",
                  },
                  "#/components/schemas/User": Set {
                      "#/components/schemas/Middle",
                  },
              },
          }
        `);

    expect(topologicalSort(depsGraph.refsDependencyGraph)).toMatchInlineSnapshot(`
          [
              "#/components/schemas/User",
              "#/components/schemas/Middle",
          ]
        `);

    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
    });
    expect(prettyOutput).toMatchInlineSnapshot(`
      "import { z } from "zod";

      type User = Partial<{ name: string; middle: Middle }>;
      type Middle = Partial<{ user: User }>;

      export const Middle: z.ZodType<Middle> = z.lazy(() =>
        z.object({ user: User }).partial().strict(),
      );
      export const User: z.ZodType<User> = z.lazy(() =>
        z.object({ name: z.string(), middle: Middle }).partial().strict(),
      );
      export const Root = z
        .object({ recursive: User, basic: z.number() })
        .partial()
        .strict();

      export const endpoints = [
        {
          method: "get" as const,
          path: "/example",
          operationId: "getExample",
          request: {},
          responses: {
            200: {
              description: "OK",
              schema: z
                .object({ recursive: User, basic: z.number() })
                .partial()
                .strict(),
            },
          },
        },
      ] as const;

      /**
       * MCP (Model Context Protocol) compatible tool definitions.
       *
       * Each endpoint is transformed into an MCP tool with:
       * - \`name\`: Unique identifier (operationId or auto-generated from method + path)
       * - \`description\`: Human-readable description of the tool's purpose
       * - \`inputSchema\`: Consolidated Zod schema for all request parameters (path, query, headers, body)
       * - \`outputSchema\`: Zod schema for the primary success response (200/201) or z.unknown()
       *
       * MCP tools use a consolidated input structure (all params in one object) rather than
       * the separated structure in \`endpoints\`, making them optimized for AI tool integration.
       * The output schema focuses on the "happy path" (primary success response). Error handling
       * is typically done at the protocol level.
       *
       * @see https://anthropic.com/mcp - Model Context Protocol specification
       * @example
       * \`\`\`typescript
       * import { mcpTools } from "./api";
       *
       * // AI assistant discovers and validates tool usage
       * const tool = mcpTools.find(t => t.name === "getUserById");
       * const input = tool.inputSchema.parse({
       *   path: { userId: "123" },
       *   query: { include: "profile" }
       * });
       * \`\`\`
       */
      export const mcpTools = endpoints.map((endpoint) => {
        // Build consolidated params object from all request parameter types
        // MCP requires a single inputSchema, not separated path/query/headers/body
        const params: Record<string, z.ZodTypeAny> = {};
        if (endpoint.request?.pathParams) params.path = endpoint.request.pathParams;
        if (endpoint.request?.queryParams)
          params.query = endpoint.request.queryParams;
        if (endpoint.request?.headers) params.headers = endpoint.request.headers;
        if (endpoint.request?.body) params.body = endpoint.request.body;

        return {
          // Use operationId for the canonical name, with fallback to generated name
          name:
            endpoint.operationId ||
            \`\${endpoint.method}_\${endpoint.path.replace(/[\\/{}]/g, "_")}\`,
          // Provide description for AI context
          description:
            endpoint.description ||
            \`\${endpoint.method.toUpperCase()} \${endpoint.path}\`,
          // Consolidated input schema (path, query, headers, body all nested)
          inputSchema:
            Object.keys(params).length > 0 ? z.object(params) : z.object({}),
          // Primary success response (200 or 201), fallback to z.unknown() for safety
          outputSchema:
            endpoint.responses[200]?.schema ||
            endpoint.responses[201]?.schema ||
            z.unknown(),
        };
      }) as const;
      "
    `);
  });

  const ObjectWithRecursiveArray = {
    type: 'object',
    properties: {
      isInsideObjectWithRecursiveArray: { type: 'boolean' },
      array: {
        type: 'array',
        items: {
          $ref: '#/components/schemas/ObjectWithRecursiveArray',
        },
      },
    },
  } as SchemaObject;
  const schemas2 = { ObjectWithRecursiveArray };
  const ResponseSchema = {
    type: 'object',
    properties: {
      recursiveRef: {
        $ref: '#/components/schemas/ObjectWithRecursiveArray',
      },
      basic: { type: 'number' },
    },
  } as SchemaObject;

  test('recursive array', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: '', version: '' },
      paths: {},
      components: { schemas },
    } as const;
    const ctx: ConversionTypeContext = {
      zodSchemaByName: {},
      schemaByName: {},
      doc,
    };
    expect(getZodSchema({ schema: ResponseSchema, ctx })).toMatchInlineSnapshot(
      '"z.object({ recursiveRef: ObjectWithRecursiveArray, basic: z.number() }).partial().passthrough()"',
    );
    expect(ctx).toMatchInlineSnapshot(`
      {
          "doc": {
              "components": {
                  "schemas": {
                      "Friend": {
                          "properties": {
                              "circle": {
                                  "items": {
                                      "$ref": "#/components/schemas/Friend",
                                  },
                                  "type": "array",
                              },
                              "nickname": {
                                  "type": "string",
                              },
                              "user": {
                                  "$ref": "#/components/schemas/UserWithFriends",
                              },
                          },
                          "type": "object",
                      },
                      "ObjectWithRecursiveArray": {
                          "properties": {
                              "array": {
                                  "items": {
                                      "$ref": "#/components/schemas/ObjectWithRecursiveArray",
                                  },
                                  "type": "array",
                              },
                              "isInsideObjectWithRecursiveArray": {
                                  "type": "boolean",
                              },
                          },
                          "type": "object",
                      },
                      "ResponseSchema": {
                          "properties": {
                              "basic": {
                                  "type": "number",
                              },
                              "recursiveRef": {
                                  "$ref": "#/components/schemas/ObjectWithRecursiveArray",
                              },
                          },
                          "type": "object",
                      },
                      "User": {
                          "properties": {
                              "name": {
                                  "type": "string",
                              },
                              "parent": {
                                  "$ref": "#/components/schemas/User",
                              },
                          },
                          "type": "object",
                      },
                      "UserWithFriends": {
                          "properties": {
                              "bestFriend": {
                                  "$ref": "#/components/schemas/Friend",
                              },
                              "friends": {
                                  "items": {
                                      "$ref": "#/components/schemas/Friend",
                                  },
                                  "type": "array",
                              },
                              "name": {
                                  "type": "string",
                              },
                              "parent": {
                                  "$ref": "#/components/schemas/UserWithFriends",
                              },
                          },
                          "type": "object",
                      },
                  },
              },
              "info": {
                  "title": "",
                  "version": "",
              },
              "openapi": "3.0.0",
              "paths": {},
          },
          "schemaByName": {},
          "zodSchemaByName": {
              "ObjectWithRecursiveArray": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(ObjectWithRecursiveArray) }).partial().passthrough()",
          },
      }
    `);

    expect(getEndpointDefinitionList(makeOpenApiDoc(schemas2, ResponseSchema)))
      .toMatchInlineSnapshot(`
        {
            "deepDependencyGraph": {
                "#/components/schemas/ObjectWithRecursiveArray": Set {
                    "#/components/schemas/ObjectWithRecursiveArray",
                },
            },
            "doc": {
                "components": {
                    "schemas": {
                        "ObjectWithRecursiveArray": {
                            "properties": {
                                "array": {
                                    "items": {
                                        "$ref": "#/components/schemas/ObjectWithRecursiveArray",
                                    },
                                    "type": "array",
                                },
                                "isInsideObjectWithRecursiveArray": {
                                    "type": "boolean",
                                },
                            },
                            "type": "object",
                        },
                    },
                },
                "info": {
                    "title": "Swagger Petstore - OpenAPI 3.0",
                    "version": "1.0.11",
                },
                "openapi": "3.0.3",
                "paths": {
                    "/example": {
                        "get": {
                            "operationId": "getExample",
                            "responses": {
                                "200": {
                                    "content": {
                                        "application/json": {
                                            "schema": {
                                                "properties": {
                                                    "basic": {
                                                        "type": "number",
                                                    },
                                                    "recursiveRef": {
                                                        "$ref": "#/components/schemas/ObjectWithRecursiveArray",
                                                    },
                                                },
                                                "type": "object",
                                            },
                                        },
                                    },
                                    "description": "OK",
                                },
                            },
                        },
                    },
                },
            },
            "endpoints": [
                {
                    "errors": [],
                    "method": "get",
                    "parameters": [],
                    "path": "/example",
                    "requestFormat": "json",
                    "response": "z.object({ recursiveRef: ObjectWithRecursiveArray, basic: z.number() }).partial().passthrough()",
                },
            ],
            "issues": {
                "ignoredFallbackResponse": [],
                "ignoredGenericError": [],
            },
            "refsDependencyGraph": {
                "#/components/schemas/ObjectWithRecursiveArray": Set {
                    "#/components/schemas/ObjectWithRecursiveArray",
                },
            },
            "schemaByName": {},
            "zodSchemaByName": {
                "ObjectWithRecursiveArray": "z.object({ isInsideObjectWithRecursiveArray: z.boolean(), array: z.array(ObjectWithRecursiveArray) }).partial().passthrough()",
            },
        }
      `);
  });

  test('direct recursive', () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: '', version: '' },
      paths: {},
      components: { schemas },
    } as const;
    const ctx: ConversionTypeContext = {
      zodSchemaByName: {},
      schemaByName: {},
      doc,
    };
    expect(getZodSchema({ schema: UserSchema, ctx })).toMatchInlineSnapshot(
      '"z.object({ name: z.string(), parent: User }).partial().passthrough()"',
    );
    expect(ctx).toMatchInlineSnapshot(`
      {
          "doc": {
              "components": {
                  "schemas": {
                      "Friend": {
                          "properties": {
                              "circle": {
                                  "items": {
                                      "$ref": "#/components/schemas/Friend",
                                  },
                                  "type": "array",
                              },
                              "nickname": {
                                  "type": "string",
                              },
                              "user": {
                                  "$ref": "#/components/schemas/UserWithFriends",
                              },
                          },
                          "type": "object",
                      },
                      "ObjectWithRecursiveArray": {
                          "properties": {
                              "array": {
                                  "items": {
                                      "$ref": "#/components/schemas/ObjectWithRecursiveArray",
                                  },
                                  "type": "array",
                              },
                              "isInsideObjectWithRecursiveArray": {
                                  "type": "boolean",
                              },
                          },
                          "type": "object",
                      },
                      "ResponseSchema": {
                          "properties": {
                              "basic": {
                                  "type": "number",
                              },
                              "recursiveRef": {
                                  "$ref": "#/components/schemas/ObjectWithRecursiveArray",
                              },
                          },
                          "type": "object",
                      },
                      "User": {
                          "properties": {
                              "name": {
                                  "type": "string",
                              },
                              "parent": {
                                  "$ref": "#/components/schemas/User",
                              },
                          },
                          "type": "object",
                      },
                      "UserWithFriends": {
                          "properties": {
                              "bestFriend": {
                                  "$ref": "#/components/schemas/Friend",
                              },
                              "friends": {
                                  "items": {
                                      "$ref": "#/components/schemas/Friend",
                                  },
                                  "type": "array",
                              },
                              "name": {
                                  "type": "string",
                              },
                              "parent": {
                                  "$ref": "#/components/schemas/UserWithFriends",
                              },
                          },
                          "type": "object",
                      },
                  },
              },
              "info": {
                  "title": "",
                  "version": "",
              },
              "openapi": "3.0.0",
              "paths": {},
          },
          "schemaByName": {},
          "zodSchemaByName": {
              "User": "z.object({ name: z.string(), parent: User }).partial().passthrough()",
          },
      }
    `);
  });

  const UserWithFriends = {
    type: 'object',
    properties: {
      name: { type: 'string' },
      parent: { $ref: '#/components/schemas/UserWithFriends' },
      friends: { type: 'array', items: { $ref: '#/components/schemas/Friend' } },
      bestFriend: { $ref: '#/components/schemas/Friend' },
    },
  } as SchemaObject;

  const Friend = {
    type: 'object',
    properties: {
      nickname: { type: 'string' },
      user: { $ref: '#/components/schemas/UserWithFriends' },
      circle: { type: 'array', items: { $ref: '#/components/schemas/Friend' } },
    },
  } as SchemaObject;
  const schemas = {
    User: UserSchema,
    UserWithFriends,
    Friend,
    ResponseSchema,
    ObjectWithRecursiveArray,
  };

  test('multiple recursive in one root schema', async () => {
    const doc = {
      openapi: '3.0.0',
      info: { title: '', version: '' },
      paths: {},
      components: { schemas },
    } as const;
    const ctx: ConversionTypeContext = {
      zodSchemaByName: {},
      schemaByName: {},
      doc,
    };
    expect(
      getZodSchema({
        schema: {
          type: 'object',
          properties: {
            recursiveUser: {
              $ref: '#/components/schemas/UserWithFriends',
            },
            basic: { type: 'number' },
          },
        },
        ctx,
      }),
    ).toMatchInlineSnapshot(
      '"z.object({ recursiveUser: UserWithFriends, basic: z.number() }).partial().passthrough()"',
    );
    expect(ctx).toMatchInlineSnapshot(`
      {
          "doc": {
              "components": {
                  "schemas": {
                      "Friend": {
                          "properties": {
                              "circle": {
                                  "items": {
                                      "$ref": "#/components/schemas/Friend",
                                  },
                                  "type": "array",
                              },
                              "nickname": {
                                  "type": "string",
                              },
                              "user": {
                                  "$ref": "#/components/schemas/UserWithFriends",
                              },
                          },
                          "type": "object",
                      },
                      "ObjectWithRecursiveArray": {
                          "properties": {
                              "array": {
                                  "items": {
                                      "$ref": "#/components/schemas/ObjectWithRecursiveArray",
                                  },
                                  "type": "array",
                              },
                              "isInsideObjectWithRecursiveArray": {
                                  "type": "boolean",
                              },
                          },
                          "type": "object",
                      },
                      "ResponseSchema": {
                          "properties": {
                              "basic": {
                                  "type": "number",
                              },
                              "recursiveRef": {
                                  "$ref": "#/components/schemas/ObjectWithRecursiveArray",
                              },
                          },
                          "type": "object",
                      },
                      "User": {
                          "properties": {
                              "name": {
                                  "type": "string",
                              },
                              "parent": {
                                  "$ref": "#/components/schemas/User",
                              },
                          },
                          "type": "object",
                      },
                      "UserWithFriends": {
                          "properties": {
                              "bestFriend": {
                                  "$ref": "#/components/schemas/Friend",
                              },
                              "friends": {
                                  "items": {
                                      "$ref": "#/components/schemas/Friend",
                                  },
                                  "type": "array",
                              },
                              "name": {
                                  "type": "string",
                              },
                              "parent": {
                                  "$ref": "#/components/schemas/UserWithFriends",
                              },
                          },
                          "type": "object",
                      },
                  },
              },
              "info": {
                  "title": "",
                  "version": "",
              },
              "openapi": "3.0.0",
              "paths": {},
          },
          "schemaByName": {},
          "zodSchemaByName": {
              "Friend": "z.object({ nickname: z.string(), user: UserWithFriends, circle: z.array(Friend) }).partial().passthrough()",
              "UserWithFriends": "z.object({ name: z.string(), parent: UserWithFriends, friends: z.array(Friend), bestFriend: Friend }).partial().passthrough()",
          },
      }
    `);

    const openApiDoc = makeOpenApiDoc(schemas, {
      type: 'object',
      properties: {
        someUser: {
          $ref: '#/components/schemas/UserWithFriends',
        },
        someProp: { type: 'boolean' },
      },
    });

    expect(getEndpointDefinitionList(openApiDoc)).toMatchInlineSnapshot(`
      {
          "deepDependencyGraph": {
              "#/components/schemas/Friend": Set {
                  "#/components/schemas/UserWithFriends",
                  "#/components/schemas/Friend",
              },
              "#/components/schemas/ObjectWithRecursiveArray": Set {
                  "#/components/schemas/ObjectWithRecursiveArray",
              },
              "#/components/schemas/ResponseSchema": Set {
                  "#/components/schemas/ObjectWithRecursiveArray",
              },
              "#/components/schemas/User": Set {
                  "#/components/schemas/User",
              },
              "#/components/schemas/UserWithFriends": Set {
                  "#/components/schemas/UserWithFriends",
                  "#/components/schemas/Friend",
              },
          },
          "doc": {
              "components": {
                  "schemas": {
                      "Friend": {
                          "properties": {
                              "circle": {
                                  "items": {
                                      "$ref": "#/components/schemas/Friend",
                                  },
                                  "type": "array",
                              },
                              "nickname": {
                                  "type": "string",
                              },
                              "user": {
                                  "$ref": "#/components/schemas/UserWithFriends",
                              },
                          },
                          "type": "object",
                      },
                      "ObjectWithRecursiveArray": {
                          "properties": {
                              "array": {
                                  "items": {
                                      "$ref": "#/components/schemas/ObjectWithRecursiveArray",
                                  },
                                  "type": "array",
                              },
                              "isInsideObjectWithRecursiveArray": {
                                  "type": "boolean",
                              },
                          },
                          "type": "object",
                      },
                      "ResponseSchema": {
                          "properties": {
                              "basic": {
                                  "type": "number",
                              },
                              "recursiveRef": {
                                  "$ref": "#/components/schemas/ObjectWithRecursiveArray",
                              },
                          },
                          "type": "object",
                      },
                      "User": {
                          "properties": {
                              "name": {
                                  "type": "string",
                              },
                              "parent": {
                                  "$ref": "#/components/schemas/User",
                              },
                          },
                          "type": "object",
                      },
                      "UserWithFriends": {
                          "properties": {
                              "bestFriend": {
                                  "$ref": "#/components/schemas/Friend",
                              },
                              "friends": {
                                  "items": {
                                      "$ref": "#/components/schemas/Friend",
                                  },
                                  "type": "array",
                              },
                              "name": {
                                  "type": "string",
                              },
                              "parent": {
                                  "$ref": "#/components/schemas/UserWithFriends",
                              },
                          },
                          "type": "object",
                      },
                  },
              },
              "info": {
                  "title": "Swagger Petstore - OpenAPI 3.0",
                  "version": "1.0.11",
              },
              "openapi": "3.0.3",
              "paths": {
                  "/example": {
                      "get": {
                          "operationId": "getExample",
                          "responses": {
                              "200": {
                                  "content": {
                                      "application/json": {
                                          "schema": {
                                              "properties": {
                                                  "someProp": {
                                                      "type": "boolean",
                                                  },
                                                  "someUser": {
                                                      "$ref": "#/components/schemas/UserWithFriends",
                                                  },
                                              },
                                              "type": "object",
                                          },
                                      },
                                  },
                                  "description": "OK",
                              },
                          },
                      },
                  },
              },
          },
          "endpoints": [
              {
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/example",
                  "requestFormat": "json",
                  "response": "z.object({ someUser: UserWithFriends, someProp: z.boolean() }).partial().passthrough()",
              },
          ],
          "issues": {
              "ignoredFallbackResponse": [],
              "ignoredGenericError": [],
          },
          "refsDependencyGraph": {
              "#/components/schemas/Friend": Set {
                  "#/components/schemas/UserWithFriends",
                  "#/components/schemas/Friend",
              },
              "#/components/schemas/ObjectWithRecursiveArray": Set {
                  "#/components/schemas/ObjectWithRecursiveArray",
              },
              "#/components/schemas/ResponseSchema": Set {
                  "#/components/schemas/ObjectWithRecursiveArray",
              },
              "#/components/schemas/User": Set {
                  "#/components/schemas/User",
              },
              "#/components/schemas/UserWithFriends": Set {
                  "#/components/schemas/UserWithFriends",
                  "#/components/schemas/Friend",
              },
          },
          "schemaByName": {},
          "zodSchemaByName": {
              "Friend": "z.object({ nickname: z.string(), user: UserWithFriends, circle: z.array(Friend) }).partial().passthrough()",
              "UserWithFriends": "z.object({ name: z.string(), parent: UserWithFriends, friends: z.array(Friend), bestFriend: Friend }).partial().passthrough()",
          },
      }
    `);

    const templateCtx = getZodClientTemplateContext(openApiDoc);
    expect(templateCtx).toMatchInlineSnapshot(`
      {
          "circularTypeByName": {
              "Friend": true,
              "UserWithFriends": true,
          },
          "emittedType": {
              "Friend": true,
              "ObjectWithRecursiveArray": true,
              "User": true,
              "UserWithFriends": true,
          },
          "endpoints": [
              {
                  "errors": [],
                  "method": "get",
                  "parameters": [],
                  "path": "/example",
                  "requestFormat": "json",
                  "response": "z.object({ someUser: UserWithFriends, someProp: z.boolean() }).partial().passthrough()",
              },
          ],
          "endpointsGroups": {},
          "options": {
              "baseUrl": "",
              "withAlias": false,
          },
          "schemas": {
              "Friend": "z.lazy(() => z.object({ nickname: z.string(), user: UserWithFriends, circle: z.array(Friend) }).partial().passthrough())",
              "UserWithFriends": "z.lazy(() => z.object({ name: z.string(), parent: UserWithFriends, friends: z.array(Friend), bestFriend: Friend }).partial().passthrough())",
          },
          "types": {
              "Friend": "type Friend = Partial<{ nickname: string; user: UserWithFriends; circle: Array<Friend> }>;",
              "ObjectWithRecursiveArray": "type ObjectWithRecursiveArray = Partial<{ isInsideObjectWithRecursiveArray: boolean; array: Array<ObjectWithRecursiveArray> }>;",
              "User": "type User = Partial<{ name: string; parent: User }>;",
              "UserWithFriends": "type UserWithFriends = Partial<{ name: string; parent: UserWithFriends; friends: Array<Friend>; bestFriend: Friend }>;",
          },
      }
    `);

    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
    });
    expect(prettyOutput).toMatchInlineSnapshot(`
      "import { z } from "zod";

      type User = Partial<{ name: string; parent: User }>;
      type UserWithFriends = Partial<{
        name: string;
        parent: UserWithFriends;
        friends: Array<Friend>;
        bestFriend: Friend;
      }>;
      type Friend = Partial<{
        nickname: string;
        user: UserWithFriends;
        circle: Array<Friend>;
      }>;
      type ObjectWithRecursiveArray = Partial<{
        isInsideObjectWithRecursiveArray: boolean;
        array: Array<ObjectWithRecursiveArray>;
      }>;

      export const Friend: z.ZodType<Friend> = z.lazy(() =>
        z
          .object({
            nickname: z.string(),
            user: UserWithFriends,
            circle: z.array(Friend),
          })
          .partial()
          .strict(),
      );
      export const UserWithFriends: z.ZodType<UserWithFriends> = z.lazy(() =>
        z
          .object({
            name: z.string(),
            parent: UserWithFriends,
            friends: z.array(Friend),
            bestFriend: Friend,
          })
          .partial()
          .strict(),
      );
      export const User: z.ZodType<User> = z.lazy(() =>
        z.object({ name: z.string(), parent: User }).partial().strict(),
      );
      export const ObjectWithRecursiveArray: z.ZodType<ObjectWithRecursiveArray> =
        z.lazy(() =>
          z
            .object({
              isInsideObjectWithRecursiveArray: z.boolean(),
              array: z.array(ObjectWithRecursiveArray),
            })
            .partial()
            .strict(),
        );
      export const ResponseSchema = z
        .object({ recursiveRef: ObjectWithRecursiveArray, basic: z.number() })
        .partial()
        .strict();

      export const endpoints = [
        {
          method: "get" as const,
          path: "/example",
          operationId: "getExample",
          request: {},
          responses: {
            200: {
              description: "OK",
              schema: z
                .object({ someUser: UserWithFriends, someProp: z.boolean() })
                .partial()
                .strict(),
            },
          },
        },
      ] as const;

      /**
       * MCP (Model Context Protocol) compatible tool definitions.
       *
       * Each endpoint is transformed into an MCP tool with:
       * - \`name\`: Unique identifier (operationId or auto-generated from method + path)
       * - \`description\`: Human-readable description of the tool's purpose
       * - \`inputSchema\`: Consolidated Zod schema for all request parameters (path, query, headers, body)
       * - \`outputSchema\`: Zod schema for the primary success response (200/201) or z.unknown()
       *
       * MCP tools use a consolidated input structure (all params in one object) rather than
       * the separated structure in \`endpoints\`, making them optimized for AI tool integration.
       * The output schema focuses on the "happy path" (primary success response). Error handling
       * is typically done at the protocol level.
       *
       * @see https://anthropic.com/mcp - Model Context Protocol specification
       * @example
       * \`\`\`typescript
       * import { mcpTools } from "./api";
       *
       * // AI assistant discovers and validates tool usage
       * const tool = mcpTools.find(t => t.name === "getUserById");
       * const input = tool.inputSchema.parse({
       *   path: { userId: "123" },
       *   query: { include: "profile" }
       * });
       * \`\`\`
       */
      export const mcpTools = endpoints.map((endpoint) => {
        // Build consolidated params object from all request parameter types
        // MCP requires a single inputSchema, not separated path/query/headers/body
        const params: Record<string, z.ZodTypeAny> = {};
        if (endpoint.request?.pathParams) params.path = endpoint.request.pathParams;
        if (endpoint.request?.queryParams)
          params.query = endpoint.request.queryParams;
        if (endpoint.request?.headers) params.headers = endpoint.request.headers;
        if (endpoint.request?.body) params.body = endpoint.request.body;

        return {
          // Use operationId for the canonical name, with fallback to generated name
          name:
            endpoint.operationId ||
            \`\${endpoint.method}_\${endpoint.path.replace(/[\\/{}]/g, "_")}\`,
          // Provide description for AI context
          description:
            endpoint.description ||
            \`\${endpoint.method.toUpperCase()} \${endpoint.path}\`,
          // Consolidated input schema (path, query, headers, body all nested)
          inputSchema:
            Object.keys(params).length > 0 ? z.object(params) : z.object({}),
          // Primary success response (200 or 201), fallback to z.unknown() for safety
          outputSchema:
            endpoint.responses[200]?.schema ||
            endpoint.responses[201]?.schema ||
            z.unknown(),
        };
      }) as const;
      "
    `);
  });

  test('recursive schema with $ref to another simple schema should still generate and output that simple schema and its dependencies', async () => {
    const Playlist = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        author: { $ref: '#/components/schemas/Author' },
        songs: { type: 'array', items: { $ref: '#/components/schemas/Song' } },
      },
    } as SchemaObject;

    const Song = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        duration: { type: 'number' },
        in_playlists: { type: 'array', items: { $ref: '#/components/schemas/Playlist' } },
      },
    } as SchemaObject;

    const Author = {
      type: 'object',
      properties: {
        name: { type: 'string' },
        mail: { type: 'string' },
        settings: { $ref: '#/components/schemas/Settings' },
      },
    } as SchemaObject;
    const Settings = {
      type: 'object',
      properties: {
        theme_color: { type: 'string' },
      },
    } as SchemaObject;
    const schemas = { Playlist, Song, Author, Settings };

    const doc = {
      openapi: '3.0.0',
      info: { title: '', version: '' },
      paths: {},
      components: { schemas },
    } as const;
    const ctx: ConversionTypeContext = {
      zodSchemaByName: {},
      schemaByName: {},
      doc,
    };

    const RootSchema = {
      type: 'object',
      properties: {
        playlist: { $ref: '#/components/schemas/Playlist' },
        by_author: { $ref: '#/components/schemas/Author' },
      },
    } as SchemaObject;
    expect(getZodSchema({ schema: RootSchema, ctx })).toMatchInlineSnapshot(
      '"z.object({ playlist: Playlist, by_author: Author }).partial().passthrough()"',
    );
    expect(ctx).toMatchInlineSnapshot(`
      {
          "doc": {
              "components": {
                  "schemas": {
                      "Author": {
                          "properties": {
                              "mail": {
                                  "type": "string",
                              },
                              "name": {
                                  "type": "string",
                              },
                              "settings": {
                                  "$ref": "#/components/schemas/Settings",
                              },
                          },
                          "type": "object",
                      },
                      "Playlist": {
                          "properties": {
                              "author": {
                                  "$ref": "#/components/schemas/Author",
                              },
                              "name": {
                                  "type": "string",
                              },
                              "songs": {
                                  "items": {
                                      "$ref": "#/components/schemas/Song",
                                  },
                                  "type": "array",
                              },
                          },
                          "type": "object",
                      },
                      "Settings": {
                          "properties": {
                              "theme_color": {
                                  "type": "string",
                              },
                          },
                          "type": "object",
                      },
                      "Song": {
                          "properties": {
                              "duration": {
                                  "type": "number",
                              },
                              "in_playlists": {
                                  "items": {
                                      "$ref": "#/components/schemas/Playlist",
                                  },
                                  "type": "array",
                              },
                              "name": {
                                  "type": "string",
                              },
                          },
                          "type": "object",
                      },
                  },
              },
              "info": {
                  "title": "",
                  "version": "",
              },
              "openapi": "3.0.0",
              "paths": {},
          },
          "schemaByName": {},
          "zodSchemaByName": {
              "Author": "z.object({ name: z.string(), mail: z.string(), settings: Settings }).partial().passthrough()",
              "Playlist": "z.object({ name: z.string(), author: Author, songs: z.array(Song) }).partial().passthrough()",
              "Settings": "z.object({ theme_color: z.string() }).partial().passthrough()",
              "Song": "z.object({ name: z.string(), duration: z.number(), in_playlists: z.array(Playlist) }).partial().passthrough()",
          },
      }
    `);

    const openApiDoc = makeOpenApiDoc(schemas, RootSchema);
    const prettyOutput = await generateZodClientFromOpenAPI({
      openApiDoc,
      disableWriteToFile: true,
    });
    expect(prettyOutput).toMatchInlineSnapshot(`
      "import { z } from "zod";

      type Playlist = Partial<{ name: string; author: Author; songs: Array<Song> }>;
      type Author = Partial<{ name: string; mail: string; settings: Settings }>;
      type Settings = Partial<{ theme_color: string }>;
      type Song = Partial<{
        name: string;
        duration: number;
        in_playlists: Array<Playlist>;
      }>;

      export const Settings = z
        .object({ theme_color: z.string() })
        .partial()
        .strict();
      export const Author = z
        .object({ name: z.string(), mail: z.string(), settings: Settings })
        .partial()
        .strict();
      export const Song: z.ZodType<Song> = z.lazy(() =>
        z
          .object({
            name: z.string(),
            duration: z.number(),
            in_playlists: z.array(Playlist),
          })
          .partial()
          .strict(),
      );
      export const Playlist: z.ZodType<Playlist> = z.lazy(() =>
        z
          .object({ name: z.string(), author: Author, songs: z.array(Song) })
          .partial()
          .strict(),
      );

      export const endpoints = [
        {
          method: "get" as const,
          path: "/example",
          operationId: "getExample",
          request: {},
          responses: {
            200: {
              description: "OK",
              schema: z
                .object({ playlist: Playlist, by_author: Author })
                .partial()
                .strict(),
            },
          },
        },
      ] as const;

      /**
       * MCP (Model Context Protocol) compatible tool definitions.
       *
       * Each endpoint is transformed into an MCP tool with:
       * - \`name\`: Unique identifier (operationId or auto-generated from method + path)
       * - \`description\`: Human-readable description of the tool's purpose
       * - \`inputSchema\`: Consolidated Zod schema for all request parameters (path, query, headers, body)
       * - \`outputSchema\`: Zod schema for the primary success response (200/201) or z.unknown()
       *
       * MCP tools use a consolidated input structure (all params in one object) rather than
       * the separated structure in \`endpoints\`, making them optimized for AI tool integration.
       * The output schema focuses on the "happy path" (primary success response). Error handling
       * is typically done at the protocol level.
       *
       * @see https://anthropic.com/mcp - Model Context Protocol specification
       * @example
       * \`\`\`typescript
       * import { mcpTools } from "./api";
       *
       * // AI assistant discovers and validates tool usage
       * const tool = mcpTools.find(t => t.name === "getUserById");
       * const input = tool.inputSchema.parse({
       *   path: { userId: "123" },
       *   query: { include: "profile" }
       * });
       * \`\`\`
       */
      export const mcpTools = endpoints.map((endpoint) => {
        // Build consolidated params object from all request parameter types
        // MCP requires a single inputSchema, not separated path/query/headers/body
        const params: Record<string, z.ZodTypeAny> = {};
        if (endpoint.request?.pathParams) params.path = endpoint.request.pathParams;
        if (endpoint.request?.queryParams)
          params.query = endpoint.request.queryParams;
        if (endpoint.request?.headers) params.headers = endpoint.request.headers;
        if (endpoint.request?.body) params.body = endpoint.request.body;

        return {
          // Use operationId for the canonical name, with fallback to generated name
          name:
            endpoint.operationId ||
            \`\${endpoint.method}_\${endpoint.path.replace(/[\\/{}]/g, "_")}\`,
          // Provide description for AI context
          description:
            endpoint.description ||
            \`\${endpoint.method.toUpperCase()} \${endpoint.path}\`,
          // Consolidated input schema (path, query, headers, body all nested)
          inputSchema:
            Object.keys(params).length > 0 ? z.object(params) : z.object({}),
          // Primary success response (200 or 201), fallback to z.unknown() for safety
          outputSchema:
            endpoint.responses[200]?.schema ||
            endpoint.responses[201]?.schema ||
            z.unknown(),
        };
      }) as const;
      "
    `);
  });
});
