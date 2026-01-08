/* eslint-disable max-lines-per-function -- long test snapshot */

import { type OpenAPIObject } from 'openapi3-ts/oas31';
import { expect, test } from 'vitest';
import { getZodClientTemplateContext } from '../../../src/test-helpers/legacy-compat.js';

test('same-schema-different-name - IR Snapshot', async () => {
  const openApiDoc: OpenAPIObject = {
    openapi: '3.0.3',
    info: { version: '1', title: 'Example API' },
    paths: {
      '/same-schema-different-name': {
        put: {
          operationId: 'putSameSchemaDifferentName',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'sameSchemaDifferentName',
              in: 'query',
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'] },
            },
          ],
        },
        post: {
          operationId: 'postSameSchemaDifferentName',
          responses: {
            '200': {
              content: {
                'application/json': {
                  schema: { type: 'string' },
                },
              },
            },
          },
          parameters: [
            {
              name: 'differentNameSameSchema',
              in: 'query',
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'] },
            },
            {
              name: 'anotherDifferentNameWithSlightlyDifferentSchema',
              in: 'query',
              schema: { type: 'string', enum: ['aaa', 'bbb', 'ccc'], default: 'aaa' },
            },
          ],
        },
      },
    },
  };
  const ctx = getZodClientTemplateContext(openApiDoc, { complexityThreshold: 2 });
  expect(ctx).toMatchInlineSnapshot(`
    {
        "_ir": {
            "components": [],
            "dependencyGraph": {
                "circularReferences": [],
                "nodes": Map {},
                "topologicalOrder": [],
            },
            "enums": Map {
                "differentNameSameSchema" => {
                    "name": "differentNameSameSchema",
                    "schema": {
                        "enum": [
                            "aaa",
                            "bbb",
                            "ccc",
                        ],
                        "metadata": {
                            "circularReferences": [],
                            "dependencyGraph": {
                                "depth": 0,
                                "referencedBy": [],
                                "references": [],
                            },
                            "nullable": false,
                            "required": false,
                            "zodChain": {
                                "defaults": [],
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "values": [
                        "aaa",
                        "bbb",
                        "ccc",
                    ],
                },
                "anotherDifferentNameWithSlightlyDifferentSchema" => {
                    "name": "anotherDifferentNameWithSlightlyDifferentSchema",
                    "schema": {
                        "default": "aaa",
                        "enum": [
                            "aaa",
                            "bbb",
                            "ccc",
                        ],
                        "metadata": {
                            "circularReferences": [],
                            "default": "aaa",
                            "dependencyGraph": {
                                "depth": 0,
                                "referencedBy": [],
                                "references": [],
                            },
                            "nullable": false,
                            "required": false,
                            "zodChain": {
                                "defaults": [],
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "values": [
                        "aaa",
                        "bbb",
                        "ccc",
                    ],
                },
                "sameSchemaDifferentName" => {
                    "name": "sameSchemaDifferentName",
                    "schema": {
                        "enum": [
                            "aaa",
                            "bbb",
                            "ccc",
                        ],
                        "metadata": {
                            "circularReferences": [],
                            "dependencyGraph": {
                                "depth": 0,
                                "referencedBy": [],
                                "references": [],
                            },
                            "nullable": false,
                            "required": false,
                            "zodChain": {
                                "defaults": [],
                                "presence": ".optional()",
                                "validations": [],
                            },
                        },
                        "type": "string",
                    },
                    "values": [
                        "aaa",
                        "bbb",
                        "ccc",
                    ],
                },
            },
            "info": {
                "title": "Example API",
                "version": "1",
            },
            "openApiVersion": "3.0.3",
            "operations": [
                {
                    "method": "post",
                    "operationId": "postSameSchemaDifferentName",
                    "parameters": [
                        {
                            "in": "query",
                            "metadata": {
                                "circularReferences": [],
                                "dependencyGraph": {
                                    "depth": 0,
                                    "referencedBy": [],
                                    "references": [],
                                },
                                "nullable": false,
                                "required": false,
                                "zodChain": {
                                    "defaults": [],
                                    "presence": ".optional()",
                                    "validations": [],
                                },
                            },
                            "name": "differentNameSameSchema",
                            "required": false,
                            "schema": {
                                "enum": [
                                    "aaa",
                                    "bbb",
                                    "ccc",
                                ],
                                "metadata": {
                                    "circularReferences": [],
                                    "dependencyGraph": {
                                        "depth": 0,
                                        "referencedBy": [],
                                        "references": [],
                                    },
                                    "nullable": false,
                                    "required": false,
                                    "zodChain": {
                                        "defaults": [],
                                        "presence": ".optional()",
                                        "validations": [],
                                    },
                                },
                                "type": "string",
                            },
                        },
                        {
                            "in": "query",
                            "metadata": {
                                "circularReferences": [],
                                "default": "aaa",
                                "dependencyGraph": {
                                    "depth": 0,
                                    "referencedBy": [],
                                    "references": [],
                                },
                                "nullable": false,
                                "required": false,
                                "zodChain": {
                                    "defaults": [],
                                    "presence": ".optional()",
                                    "validations": [],
                                },
                            },
                            "name": "anotherDifferentNameWithSlightlyDifferentSchema",
                            "required": false,
                            "schema": {
                                "default": "aaa",
                                "enum": [
                                    "aaa",
                                    "bbb",
                                    "ccc",
                                ],
                                "metadata": {
                                    "circularReferences": [],
                                    "default": "aaa",
                                    "dependencyGraph": {
                                        "depth": 0,
                                        "referencedBy": [],
                                        "references": [],
                                    },
                                    "nullable": false,
                                    "required": false,
                                    "zodChain": {
                                        "defaults": [],
                                        "presence": ".optional()",
                                        "validations": [],
                                    },
                                },
                                "type": "string",
                            },
                        },
                    ],
                    "parametersByLocation": {
                        "cookie": [],
                        "header": [],
                        "path": [],
                        "query": [
                            {
                                "in": "query",
                                "metadata": {
                                    "circularReferences": [],
                                    "dependencyGraph": {
                                        "depth": 0,
                                        "referencedBy": [],
                                        "references": [],
                                    },
                                    "nullable": false,
                                    "required": false,
                                    "zodChain": {
                                        "defaults": [],
                                        "presence": ".optional()",
                                        "validations": [],
                                    },
                                },
                                "name": "differentNameSameSchema",
                                "required": false,
                                "schema": {
                                    "enum": [
                                        "aaa",
                                        "bbb",
                                        "ccc",
                                    ],
                                    "metadata": {
                                        "circularReferences": [],
                                        "dependencyGraph": {
                                            "depth": 0,
                                            "referencedBy": [],
                                            "references": [],
                                        },
                                        "nullable": false,
                                        "required": false,
                                        "zodChain": {
                                            "defaults": [],
                                            "presence": ".optional()",
                                            "validations": [],
                                        },
                                    },
                                    "type": "string",
                                },
                            },
                            {
                                "in": "query",
                                "metadata": {
                                    "circularReferences": [],
                                    "default": "aaa",
                                    "dependencyGraph": {
                                        "depth": 0,
                                        "referencedBy": [],
                                        "references": [],
                                    },
                                    "nullable": false,
                                    "required": false,
                                    "zodChain": {
                                        "defaults": [],
                                        "presence": ".optional()",
                                        "validations": [],
                                    },
                                },
                                "name": "anotherDifferentNameWithSlightlyDifferentSchema",
                                "required": false,
                                "schema": {
                                    "default": "aaa",
                                    "enum": [
                                        "aaa",
                                        "bbb",
                                        "ccc",
                                    ],
                                    "metadata": {
                                        "circularReferences": [],
                                        "default": "aaa",
                                        "dependencyGraph": {
                                            "depth": 0,
                                            "referencedBy": [],
                                            "references": [],
                                        },
                                        "nullable": false,
                                        "required": false,
                                        "zodChain": {
                                            "defaults": [],
                                            "presence": ".optional()",
                                            "validations": [],
                                        },
                                    },
                                    "type": "string",
                                },
                            },
                        ],
                    },
                    "path": "/same-schema-different-name",
                    "responses": [
                        {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "metadata": {
                                            "circularReferences": [],
                                            "dependencyGraph": {
                                                "depth": 0,
                                                "referencedBy": [],
                                                "references": [],
                                            },
                                            "nullable": false,
                                            "required": false,
                                            "zodChain": {
                                                "defaults": [],
                                                "presence": ".optional()",
                                                "validations": [],
                                            },
                                        },
                                        "type": "string",
                                    },
                                },
                            },
                            "statusCode": "200",
                        },
                    ],
                },
                {
                    "method": "put",
                    "operationId": "putSameSchemaDifferentName",
                    "parameters": [
                        {
                            "in": "query",
                            "metadata": {
                                "circularReferences": [],
                                "dependencyGraph": {
                                    "depth": 0,
                                    "referencedBy": [],
                                    "references": [],
                                },
                                "nullable": false,
                                "required": false,
                                "zodChain": {
                                    "defaults": [],
                                    "presence": ".optional()",
                                    "validations": [],
                                },
                            },
                            "name": "sameSchemaDifferentName",
                            "required": false,
                            "schema": {
                                "enum": [
                                    "aaa",
                                    "bbb",
                                    "ccc",
                                ],
                                "metadata": {
                                    "circularReferences": [],
                                    "dependencyGraph": {
                                        "depth": 0,
                                        "referencedBy": [],
                                        "references": [],
                                    },
                                    "nullable": false,
                                    "required": false,
                                    "zodChain": {
                                        "defaults": [],
                                        "presence": ".optional()",
                                        "validations": [],
                                    },
                                },
                                "type": "string",
                            },
                        },
                    ],
                    "parametersByLocation": {
                        "cookie": [],
                        "header": [],
                        "path": [],
                        "query": [
                            {
                                "in": "query",
                                "metadata": {
                                    "circularReferences": [],
                                    "dependencyGraph": {
                                        "depth": 0,
                                        "referencedBy": [],
                                        "references": [],
                                    },
                                    "nullable": false,
                                    "required": false,
                                    "zodChain": {
                                        "defaults": [],
                                        "presence": ".optional()",
                                        "validations": [],
                                    },
                                },
                                "name": "sameSchemaDifferentName",
                                "required": false,
                                "schema": {
                                    "enum": [
                                        "aaa",
                                        "bbb",
                                        "ccc",
                                    ],
                                    "metadata": {
                                        "circularReferences": [],
                                        "dependencyGraph": {
                                            "depth": 0,
                                            "referencedBy": [],
                                            "references": [],
                                        },
                                        "nullable": false,
                                        "required": false,
                                        "zodChain": {
                                            "defaults": [],
                                            "presence": ".optional()",
                                            "validations": [],
                                        },
                                    },
                                    "type": "string",
                                },
                            },
                        ],
                    },
                    "path": "/same-schema-different-name",
                    "responses": [
                        {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "metadata": {
                                            "circularReferences": [],
                                            "dependencyGraph": {
                                                "depth": 0,
                                                "referencedBy": [],
                                                "references": [],
                                            },
                                            "nullable": false,
                                            "required": false,
                                            "zodChain": {
                                                "defaults": [],
                                                "presence": ".optional()",
                                                "validations": [],
                                            },
                                        },
                                        "type": "string",
                                    },
                                },
                            },
                            "statusCode": "200",
                        },
                    ],
                },
            ],
            "schemaNames": [],
            "servers": [],
            "version": "1.0.0",
        },
        "endpoints": [
            {
                "alias": "postSameSchemaDifferentName",
                "errors": [],
                "method": "post",
                "parameters": [
                    {
                        "constraints": {
                            "enum": [
                                "aaa",
                                "bbb",
                                "ccc",
                            ],
                        },
                        "name": "differentNameSameSchema",
                        "schema": {
                            "enum": [
                                "aaa",
                                "bbb",
                                "ccc",
                            ],
                            "metadata": {
                                "circularReferences": [],
                                "dependencyGraph": {
                                    "depth": 0,
                                    "referencedBy": [],
                                    "references": [],
                                },
                                "nullable": false,
                                "required": false,
                                "zodChain": {
                                    "defaults": [],
                                    "presence": ".optional()",
                                    "validations": [],
                                },
                            },
                            "type": "string",
                        },
                        "type": "Query",
                    },
                    {
                        "constraints": {
                            "enum": [
                                "aaa",
                                "bbb",
                                "ccc",
                            ],
                        },
                        "default": "aaa",
                        "name": "anotherDifferentNameWithSlightlyDifferentSchema",
                        "schema": {
                            "default": "aaa",
                            "enum": [
                                "aaa",
                                "bbb",
                                "ccc",
                            ],
                            "metadata": {
                                "circularReferences": [],
                                "default": "aaa",
                                "dependencyGraph": {
                                    "depth": 0,
                                    "referencedBy": [],
                                    "references": [],
                                },
                                "nullable": false,
                                "required": false,
                                "zodChain": {
                                    "defaults": [],
                                    "presence": ".optional()",
                                    "validations": [],
                                },
                            },
                            "type": "string",
                        },
                        "type": "Query",
                    },
                ],
                "path": "/same-schema-different-name",
                "requestFormat": "json",
                "response": {
                    "metadata": {
                        "circularReferences": [],
                        "dependencyGraph": {
                            "depth": 0,
                            "referencedBy": [],
                            "references": [],
                        },
                        "nullable": false,
                        "required": false,
                        "zodChain": {
                            "defaults": [],
                            "presence": ".optional()",
                            "validations": [],
                        },
                    },
                    "type": "string",
                },
                "responses": [
                    {
                        "schema": {
                            "metadata": {
                                "circularReferences": [],
                                "dependencyGraph": {
                                    "depth": 0,
                                    "referencedBy": [],
                                    "references": [],
                                },
                                "nullable": false,
                                "required": false,
                                "zodChain": {
                                    "defaults": [],
                                    "presence": ".optional()",
                                    "validations": [],
                                },
                            },
                            "type": "string",
                        },
                        "statusCode": "200",
                    },
                ],
            },
            {
                "alias": "putSameSchemaDifferentName",
                "errors": [],
                "method": "put",
                "parameters": [
                    {
                        "constraints": {
                            "enum": [
                                "aaa",
                                "bbb",
                                "ccc",
                            ],
                        },
                        "name": "sameSchemaDifferentName",
                        "schema": {
                            "enum": [
                                "aaa",
                                "bbb",
                                "ccc",
                            ],
                            "metadata": {
                                "circularReferences": [],
                                "dependencyGraph": {
                                    "depth": 0,
                                    "referencedBy": [],
                                    "references": [],
                                },
                                "nullable": false,
                                "required": false,
                                "zodChain": {
                                    "defaults": [],
                                    "presence": ".optional()",
                                    "validations": [],
                                },
                            },
                            "type": "string",
                        },
                        "type": "Query",
                    },
                ],
                "path": "/same-schema-different-name",
                "requestFormat": "json",
                "response": {
                    "metadata": {
                        "circularReferences": [],
                        "dependencyGraph": {
                            "depth": 0,
                            "referencedBy": [],
                            "references": [],
                        },
                        "nullable": false,
                        "required": false,
                        "zodChain": {
                            "defaults": [],
                            "presence": ".optional()",
                            "validations": [],
                        },
                    },
                    "type": "string",
                },
                "responses": [
                    {
                        "schema": {
                            "metadata": {
                                "circularReferences": [],
                                "dependencyGraph": {
                                    "depth": 0,
                                    "referencedBy": [],
                                    "references": [],
                                },
                                "nullable": false,
                                "required": false,
                                "zodChain": {
                                    "defaults": [],
                                    "presence": ".optional()",
                                    "validations": [],
                                },
                            },
                            "type": "string",
                        },
                        "statusCode": "200",
                    },
                ],
            },
        ],
        "endpointsGroups": {},
        "mcpTools": [
            {
                "httpOperation": {
                    "method": "post",
                    "operationId": "postSameSchemaDifferentName",
                    "originalPath": "/same-schema-different-name",
                    "path": "/same-schema-different-name",
                },
                "method": "post",
                "operationId": "postSameSchemaDifferentName",
                "originalPath": "/same-schema-different-name",
                "path": "/same-schema-different-name",
                "security": {
                    "isPublic": true,
                    "requirementSets": [],
                    "usesGlobalSecurity": false,
                },
                "tool": {
                    "annotations": {
                        "destructiveHint": false,
                        "idempotentHint": false,
                        "readOnlyHint": false,
                    },
                    "description": "POST /same-schema-different-name",
                    "inputSchema": {
                        "properties": {
                            "query": {
                                "properties": {
                                    "anotherDifferentNameWithSlightlyDifferentSchema": {
                                        "default": "aaa",
                                        "enum": [
                                            "aaa",
                                            "bbb",
                                            "ccc",
                                        ],
                                        "type": "string",
                                    },
                                    "differentNameSameSchema": {
                                        "enum": [
                                            "aaa",
                                            "bbb",
                                            "ccc",
                                        ],
                                        "type": "string",
                                    },
                                },
                                "type": "object",
                            },
                        },
                        "type": "object",
                    },
                    "name": "post_same_schema_different_name",
                    "outputSchema": {
                        "properties": {
                            "value": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                    },
                },
            },
            {
                "httpOperation": {
                    "method": "put",
                    "operationId": "putSameSchemaDifferentName",
                    "originalPath": "/same-schema-different-name",
                    "path": "/same-schema-different-name",
                },
                "method": "put",
                "operationId": "putSameSchemaDifferentName",
                "originalPath": "/same-schema-different-name",
                "path": "/same-schema-different-name",
                "security": {
                    "isPublic": true,
                    "requirementSets": [],
                    "usesGlobalSecurity": false,
                },
                "tool": {
                    "annotations": {
                        "destructiveHint": false,
                        "idempotentHint": true,
                        "readOnlyHint": false,
                    },
                    "description": "PUT /same-schema-different-name",
                    "inputSchema": {
                        "properties": {
                            "query": {
                                "properties": {
                                    "sameSchemaDifferentName": {
                                        "enum": [
                                            "aaa",
                                            "bbb",
                                            "ccc",
                                        ],
                                        "type": "string",
                                    },
                                },
                                "type": "object",
                            },
                        },
                        "type": "object",
                    },
                    "name": "put_same_schema_different_name",
                    "outputSchema": {
                        "properties": {
                            "value": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                    },
                },
            },
        ],
        "options": {
            "baseUrl": "",
            "complexityThreshold": 2,
            "withAlias": false,
        },
        "sortedSchemaNames": [],
    }
  `);
});
