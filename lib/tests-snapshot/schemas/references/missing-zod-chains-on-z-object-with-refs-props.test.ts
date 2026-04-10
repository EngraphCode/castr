import type { OpenAPIObject } from '../../../src/shared/openapi-types.js';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/@engraph/castr/issues/49
test('missing-zod-chains-on-z-object-with-refs-props', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.0',
    info: { title: 'Schema test', version: '1.0.0' },
    paths: {
      '/user/add': {
        post: {
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AddUser' } } },
          },
          responses: { '200': { description: 'foo' } },
        },
      },
      '/user/recover': {
        post: {
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/PasswordReminder' } },
            },
          },
          responses: { '200': { description: 'bar' } },
        },
      },
    },
    components: {
      schemas: {
        Password: { type: 'string', pattern: '/(PasswordRegex)/', minLength: 16, maxLength: 255 },
        Email: { type: 'string', pattern: '/(EmailRegex)/', minLength: 6, maxLength: 255 },
        AddUser: {
          required: ['email', 'password'],
          properties: {
            email: { $ref: '#/components/schemas/Email' },
            password: { $ref: '#/components/schemas/Password' },
          },
        },
        PasswordReminder: {
          required: ['email'],
          properties: { email: { $ref: '#/components/schemas/Email' } },
        },
      },
    },
  };

  const output = await generateZodClientFromOpenAPI({ disableWriteToFile: true, openApiDoc });
  assertSingleFileResult(output);
  expect(output.content).toMatchInlineSnapshot(`
    "import { z } from "zod";
    // Type Definitions
    export type Password = string;
    export type Email = string;
    export type AddUser = {
      email: Email;
      password: Password;
    };
    export type PasswordReminder = {
      email: Email;
    };
    // Zod Schemas
    export const Password = z
      .string()
      .min(16)
      .max(255)
      .regex(/\\/(PasswordRegex)\\//);
    export const Email = z
      .string()
      .min(6)
      .max(255)
      .regex(/\\/(EmailRegex)\\//);
    export const AddUser = z.strictObject({
      email: Email,
      password: Password,
    });
    export const PasswordReminder = z.strictObject({
      email: Email,
    });
    // Endpoints
    export const endpoints = [
      {
        method: "post",
        path: "/user/add",
        requestFormat: "json",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: AddUser,
          },
        ],
        response: z.strictObject({}),
        errors: [],
        responses: {
          200: {
            schema: z.strictObject({}),
            description: "foo",
          },
        },
        request: {
          body: AddUser,
        },
      },
      {
        method: "post",
        path: "/user/recover",
        requestFormat: "json",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: PasswordReminder,
          },
        ],
        response: z.strictObject({}),
        errors: [],
        responses: {
          200: {
            schema: z.strictObject({}),
            description: "bar",
          },
        },
        request: {
          body: PasswordReminder,
        },
      },
    ] as const;
    // MCP Tools
    export const mcpTools = [
      {
        tool: {
          name: "post_user_add",
          description: "POST /user/add",
          inputSchema: {
            type: "object",
            properties: {
              body: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    minLength: 6,
                    maxLength: 255,
                    pattern: "/(EmailRegex)/",
                  },
                  password: {
                    type: "string",
                    minLength: 16,
                    maxLength: 255,
                    pattern: "/(PasswordRegex)/",
                  },
                },
                required: ["email", "password"],
                additionalProperties: false,
              },
            },
            required: ["body"],
          },
          annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "post",
          path: "/user/add",
          originalPath: "/user/add",
        },
        security: {
          isPublic: true,
          usesGlobalSecurity: false,
          requirementSets: [],
        },
      },
      {
        tool: {
          name: "post_user_recover",
          description: "POST /user/recover",
          inputSchema: {
            type: "object",
            properties: {
              body: {
                type: "object",
                properties: {
                  email: {
                    type: "string",
                    minLength: 6,
                    maxLength: 255,
                    pattern: "/(EmailRegex)/",
                  },
                },
                required: ["email"],
                additionalProperties: false,
              },
            },
            required: ["body"],
          },
          annotations: {
            readOnlyHint: false,
            destructiveHint: false,
            idempotentHint: false,
          },
        },
        httpOperation: {
          method: "post",
          path: "/user/recover",
          originalPath: "/user/recover",
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
