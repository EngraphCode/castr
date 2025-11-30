import type { OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { assertSingleFileResult } from '../../../tests-helpers/generation-result-assertions.js';
import { generateZodClientFromOpenAPI } from '../../../src/index.js';

// https://github.com/astahmer/openapi-zod-client/issues/49
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
    // Zod Schemas
    export const Email = z.string();
    export const Password = z.string();
    export const AddUser = z
      .object({
        email: Email.min(6)
          .max(255)
          .regex(/(EmailRegex)/),
        password: Password.min(16)
          .max(255)
          .regex(/(PasswordRegex)/),
      })
      .strict();
    export const PasswordReminder = z
      .object({
        email: Email.min(6)
          .max(255)
          .regex(/(EmailRegex)/),
      })
      .strict();
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
            schema: z
              .object({
                email: Email.min(6)
                  .max(255)
                  .regex(/(EmailRegex)/),
                password: Password.min(16)
                  .max(255)
                  .regex(/(PasswordRegex)/),
              })
              .strict(),
          },
        ],
        response: z.void(),
        errors: [],
        responses: {
          200: {
            schema: z.void(),
            description: "foo",
          },
        },
        request: {
          body: z
            .object({
              email: Email.min(6)
                .max(255)
                .regex(/(EmailRegex)/),
              password: Password.min(16)
                .max(255)
                .regex(/(PasswordRegex)/),
            })
            .strict(),
        },
        alias: "postUserAdd",
      },
      {
        method: "post",
        path: "/user/recover",
        requestFormat: "json",
        parameters: [
          {
            name: "body",
            type: "Body",
            schema: z
              .object({
                email: Email.min(6)
                  .max(255)
                  .regex(/(EmailRegex)/),
              })
              .strict(),
          },
        ],
        response: z.void(),
        errors: [],
        responses: {
          200: {
            schema: z.void(),
            description: "bar",
          },
        },
        request: {
          body: z
            .object({
              email: Email.min(6)
                .max(255)
                .regex(/(EmailRegex)/),
            })
            .strict(),
        },
        alias: "postUserRecover",
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
                  value: {
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
                  },
                },
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
                  value: {
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
                  },
                },
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
