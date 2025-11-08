import { getZodClientTemplateContext } from '../../../src/index.js';
import { expect, test } from 'vitest';

test('handle-refs-without-var-name', () => {
  expect(
    getZodClientTemplateContext({
      openapi: '3.0.3',
      info: { version: '1', title: 'Example API' },
      paths: {
        '/something': {
          get: {
            operationId: 'getSomething',
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { type: 'array', items: { $ref: '#/components/schemas/Basic' } },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {
          Basic: { type: 'object' },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "circularTypeByName": {},
        "emittedType": {},
        "endpoints": [
            {
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/something",
                "requestFormat": "json",
                "response": "z.array(Basic)",
            },
        ],
        "endpointsGroups": {},
        "mcpTools": [
            {
                "method": "get",
                "operationId": "getSomething",
                "originalPath": "/something",
                "path": "/something",
                "security": {
                    "isPublic": true,
                    "requirementSets": [],
                    "usesGlobalSecurity": false,
                },
                "tool": {
                    "annotations": {
                        "destructiveHint": false,
                        "idempotentHint": false,
                        "readOnlyHint": true,
                    },
                    "description": "GET /something",
                    "inputSchema": {
                        "type": "object",
                    },
                    "name": "get_something",
                    "outputSchema": {
                        "properties": {
                            "value": {
                                "items": {
                                    "$ref": "#/definitions/Basic",
                                },
                                "type": "array",
                            },
                        },
                        "type": "object",
                    },
                },
            },
        ],
        "options": {
            "baseUrl": "",
            "withAlias": false,
        },
        "schemas": {
            "Basic": "z.object({}).partial().passthrough()",
        },
        "types": {},
    }
  `);
});
