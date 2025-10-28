import SwaggerParser from '@apidevtools/swagger-parser';
import type { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas30';
import { expect, test } from 'vitest';
import { getEndpointDefinitionList } from '../../src/getEndpointDefinitionList.js';

const baseDoc = {
  openapi: '3.0.3',
  info: {
    title: 'Swagger Petstore - OpenAPI 3.0',
    description:
      "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about\nSwagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!\nYou can now help us improve the API whether it's by making changes to the definition itself or to the code.\nThat way, with time, we can improve the API in general, and expose some of the new features in OAS3.\n\n_If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the `Edit > Load Petstore OAS 2.0` menu option!_\n\nSome useful links:\n- [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)\n- [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
    termsOfService: 'http://swagger.io/terms/',
    contact: {
      email: 'apiteam@swagger.io',
    },
    license: {
      name: 'Apache 2.0',
      url: 'http://www.apache.org/licenses/LICENSE-2.0.html',
    },
    version: '1.0.11',
  },
} as OpenAPIObject;

const schemas = {
  Order: {
    type: 'object',
    properties: {
      id: { type: 'integer', format: 'int64', example: 10 },
      petId: { type: 'integer', format: 'int64', example: 198_772 },
      quantity: { type: 'integer', format: 'int32', example: 7 },
      shipDate: { type: 'string', format: 'date-time' },
      status: {
        type: 'string',
        description: 'Order Status',
        example: 'approved',
        enum: ['placed', 'approved', 'delivered'],
      },
      complete: { type: 'boolean' },
    },
    xml: { name: 'order' },
  } as SchemaObject,
  Pet: {
    required: ['name', 'photoUrls'],
    type: 'object',
    properties: {
      id: { type: 'integer', format: 'int64', example: 10 },
      name: { type: 'string', example: 'doggie' },
      category: { $ref: '#/components/schemas/Category' },
      photoUrls: {
        type: 'array',
        xml: { wrapped: true },
        items: { type: 'string', xml: { name: 'photoUrl' } },
      },
      tags: { type: 'array', xml: { wrapped: true }, items: { $ref: '#/components/schemas/Tag' } },
      status: {
        type: 'string',
        description: 'pet status in the store',
        enum: ['available', 'pending', 'sold'],
      },
    },
    xml: { name: 'pet' },
  } as SchemaObject,
  ReasonDetails: {
    required: ['details'],
    type: 'object',
    properties: {
      details: { type: 'string', example: 'found an owner' },
    },
    xml: { name: 'reasonDetails' },
  } as SchemaObject,
  Reason: {
    required: ['reason'],
    type: 'object',
    properties: {
      reason: { $ref: '#/components/schemas/ReasonDetails' },
    },
    xml: { name: 'reason' },
  } as SchemaObject,
  Category: {
    type: 'object',
    properties: {
      id: { type: 'integer', format: 'int64', example: 1 },
      name: { type: 'string', example: 'Dogs' },
    },
    xml: { name: 'category' },
  } as SchemaObject,
  Tag: {
    type: 'object',
    properties: { id: { type: 'integer', format: 'int64' }, name: { type: 'string' } },
    xml: { name: 'tag' },
  } as SchemaObject,
} as const;

test('getEndpointDefinitionList /store/order', () => {
  expect(
    getEndpointDefinitionList({
      ...baseDoc,
      components: { schemas: { Order: schemas.Order } },
      paths: {
        '/store/order': {
          post: {
            tags: ['store'],
            summary: 'Place an order for a pet',
            description: 'Place a new order in the store',
            operationId: 'placeOrder',
            requestBody: {
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Order' } },
                'application/xml': { schema: { $ref: '#/components/schemas/Order' } },
                'application/x-www-form-urlencoded': {
                  schema: { $ref: '#/components/schemas/Order' },
                },
              },
            },
            responses: {
              '200': {
                description: 'successful operation',
                content: { 'application/json': { schema: { $ref: '#/components/schemas/Order' } } },
              },
              '405': { description: 'Invalid input' },
            },
          },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "deepDependencyGraph": {},
        "doc": {
            "components": {
                "schemas": {
                    "Order": {
                        "properties": {
                            "complete": {
                                "type": "boolean",
                            },
                            "id": {
                                "example": 10,
                                "format": "int64",
                                "type": "integer",
                            },
                            "petId": {
                                "example": 198772,
                                "format": "int64",
                                "type": "integer",
                            },
                            "quantity": {
                                "example": 7,
                                "format": "int32",
                                "type": "integer",
                            },
                            "shipDate": {
                                "format": "date-time",
                                "type": "string",
                            },
                            "status": {
                                "description": "Order Status",
                                "enum": [
                                    "placed",
                                    "approved",
                                    "delivered",
                                ],
                                "example": "approved",
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "order",
                        },
                    },
                },
            },
            "info": {
                "contact": {
                    "email": "apiteam@swagger.io",
                },
                "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
    Swagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
    You can now help us improve the API whether it's by making changes to the definition itself or to the code.
    That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

    _If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the \`Edit > Load Petstore OAS 2.0\` menu option!_

    Some useful links:
    - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
    - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
                "license": {
                    "name": "Apache 2.0",
                    "url": "http://www.apache.org/licenses/LICENSE-2.0.html",
                },
                "termsOfService": "http://swagger.io/terms/",
                "title": "Swagger Petstore - OpenAPI 3.0",
                "version": "1.0.11",
            },
            "openapi": "3.0.3",
            "paths": {
                "/store/order": {
                    "post": {
                        "description": "Place a new order in the store",
                        "operationId": "placeOrder",
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Order",
                                    },
                                },
                                "application/x-www-form-urlencoded": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Order",
                                    },
                                },
                                "application/xml": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Order",
                                    },
                                },
                            },
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Order",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "405": {
                                "description": "Invalid input",
                            },
                        },
                        "summary": "Place an order for a pet",
                        "tags": [
                            "store",
                        ],
                    },
                },
            },
        },
        "endpoints": [
            {
                "description": "Place a new order in the store",
                "errors": [
                    {
                        "description": "Invalid input",
                        "schema": "z.void()",
                        "status": 405,
                    },
                ],
                "method": "post",
                "parameters": [
                    {
                        "description": "",
                        "name": "body",
                        "schema": "Order",
                        "type": "Body",
                    },
                ],
                "path": "/store/order",
                "requestFormat": "json",
                "response": "Order",
            },
        ],
        "issues": {
            "ignoredFallbackResponse": [],
            "ignoredGenericError": [],
        },
        "refsDependencyGraph": {},
        "schemaByName": {},
        "zodSchemaByName": {
            "Order": "z.object({ id: z.number().int(), petId: z.number().int(), quantity: z.number().int(), shipDate: z.string().datetime({ offset: true }), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial().passthrough()",
        },
    }
  `);
});

test('getEndpointDefinitionList /pet', () => {
  expect(
    getEndpointDefinitionList({
      ...baseDoc,
      components: { schemas: { Pet: schemas.Pet, Category: schemas.Category, Tag: schemas.Tag } },
      paths: {
        '/pet': {
          put: {
            tags: ['pet'],
            summary: 'Update an existing pet',
            description: 'Update an existing pet by Id',
            operationId: 'updatePet',
            requestBody: {
              description: 'Update an existent pet in the store',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                'application/xml': { schema: { $ref: '#/components/schemas/Pet' } },
                'application/x-www-form-urlencoded': {
                  schema: { $ref: '#/components/schemas/Pet' },
                },
              },
              required: true,
            },
            responses: {
              '200': {
                description: 'Successful operation',
                content: {
                  'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                  'application/xml': { schema: { $ref: '#/components/schemas/Pet' } },
                },
              },
              '400': { description: 'Invalid ID supplied' },
              '404': { description: 'Pet not found' },
              '405': { description: 'Validation exception' },
            },
            security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
          },
          post: {
            tags: ['pet'],
            summary: 'Add a new pet to the store',
            description: 'Add a new pet to the store',
            operationId: 'addPet',
            requestBody: {
              description: 'Create a new pet in the store',
              content: {
                'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                'application/xml': { schema: { $ref: '#/components/schemas/Pet' } },
                'application/x-www-form-urlencoded': {
                  schema: { $ref: '#/components/schemas/Pet' },
                },
              },
              required: true,
            },
            responses: {
              '200': {
                description: 'Successful operation',
                content: {
                  'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                  'application/xml': { schema: { $ref: '#/components/schemas/Pet' } },
                },
              },
              '405': { description: 'Invalid input' },
            },
            security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
          },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "deepDependencyGraph": {
            "#/components/schemas/Pet": Set {
                "#/components/schemas/Category",
                "#/components/schemas/Tag",
            },
        },
        "doc": {
            "components": {
                "schemas": {
                    "Category": {
                        "properties": {
                            "id": {
                                "example": 1,
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "example": "Dogs",
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "category",
                        },
                    },
                    "Pet": {
                        "properties": {
                            "category": {
                                "$ref": "#/components/schemas/Category",
                            },
                            "id": {
                                "example": 10,
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "example": "doggie",
                                "type": "string",
                            },
                            "photoUrls": {
                                "items": {
                                    "type": "string",
                                    "xml": {
                                        "name": "photoUrl",
                                    },
                                },
                                "type": "array",
                                "xml": {
                                    "wrapped": true,
                                },
                            },
                            "status": {
                                "description": "pet status in the store",
                                "enum": [
                                    "available",
                                    "pending",
                                    "sold",
                                ],
                                "type": "string",
                            },
                            "tags": {
                                "items": {
                                    "$ref": "#/components/schemas/Tag",
                                },
                                "type": "array",
                                "xml": {
                                    "wrapped": true,
                                },
                            },
                        },
                        "required": [
                            "name",
                            "photoUrls",
                        ],
                        "type": "object",
                        "xml": {
                            "name": "pet",
                        },
                    },
                    "Tag": {
                        "properties": {
                            "id": {
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "tag",
                        },
                    },
                },
            },
            "info": {
                "contact": {
                    "email": "apiteam@swagger.io",
                },
                "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
    Swagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
    You can now help us improve the API whether it's by making changes to the definition itself or to the code.
    That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

    _If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the \`Edit > Load Petstore OAS 2.0\` menu option!_

    Some useful links:
    - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
    - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
                "license": {
                    "name": "Apache 2.0",
                    "url": "http://www.apache.org/licenses/LICENSE-2.0.html",
                },
                "termsOfService": "http://swagger.io/terms/",
                "title": "Swagger Petstore - OpenAPI 3.0",
                "version": "1.0.11",
            },
            "openapi": "3.0.3",
            "paths": {
                "/pet": {
                    "post": {
                        "description": "Add a new pet to the store",
                        "operationId": "addPet",
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                                "application/x-www-form-urlencoded": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                                "application/xml": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                            },
                            "description": "Create a new pet in the store",
                            "required": true,
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                },
                                "description": "Successful operation",
                            },
                            "405": {
                                "description": "Invalid input",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Add a new pet to the store",
                        "tags": [
                            "pet",
                        ],
                    },
                    "put": {
                        "description": "Update an existing pet by Id",
                        "operationId": "updatePet",
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                                "application/x-www-form-urlencoded": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                                "application/xml": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                            },
                            "description": "Update an existent pet in the store",
                            "required": true,
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                },
                                "description": "Successful operation",
                            },
                            "400": {
                                "description": "Invalid ID supplied",
                            },
                            "404": {
                                "description": "Pet not found",
                            },
                            "405": {
                                "description": "Validation exception",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Update an existing pet",
                        "tags": [
                            "pet",
                        ],
                    },
                },
            },
        },
        "endpoints": [
            {
                "description": "Add a new pet to the store",
                "errors": [
                    {
                        "description": "Invalid input",
                        "schema": "z.void()",
                        "status": 405,
                    },
                ],
                "method": "post",
                "parameters": [
                    {
                        "description": "Create a new pet in the store",
                        "name": "body",
                        "schema": "Pet",
                        "type": "Body",
                    },
                ],
                "path": "/pet",
                "requestFormat": "json",
                "response": "Pet",
            },
            {
                "description": "Update an existing pet by Id",
                "errors": [
                    {
                        "description": "Invalid ID supplied",
                        "schema": "z.void()",
                        "status": 400,
                    },
                    {
                        "description": "Pet not found",
                        "schema": "z.void()",
                        "status": 404,
                    },
                    {
                        "description": "Validation exception",
                        "schema": "z.void()",
                        "status": 405,
                    },
                ],
                "method": "put",
                "parameters": [
                    {
                        "description": "Update an existent pet in the store",
                        "name": "body",
                        "schema": "Pet",
                        "type": "Body",
                    },
                ],
                "path": "/pet",
                "requestFormat": "json",
                "response": "Pet",
            },
        ],
        "issues": {
            "ignoredFallbackResponse": [],
            "ignoredGenericError": [],
        },
        "refsDependencyGraph": {
            "#/components/schemas/Pet": Set {
                "#/components/schemas/Category",
                "#/components/schemas/Tag",
            },
        },
        "schemaByName": {},
        "zodSchemaByName": {
            "Category": "z.object({ id: z.number().int(), name: z.string() }).partial().passthrough()",
            "Pet": "z.object({ id: z.number().int().optional(), name: z.string(), category: Category.optional(), photoUrls: z.array(z.string()), tags: z.array(Tag).optional(), status: z.enum(["available", "pending", "sold"]).optional() }).passthrough()",
            "Tag": "z.object({ id: z.number().int(), name: z.string() }).partial().passthrough()",
        },
    }
  `);
});

test('getEndpointDefinitionList /pet without schema ref', () => {
  expect(
    getEndpointDefinitionList({
      ...baseDoc,
      components: {
        schemas: {
          Pet: schemas.Pet,
          Category: schemas.Category,
          Tag: schemas.Tag,
          Reason: schemas.Reason,
          ReasonDetails: schemas.ReasonDetails,
        },
      },
      paths: {
        '/pet': {
          put: {
            tags: ['pet'],
            summary: 'Update an existing pet',
            description: 'Update an existing pet by Id',
            operationId: 'updatePet',
            requestBody: {
              description: 'Update an existent pet in the store',
              content: {
                'application/json': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Pet' },
                      { $ref: '#/components/schemas/Reason' },
                    ],
                  },
                },
                'application/xml': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Pet' },
                      { $ref: '#/components/schemas/Reason' },
                    ],
                  },
                },
                'application/x-www-form-urlencoded': {
                  schema: {
                    allOf: [
                      { $ref: '#/components/schemas/Pet' },
                      { $ref: '#/components/schemas/Reason' },
                    ],
                  },
                },
              },
              required: true,
            },
            responses: {
              '200': {
                description: 'Successful operation',
                content: {
                  'application/json': { schema: { $ref: '#/components/schemas/Pet' } },
                  'application/xml': { schema: { $ref: '#/components/schemas/Pet' } },
                },
              },
              '400': { description: 'Invalid ID supplied' },
              '404': { description: 'Pet not found' },
              '405': { description: 'Validation exception' },
            },
            security: [{ petstore_auth: ['write:pets', 'read:pets'] }],
          },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "deepDependencyGraph": {
            "#/components/schemas/Pet": Set {
                "#/components/schemas/Category",
                "#/components/schemas/Tag",
            },
            "#/components/schemas/Reason": Set {
                "#/components/schemas/ReasonDetails",
            },
        },
        "doc": {
            "components": {
                "schemas": {
                    "Category": {
                        "properties": {
                            "id": {
                                "example": 1,
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "example": "Dogs",
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "category",
                        },
                    },
                    "Pet": {
                        "properties": {
                            "category": {
                                "$ref": "#/components/schemas/Category",
                            },
                            "id": {
                                "example": 10,
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "example": "doggie",
                                "type": "string",
                            },
                            "photoUrls": {
                                "items": {
                                    "type": "string",
                                    "xml": {
                                        "name": "photoUrl",
                                    },
                                },
                                "type": "array",
                                "xml": {
                                    "wrapped": true,
                                },
                            },
                            "status": {
                                "description": "pet status in the store",
                                "enum": [
                                    "available",
                                    "pending",
                                    "sold",
                                ],
                                "type": "string",
                            },
                            "tags": {
                                "items": {
                                    "$ref": "#/components/schemas/Tag",
                                },
                                "type": "array",
                                "xml": {
                                    "wrapped": true,
                                },
                            },
                        },
                        "required": [
                            "name",
                            "photoUrls",
                        ],
                        "type": "object",
                        "xml": {
                            "name": "pet",
                        },
                    },
                    "Reason": {
                        "properties": {
                            "reason": {
                                "$ref": "#/components/schemas/ReasonDetails",
                            },
                        },
                        "required": [
                            "reason",
                        ],
                        "type": "object",
                        "xml": {
                            "name": "reason",
                        },
                    },
                    "ReasonDetails": {
                        "properties": {
                            "details": {
                                "example": "found an owner",
                                "type": "string",
                            },
                        },
                        "required": [
                            "details",
                        ],
                        "type": "object",
                        "xml": {
                            "name": "reasonDetails",
                        },
                    },
                    "Tag": {
                        "properties": {
                            "id": {
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "tag",
                        },
                    },
                },
            },
            "info": {
                "contact": {
                    "email": "apiteam@swagger.io",
                },
                "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
    Swagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
    You can now help us improve the API whether it's by making changes to the definition itself or to the code.
    That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

    _If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the \`Edit > Load Petstore OAS 2.0\` menu option!_

    Some useful links:
    - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
    - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
                "license": {
                    "name": "Apache 2.0",
                    "url": "http://www.apache.org/licenses/LICENSE-2.0.html",
                },
                "termsOfService": "http://swagger.io/terms/",
                "title": "Swagger Petstore - OpenAPI 3.0",
                "version": "1.0.11",
            },
            "openapi": "3.0.3",
            "paths": {
                "/pet": {
                    "put": {
                        "description": "Update an existing pet by Id",
                        "operationId": "updatePet",
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "allOf": [
                                            {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            {
                                                "$ref": "#/components/schemas/Reason",
                                            },
                                        ],
                                    },
                                },
                                "application/x-www-form-urlencoded": {
                                    "schema": {
                                        "allOf": [
                                            {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            {
                                                "$ref": "#/components/schemas/Reason",
                                            },
                                        ],
                                    },
                                },
                                "application/xml": {
                                    "schema": {
                                        "allOf": [
                                            {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            {
                                                "$ref": "#/components/schemas/Reason",
                                            },
                                        ],
                                    },
                                },
                            },
                            "description": "Update an existent pet in the store",
                            "required": true,
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                },
                                "description": "Successful operation",
                            },
                            "400": {
                                "description": "Invalid ID supplied",
                            },
                            "404": {
                                "description": "Pet not found",
                            },
                            "405": {
                                "description": "Validation exception",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Update an existing pet",
                        "tags": [
                            "pet",
                        ],
                    },
                },
            },
        },
        "endpoints": [
            {
                "description": "Update an existing pet by Id",
                "errors": [
                    {
                        "description": "Invalid ID supplied",
                        "schema": "z.void()",
                        "status": 400,
                    },
                    {
                        "description": "Pet not found",
                        "schema": "z.void()",
                        "status": 404,
                    },
                    {
                        "description": "Validation exception",
                        "schema": "z.void()",
                        "status": 405,
                    },
                ],
                "method": "put",
                "parameters": [
                    {
                        "description": "Update an existent pet in the store",
                        "name": "body",
                        "schema": "updatePet_Body",
                        "type": "Body",
                    },
                ],
                "path": "/pet",
                "requestFormat": "json",
                "response": "Pet",
            },
        ],
        "issues": {
            "ignoredFallbackResponse": [],
            "ignoredGenericError": [],
        },
        "refsDependencyGraph": {
            "#/components/schemas/Pet": Set {
                "#/components/schemas/Category",
                "#/components/schemas/Tag",
            },
            "#/components/schemas/Reason": Set {
                "#/components/schemas/ReasonDetails",
            },
        },
        "schemaByName": {
            "Pet.and(Reason)": "updatePet_Body",
        },
        "zodSchemaByName": {
            "Category": "z.object({ id: z.number().int(), name: z.string() }).partial().passthrough()",
            "Pet": "z.object({ id: z.number().int().optional(), name: z.string(), category: Category.optional(), photoUrls: z.array(z.string()), tags: z.array(Tag).optional(), status: z.enum(["available", "pending", "sold"]).optional() }).passthrough()",
            "Reason": "z.object({ reason: ReasonDetails }).passthrough()",
            "ReasonDetails": "z.object({ details: z.string() }).passthrough()",
            "Tag": "z.object({ id: z.number().int(), name: z.string() }).partial().passthrough()",
            "updatePet_Body": "Pet.and(Reason)",
        },
    }
  `);
});

test('getEndpointDefinitionList /pet/findXXX', () => {
  expect(
    getEndpointDefinitionList({
      ...baseDoc,
      components: { schemas: { Pet: schemas.Pet, Category: schemas.Category, Tag: schemas.Tag } },
      paths: {
        '/pet/findByStatus': {
          get: {
            tags: ['pet'],
            summary: 'Finds Pets by status',
            description: 'Multiple status values can be provided with comma separated strings',
            operationId: 'findPetsByStatus',
            parameters: [
              {
                name: 'status',
                in: 'query',
                description: 'Status values that need to be considered for filter',
                required: false,
                explode: true,
                schema: {
                  type: 'string',
                  default: 'available',
                  enum: ['available', 'pending', 'sold'],
                },
              },
            ],
            responses: {
              '200': {
                description: 'successful operation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Pet',
                      },
                    },
                  },
                  'application/xml': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Pet',
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid status value',
              },
            },
            security: [
              {
                petstore_auth: ['write:pets', 'read:pets'],
              },
            ],
          },
        },
        '/pet/findByTags': {
          get: {
            tags: ['pet'],
            summary: 'Finds Pets by tags',
            description:
              'Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.',
            operationId: 'findPetsByTags',
            parameters: [
              {
                name: 'tags',
                in: 'query',
                description: 'Tags to filter by',
                required: false,
                explode: true,
                schema: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
            ],
            responses: {
              '200': {
                description: 'successful operation',
                content: {
                  'application/json': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Pet',
                      },
                    },
                  },
                  'application/xml': {
                    schema: {
                      type: 'array',
                      items: {
                        $ref: '#/components/schemas/Pet',
                      },
                    },
                  },
                },
              },
              '400': {
                description: 'Invalid tag value',
              },
            },
            security: [
              {
                petstore_auth: ['write:pets', 'read:pets'],
              },
            ],
          },
        },
      },
    }),
  ).toMatchInlineSnapshot(`
    {
        "deepDependencyGraph": {
            "#/components/schemas/Pet": Set {
                "#/components/schemas/Category",
                "#/components/schemas/Tag",
            },
        },
        "doc": {
            "components": {
                "schemas": {
                    "Category": {
                        "properties": {
                            "id": {
                                "example": 1,
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "example": "Dogs",
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "category",
                        },
                    },
                    "Pet": {
                        "properties": {
                            "category": {
                                "$ref": "#/components/schemas/Category",
                            },
                            "id": {
                                "example": 10,
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "example": "doggie",
                                "type": "string",
                            },
                            "photoUrls": {
                                "items": {
                                    "type": "string",
                                    "xml": {
                                        "name": "photoUrl",
                                    },
                                },
                                "type": "array",
                                "xml": {
                                    "wrapped": true,
                                },
                            },
                            "status": {
                                "description": "pet status in the store",
                                "enum": [
                                    "available",
                                    "pending",
                                    "sold",
                                ],
                                "type": "string",
                            },
                            "tags": {
                                "items": {
                                    "$ref": "#/components/schemas/Tag",
                                },
                                "type": "array",
                                "xml": {
                                    "wrapped": true,
                                },
                            },
                        },
                        "required": [
                            "name",
                            "photoUrls",
                        ],
                        "type": "object",
                        "xml": {
                            "name": "pet",
                        },
                    },
                    "Tag": {
                        "properties": {
                            "id": {
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "tag",
                        },
                    },
                },
            },
            "info": {
                "contact": {
                    "email": "apiteam@swagger.io",
                },
                "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
    Swagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
    You can now help us improve the API whether it's by making changes to the definition itself or to the code.
    That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

    _If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the \`Edit > Load Petstore OAS 2.0\` menu option!_

    Some useful links:
    - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
    - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
                "license": {
                    "name": "Apache 2.0",
                    "url": "http://www.apache.org/licenses/LICENSE-2.0.html",
                },
                "termsOfService": "http://swagger.io/terms/",
                "title": "Swagger Petstore - OpenAPI 3.0",
                "version": "1.0.11",
            },
            "openapi": "3.0.3",
            "paths": {
                "/pet/findByStatus": {
                    "get": {
                        "description": "Multiple status values can be provided with comma separated strings",
                        "operationId": "findPetsByStatus",
                        "parameters": [
                            {
                                "description": "Status values that need to be considered for filter",
                                "explode": true,
                                "in": "query",
                                "name": "status",
                                "required": false,
                                "schema": {
                                    "default": "available",
                                    "enum": [
                                        "available",
                                        "pending",
                                        "sold",
                                    ],
                                    "type": "string",
                                },
                            },
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "items": {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            "type": "array",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "items": {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            "type": "array",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "400": {
                                "description": "Invalid status value",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Finds Pets by status",
                        "tags": [
                            "pet",
                        ],
                    },
                },
                "/pet/findByTags": {
                    "get": {
                        "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                        "operationId": "findPetsByTags",
                        "parameters": [
                            {
                                "description": "Tags to filter by",
                                "explode": true,
                                "in": "query",
                                "name": "tags",
                                "required": false,
                                "schema": {
                                    "items": {
                                        "type": "string",
                                    },
                                    "type": "array",
                                },
                            },
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "items": {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            "type": "array",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "items": {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            "type": "array",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "400": {
                                "description": "Invalid tag value",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Finds Pets by tags",
                        "tags": [
                            "pet",
                        ],
                    },
                },
            },
        },
        "endpoints": [
            {
                "description": "Multiple status values can be provided with comma separated strings",
                "errors": [
                    {
                        "description": "Invalid status value",
                        "schema": "z.void()",
                        "status": 400,
                    },
                ],
                "method": "get",
                "parameters": [
                    {
                        "name": "status",
                        "schema": "z.enum(["available", "pending", "sold"]).optional().default("available")",
                        "type": "Query",
                    },
                ],
                "path": "/pet/findByStatus",
                "requestFormat": "json",
                "response": "z.array(Pet)",
            },
            {
                "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                "errors": [
                    {
                        "description": "Invalid tag value",
                        "schema": "z.void()",
                        "status": 400,
                    },
                ],
                "method": "get",
                "parameters": [
                    {
                        "name": "tags",
                        "schema": "z.array(z.string()).optional()",
                        "type": "Query",
                    },
                ],
                "path": "/pet/findByTags",
                "requestFormat": "json",
                "response": "z.array(Pet)",
            },
        ],
        "issues": {
            "ignoredFallbackResponse": [],
            "ignoredGenericError": [],
        },
        "refsDependencyGraph": {
            "#/components/schemas/Pet": Set {
                "#/components/schemas/Category",
                "#/components/schemas/Tag",
            },
        },
        "schemaByName": {},
        "zodSchemaByName": {
            "Category": "z.object({ id: z.number().int(), name: z.string() }).partial().passthrough()",
            "Pet": "z.object({ id: z.number().int().optional(), name: z.string(), category: Category.optional(), photoUrls: z.array(z.string()), tags: z.array(Tag).optional(), status: z.enum(["available", "pending", "sold"]).optional() }).passthrough()",
            "Tag": "z.object({ id: z.number().int(), name: z.string() }).partial().passthrough()",
        },
    }
  `);
});

test('petstore.yaml', async () => {
  const openApiDoc = (await SwaggerParser.parse(
    './examples/swagger/petstore.yaml',
  )) as OpenAPIObject;
  const result = getEndpointDefinitionList(openApiDoc);
  expect(result).toMatchInlineSnapshot(`
    {
        "deepDependencyGraph": {
            "#/components/schemas/Customer": Set {
                "#/components/schemas/Address",
            },
            "#/components/schemas/Pet": Set {
                "#/components/schemas/Category",
                "#/components/schemas/Tag",
            },
        },
        "doc": {
            "components": {
                "requestBodies": {
                    "Pet": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "$ref": "#/components/schemas/Pet",
                                },
                            },
                            "application/xml": {
                                "schema": {
                                    "$ref": "#/components/schemas/Pet",
                                },
                            },
                        },
                        "description": "Pet object that needs to be added to the store",
                    },
                    "UserArray": {
                        "content": {
                            "application/json": {
                                "schema": {
                                    "items": {
                                        "$ref": "#/components/schemas/User",
                                    },
                                    "type": "array",
                                },
                            },
                        },
                        "description": "List of user object",
                    },
                },
                "schemas": {
                    "Address": {
                        "properties": {
                            "city": {
                                "example": "Palo Alto",
                                "type": "string",
                            },
                            "state": {
                                "example": "CA",
                                "type": "string",
                            },
                            "street": {
                                "example": "437 Lytton",
                                "type": "string",
                            },
                            "zip": {
                                "example": "94301",
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "address",
                        },
                    },
                    "ApiResponse": {
                        "properties": {
                            "code": {
                                "format": "int32",
                                "type": "integer",
                            },
                            "message": {
                                "type": "string",
                            },
                            "type": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "##default",
                        },
                    },
                    "Category": {
                        "properties": {
                            "id": {
                                "example": 1,
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "example": "Dogs",
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "category",
                        },
                    },
                    "Customer": {
                        "properties": {
                            "address": {
                                "items": {
                                    "$ref": "#/components/schemas/Address",
                                },
                                "type": "array",
                                "xml": {
                                    "name": "addresses",
                                    "wrapped": true,
                                },
                            },
                            "id": {
                                "example": 100000,
                                "format": "int64",
                                "type": "integer",
                            },
                            "username": {
                                "example": "fehguy",
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "customer",
                        },
                    },
                    "Order": {
                        "properties": {
                            "complete": {
                                "type": "boolean",
                            },
                            "id": {
                                "example": 10,
                                "format": "int64",
                                "type": "integer",
                            },
                            "petId": {
                                "example": 198772,
                                "format": "int64",
                                "type": "integer",
                            },
                            "quantity": {
                                "example": 7,
                                "format": "int32",
                                "type": "integer",
                            },
                            "shipDate": {
                                "format": "date-time",
                                "type": "string",
                            },
                            "status": {
                                "description": "Order Status",
                                "enum": [
                                    "placed",
                                    "approved",
                                    "delivered",
                                ],
                                "example": "approved",
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "order",
                        },
                    },
                    "Pet": {
                        "properties": {
                            "category": {
                                "$ref": "#/components/schemas/Category",
                            },
                            "id": {
                                "example": 10,
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "example": "doggie",
                                "type": "string",
                            },
                            "photoUrls": {
                                "items": {
                                    "type": "string",
                                    "xml": {
                                        "name": "photoUrl",
                                    },
                                },
                                "type": "array",
                                "xml": {
                                    "wrapped": true,
                                },
                            },
                            "status": {
                                "description": "pet status in the store",
                                "enum": [
                                    "available",
                                    "pending",
                                    "sold",
                                ],
                                "type": "string",
                            },
                            "tags": {
                                "items": {
                                    "$ref": "#/components/schemas/Tag",
                                },
                                "type": "array",
                                "xml": {
                                    "wrapped": true,
                                },
                            },
                        },
                        "required": [
                            "name",
                            "photoUrls",
                        ],
                        "type": "object",
                        "xml": {
                            "name": "pet",
                        },
                    },
                    "Tag": {
                        "properties": {
                            "id": {
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "tag",
                        },
                    },
                    "User": {
                        "properties": {
                            "email": {
                                "example": "john@email.com",
                                "type": "string",
                            },
                            "firstName": {
                                "example": "John",
                                "type": "string",
                            },
                            "id": {
                                "example": 10,
                                "format": "int64",
                                "type": "integer",
                            },
                            "lastName": {
                                "example": "James",
                                "type": "string",
                            },
                            "password": {
                                "example": "12345",
                                "type": "string",
                            },
                            "phone": {
                                "example": "12345",
                                "type": "string",
                            },
                            "userStatus": {
                                "description": "User Status",
                                "example": 1,
                                "format": "int32",
                                "type": "integer",
                            },
                            "username": {
                                "example": "theUser",
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "user",
                        },
                    },
                },
                "securitySchemes": {
                    "api_key": {
                        "in": "header",
                        "name": "api_key",
                        "type": "apiKey",
                    },
                    "petstore_auth": {
                        "flows": {
                            "implicit": {
                                "authorizationUrl": "https://petstore3.swagger.io/oauth/authorize",
                                "scopes": {
                                    "read:pets": "read your pets",
                                    "write:pets": "modify pets in your account",
                                },
                            },
                        },
                        "type": "oauth2",
                    },
                },
            },
            "externalDocs": {
                "description": "Find out more about Swagger",
                "url": "http://swagger.io",
            },
            "info": {
                "contact": {
                    "email": "apiteam@swagger.io",
                },
                "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
    Swagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
    You can now help us improve the API whether it's by making changes to the definition itself or to the code.
    That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

    _If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the \`Edit > Load Petstore OAS 2.0\` menu option!_

    Some useful links:
    - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
    - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
                "license": {
                    "name": "Apache 2.0",
                    "url": "http://www.apache.org/licenses/LICENSE-2.0.html",
                },
                "termsOfService": "http://swagger.io/terms/",
                "title": "Swagger Petstore - OpenAPI 3.0",
                "version": "1.0.11",
            },
            "openapi": "3.0.3",
            "paths": {
                "/pet": {
                    "post": {
                        "description": "Add a new pet to the store",
                        "operationId": "addPet",
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                                "application/x-www-form-urlencoded": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                                "application/xml": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                            },
                            "description": "Create a new pet in the store",
                            "required": true,
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                },
                                "description": "Successful operation",
                            },
                            "405": {
                                "description": "Invalid input",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Add a new pet to the store",
                        "tags": [
                            "pet",
                        ],
                    },
                    "put": {
                        "description": "Update an existing pet by Id",
                        "operationId": "updatePet",
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                                "application/x-www-form-urlencoded": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                                "application/xml": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Pet",
                                    },
                                },
                            },
                            "description": "Update an existent pet in the store",
                            "required": true,
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                },
                                "description": "Successful operation",
                            },
                            "400": {
                                "description": "Invalid ID supplied",
                            },
                            "404": {
                                "description": "Pet not found",
                            },
                            "405": {
                                "description": "Validation exception",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Update an existing pet",
                        "tags": [
                            "pet",
                        ],
                    },
                },
                "/pet/findByStatus": {
                    "get": {
                        "description": "Multiple status values can be provided with comma separated strings",
                        "operationId": "findPetsByStatus",
                        "parameters": [
                            {
                                "description": "Status values that need to be considered for filter",
                                "explode": true,
                                "in": "query",
                                "name": "status",
                                "required": false,
                                "schema": {
                                    "default": "available",
                                    "enum": [
                                        "available",
                                        "pending",
                                        "sold",
                                    ],
                                    "type": "string",
                                },
                            },
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "items": {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            "type": "array",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "items": {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            "type": "array",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "400": {
                                "description": "Invalid status value",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Finds Pets by status",
                        "tags": [
                            "pet",
                        ],
                    },
                },
                "/pet/findByTags": {
                    "get": {
                        "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                        "operationId": "findPetsByTags",
                        "parameters": [
                            {
                                "description": "Tags to filter by",
                                "explode": true,
                                "in": "query",
                                "name": "tags",
                                "required": false,
                                "schema": {
                                    "items": {
                                        "type": "string",
                                    },
                                    "type": "array",
                                },
                            },
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "items": {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            "type": "array",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "items": {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            "type": "array",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "400": {
                                "description": "Invalid tag value",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Finds Pets by tags",
                        "tags": [
                            "pet",
                        ],
                    },
                },
                "/pet/{petId}": {
                    "delete": {
                        "description": "delete a pet",
                        "operationId": "deletePet",
                        "parameters": [
                            {
                                "description": "",
                                "in": "header",
                                "name": "api_key",
                                "required": false,
                                "schema": {
                                    "type": "string",
                                },
                            },
                            {
                                "description": "Pet id to delete",
                                "in": "path",
                                "name": "petId",
                                "required": true,
                                "schema": {
                                    "format": "int64",
                                    "type": "integer",
                                },
                            },
                        ],
                        "responses": {
                            "400": {
                                "description": "Invalid pet value",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Deletes a pet",
                        "tags": [
                            "pet",
                        ],
                    },
                    "get": {
                        "description": "Returns a single pet",
                        "operationId": "getPetById",
                        "parameters": [
                            {
                                "description": "ID of pet to return",
                                "in": "path",
                                "name": "petId",
                                "required": true,
                                "schema": {
                                    "format": "int64",
                                    "type": "integer",
                                },
                            },
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Pet",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "400": {
                                "description": "Invalid ID supplied",
                            },
                            "404": {
                                "description": "Pet not found",
                            },
                        },
                        "security": [
                            {
                                "api_key": [],
                            },
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Find pet by ID",
                        "tags": [
                            "pet",
                        ],
                    },
                    "post": {
                        "description": "",
                        "operationId": "updatePetWithForm",
                        "parameters": [
                            {
                                "description": "ID of pet that needs to be updated",
                                "in": "path",
                                "name": "petId",
                                "required": true,
                                "schema": {
                                    "format": "int64",
                                    "type": "integer",
                                },
                            },
                            {
                                "description": "Name of pet that needs to be updated",
                                "in": "query",
                                "name": "name",
                                "schema": {
                                    "type": "string",
                                },
                            },
                            {
                                "description": "Status of pet that needs to be updated",
                                "in": "query",
                                "name": "status",
                                "schema": {
                                    "type": "string",
                                },
                            },
                        ],
                        "responses": {
                            "405": {
                                "description": "Invalid input",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "Updates a pet in the store with form data",
                        "tags": [
                            "pet",
                        ],
                    },
                },
                "/pet/{petId}/uploadImage": {
                    "post": {
                        "description": "",
                        "operationId": "uploadFile",
                        "parameters": [
                            {
                                "description": "ID of pet to update",
                                "in": "path",
                                "name": "petId",
                                "required": true,
                                "schema": {
                                    "format": "int64",
                                    "type": "integer",
                                },
                            },
                            {
                                "description": "Additional Metadata",
                                "in": "query",
                                "name": "additionalMetadata",
                                "required": false,
                                "schema": {
                                    "type": "string",
                                },
                            },
                        ],
                        "requestBody": {
                            "content": {
                                "application/octet-stream": {
                                    "schema": {
                                        "format": "binary",
                                        "type": "string",
                                    },
                                },
                            },
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/ApiResponse",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                        },
                        "security": [
                            {
                                "petstore_auth": [
                                    "write:pets",
                                    "read:pets",
                                ],
                            },
                        ],
                        "summary": "uploads an image",
                        "tags": [
                            "pet",
                        ],
                    },
                },
                "/store/inventory": {
                    "get": {
                        "description": "Returns a map of status codes to quantities",
                        "operationId": "getInventory",
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "additionalProperties": {
                                                "format": "int32",
                                                "type": "integer",
                                            },
                                            "type": "object",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                        },
                        "security": [
                            {
                                "api_key": [],
                            },
                        ],
                        "summary": "Returns pet inventories by status",
                        "tags": [
                            "store",
                        ],
                    },
                },
                "/store/order": {
                    "post": {
                        "description": "Place a new order in the store",
                        "operationId": "placeOrder",
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Order",
                                    },
                                },
                                "application/x-www-form-urlencoded": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Order",
                                    },
                                },
                                "application/xml": {
                                    "schema": {
                                        "$ref": "#/components/schemas/Order",
                                    },
                                },
                            },
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Order",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "405": {
                                "description": "Invalid input",
                            },
                        },
                        "summary": "Place an order for a pet",
                        "tags": [
                            "store",
                        ],
                    },
                },
                "/store/order/{orderId}": {
                    "delete": {
                        "description": "For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors",
                        "operationId": "deleteOrder",
                        "parameters": [
                            {
                                "description": "ID of the order that needs to be deleted",
                                "in": "path",
                                "name": "orderId",
                                "required": true,
                                "schema": {
                                    "format": "int64",
                                    "type": "integer",
                                },
                            },
                        ],
                        "responses": {
                            "400": {
                                "description": "Invalid ID supplied",
                            },
                            "404": {
                                "description": "Order not found",
                            },
                        },
                        "summary": "Delete purchase order by ID",
                        "tags": [
                            "store",
                        ],
                    },
                    "get": {
                        "description": "For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.",
                        "operationId": "getOrderById",
                        "parameters": [
                            {
                                "description": "ID of order that needs to be fetched",
                                "in": "path",
                                "name": "orderId",
                                "required": true,
                                "schema": {
                                    "format": "int64",
                                    "type": "integer",
                                },
                            },
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Order",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "$ref": "#/components/schemas/Order",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "400": {
                                "description": "Invalid ID supplied",
                            },
                            "404": {
                                "description": "Order not found",
                            },
                        },
                        "summary": "Find purchase order by ID",
                        "tags": [
                            "store",
                        ],
                    },
                },
                "/user": {
                    "post": {
                        "description": "This can only be done by the logged in user.",
                        "operationId": "createUser",
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/User",
                                    },
                                },
                                "application/x-www-form-urlencoded": {
                                    "schema": {
                                        "$ref": "#/components/schemas/User",
                                    },
                                },
                                "application/xml": {
                                    "schema": {
                                        "$ref": "#/components/schemas/User",
                                    },
                                },
                            },
                            "description": "Created user object",
                        },
                        "responses": {
                            "default": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/User",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "$ref": "#/components/schemas/User",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                        },
                        "summary": "Create user",
                        "tags": [
                            "user",
                        ],
                    },
                },
                "/user/createWithList": {
                    "post": {
                        "description": "Creates list of users with given input array",
                        "operationId": "createUsersWithListInput",
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "items": {
                                            "$ref": "#/components/schemas/User",
                                        },
                                        "type": "array",
                                    },
                                },
                            },
                        },
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/User",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "$ref": "#/components/schemas/User",
                                        },
                                    },
                                },
                                "description": "Successful operation",
                            },
                            "default": {
                                "description": "successful operation",
                            },
                        },
                        "summary": "Creates list of users with given input array",
                        "tags": [
                            "user",
                        ],
                    },
                },
                "/user/login": {
                    "get": {
                        "description": "",
                        "operationId": "loginUser",
                        "parameters": [
                            {
                                "description": "The user name for login",
                                "in": "query",
                                "name": "username",
                                "required": false,
                                "schema": {
                                    "type": "string",
                                },
                            },
                            {
                                "description": "The password for login in clear text",
                                "in": "query",
                                "name": "password",
                                "required": false,
                                "schema": {
                                    "type": "string",
                                },
                            },
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "string",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "type": "string",
                                        },
                                    },
                                },
                                "description": "successful operation",
                                "headers": {
                                    "X-Expires-After": {
                                        "description": "date in UTC when token expires",
                                        "schema": {
                                            "format": "date-time",
                                            "type": "string",
                                        },
                                    },
                                    "X-Rate-Limit": {
                                        "description": "calls per hour allowed by the user",
                                        "schema": {
                                            "format": "int32",
                                            "type": "integer",
                                        },
                                    },
                                },
                            },
                            "400": {
                                "description": "Invalid username/password supplied",
                            },
                        },
                        "summary": "Logs user into the system",
                        "tags": [
                            "user",
                        ],
                    },
                },
                "/user/logout": {
                    "get": {
                        "description": "",
                        "operationId": "logoutUser",
                        "parameters": [],
                        "responses": {
                            "default": {
                                "description": "successful operation",
                            },
                        },
                        "summary": "Logs out current logged in user session",
                        "tags": [
                            "user",
                        ],
                    },
                },
                "/user/{username}": {
                    "delete": {
                        "description": "This can only be done by the logged in user.",
                        "operationId": "deleteUser",
                        "parameters": [
                            {
                                "description": "The name that needs to be deleted",
                                "in": "path",
                                "name": "username",
                                "required": true,
                                "schema": {
                                    "type": "string",
                                },
                            },
                        ],
                        "responses": {
                            "400": {
                                "description": "Invalid username supplied",
                            },
                            "404": {
                                "description": "User not found",
                            },
                        },
                        "summary": "Delete user",
                        "tags": [
                            "user",
                        ],
                    },
                    "get": {
                        "description": "",
                        "operationId": "getUserByName",
                        "parameters": [
                            {
                                "description": "The name that needs to be fetched. Use user1 for testing. ",
                                "in": "path",
                                "name": "username",
                                "required": true,
                                "schema": {
                                    "type": "string",
                                },
                            },
                        ],
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "$ref": "#/components/schemas/User",
                                        },
                                    },
                                    "application/xml": {
                                        "schema": {
                                            "$ref": "#/components/schemas/User",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "400": {
                                "description": "Invalid username supplied",
                            },
                            "404": {
                                "description": "User not found",
                            },
                        },
                        "summary": "Get user by user name",
                        "tags": [
                            "user",
                        ],
                    },
                    "put": {
                        "description": "This can only be done by the logged in user.",
                        "operationId": "updateUser",
                        "parameters": [
                            {
                                "description": "name that need to be deleted",
                                "in": "path",
                                "name": "username",
                                "required": true,
                                "schema": {
                                    "type": "string",
                                },
                            },
                        ],
                        "requestBody": {
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "$ref": "#/components/schemas/User",
                                    },
                                },
                                "application/x-www-form-urlencoded": {
                                    "schema": {
                                        "$ref": "#/components/schemas/User",
                                    },
                                },
                                "application/xml": {
                                    "schema": {
                                        "$ref": "#/components/schemas/User",
                                    },
                                },
                            },
                            "description": "Update an existent user in the store",
                        },
                        "responses": {
                            "default": {
                                "description": "successful operation",
                            },
                        },
                        "summary": "Update user",
                        "tags": [
                            "user",
                        ],
                    },
                },
            },
            "servers": [
                {
                    "url": "https://petstore3.swagger.io/api/v3",
                },
            ],
            "tags": [
                {
                    "description": "Everything about your Pets",
                    "externalDocs": {
                        "description": "Find out more",
                        "url": "http://swagger.io",
                    },
                    "name": "pet",
                },
                {
                    "description": "Access to Petstore orders",
                    "externalDocs": {
                        "description": "Find out more about our store",
                        "url": "http://swagger.io",
                    },
                    "name": "store",
                },
                {
                    "description": "Operations about user",
                    "name": "user",
                },
            ],
        },
        "endpoints": [
            {
                "description": "Add a new pet to the store",
                "errors": [
                    {
                        "description": "Invalid input",
                        "schema": "z.void()",
                        "status": 405,
                    },
                ],
                "method": "post",
                "parameters": [
                    {
                        "description": "Create a new pet in the store",
                        "name": "body",
                        "schema": "Pet",
                        "type": "Body",
                    },
                ],
                "path": "/pet",
                "requestFormat": "json",
                "response": "Pet",
            },
            {
                "description": "Update an existing pet by Id",
                "errors": [
                    {
                        "description": "Invalid ID supplied",
                        "schema": "z.void()",
                        "status": 400,
                    },
                    {
                        "description": "Pet not found",
                        "schema": "z.void()",
                        "status": 404,
                    },
                    {
                        "description": "Validation exception",
                        "schema": "z.void()",
                        "status": 405,
                    },
                ],
                "method": "put",
                "parameters": [
                    {
                        "description": "Update an existent pet in the store",
                        "name": "body",
                        "schema": "Pet",
                        "type": "Body",
                    },
                ],
                "path": "/pet",
                "requestFormat": "json",
                "response": "Pet",
            },
            {
                "description": "Multiple status values can be provided with comma separated strings",
                "errors": [
                    {
                        "description": "Invalid status value",
                        "schema": "z.void()",
                        "status": 400,
                    },
                ],
                "method": "get",
                "parameters": [
                    {
                        "name": "status",
                        "schema": "z.enum(["available", "pending", "sold"]).optional().default("available")",
                        "type": "Query",
                    },
                ],
                "path": "/pet/findByStatus",
                "requestFormat": "json",
                "response": "z.array(Pet)",
            },
            {
                "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                "errors": [
                    {
                        "description": "Invalid tag value",
                        "schema": "z.void()",
                        "status": 400,
                    },
                ],
                "method": "get",
                "parameters": [
                    {
                        "name": "tags",
                        "schema": "z.array(z.string()).optional()",
                        "type": "Query",
                    },
                ],
                "path": "/pet/findByTags",
                "requestFormat": "json",
                "response": "z.array(Pet)",
            },
            {
                "description": "Returns a single pet",
                "errors": [
                    {
                        "description": "Invalid ID supplied",
                        "schema": "z.void()",
                        "status": 400,
                    },
                    {
                        "description": "Pet not found",
                        "schema": "z.void()",
                        "status": 404,
                    },
                ],
                "method": "get",
                "parameters": [
                    {
                        "name": "petId",
                        "schema": "z.number().int()",
                        "type": "Path",
                    },
                ],
                "path": "/pet/:petId",
                "requestFormat": "json",
                "response": "Pet",
            },
            {
                "errors": [
                    {
                        "description": "Invalid input",
                        "schema": "z.void()",
                        "status": 405,
                    },
                ],
                "method": "post",
                "parameters": [
                    {
                        "name": "petId",
                        "schema": "z.number().int()",
                        "type": "Path",
                    },
                    {
                        "name": "name",
                        "schema": "z.string().optional()",
                        "type": "Query",
                    },
                    {
                        "name": "status",
                        "schema": "z.string().optional()",
                        "type": "Query",
                    },
                ],
                "path": "/pet/:petId",
                "requestFormat": "json",
                "response": "z.void()",
            },
            {
                "description": "delete a pet",
                "errors": [
                    {
                        "description": "Invalid pet value",
                        "schema": "z.void()",
                        "status": 400,
                    },
                ],
                "method": "delete",
                "parameters": [
                    {
                        "name": "api_key",
                        "schema": "z.string().optional()",
                        "type": "Header",
                    },
                    {
                        "name": "petId",
                        "schema": "z.number().int()",
                        "type": "Path",
                    },
                ],
                "path": "/pet/:petId",
                "requestFormat": "json",
                "response": "z.void()",
            },
            {
                "errors": [],
                "method": "post",
                "parameters": [
                    {
                        "description": "",
                        "name": "body",
                        "schema": "z.instanceof(File)",
                        "type": "Body",
                    },
                    {
                        "name": "petId",
                        "schema": "z.number().int()",
                        "type": "Path",
                    },
                    {
                        "name": "additionalMetadata",
                        "schema": "z.string().optional()",
                        "type": "Query",
                    },
                ],
                "path": "/pet/:petId/uploadImage",
                "requestFormat": "binary",
                "response": "ApiResponse",
            },
            {
                "description": "Returns a map of status codes to quantities",
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/store/inventory",
                "requestFormat": "json",
                "response": "z.record(z.number().int())",
            },
            {
                "description": "Place a new order in the store",
                "errors": [
                    {
                        "description": "Invalid input",
                        "schema": "z.void()",
                        "status": 405,
                    },
                ],
                "method": "post",
                "parameters": [
                    {
                        "description": "",
                        "name": "body",
                        "schema": "Order",
                        "type": "Body",
                    },
                ],
                "path": "/store/order",
                "requestFormat": "json",
                "response": "Order",
            },
            {
                "description": "For valid response try integer IDs with value <= 5 or > 10. Other values will generate exceptions.",
                "errors": [
                    {
                        "description": "Invalid ID supplied",
                        "schema": "z.void()",
                        "status": 400,
                    },
                    {
                        "description": "Order not found",
                        "schema": "z.void()",
                        "status": 404,
                    },
                ],
                "method": "get",
                "parameters": [
                    {
                        "name": "orderId",
                        "schema": "z.number().int()",
                        "type": "Path",
                    },
                ],
                "path": "/store/order/:orderId",
                "requestFormat": "json",
                "response": "Order",
            },
            {
                "description": "For valid response try integer IDs with value < 1000. Anything above 1000 or nonintegers will generate API errors",
                "errors": [
                    {
                        "description": "Invalid ID supplied",
                        "schema": "z.void()",
                        "status": 400,
                    },
                    {
                        "description": "Order not found",
                        "schema": "z.void()",
                        "status": 404,
                    },
                ],
                "method": "delete",
                "parameters": [
                    {
                        "name": "orderId",
                        "schema": "z.number().int()",
                        "type": "Path",
                    },
                ],
                "path": "/store/order/:orderId",
                "requestFormat": "json",
                "response": "z.void()",
            },
            {
                "description": "This can only be done by the logged in user.",
                "errors": [],
                "method": "post",
                "parameters": [
                    {
                        "description": "Created user object",
                        "name": "body",
                        "schema": "User",
                        "type": "Body",
                    },
                ],
                "path": "/user",
                "requestFormat": "json",
                "response": "z.void()",
            },
            {
                "description": "Creates list of users with given input array",
                "errors": [],
                "method": "post",
                "parameters": [
                    {
                        "description": "",
                        "name": "body",
                        "schema": "z.array(User)",
                        "type": "Body",
                    },
                ],
                "path": "/user/createWithList",
                "requestFormat": "json",
                "response": "User",
            },
            {
                "errors": [
                    {
                        "description": "Invalid username/password supplied",
                        "schema": "z.void()",
                        "status": 400,
                    },
                ],
                "method": "get",
                "parameters": [
                    {
                        "name": "username",
                        "schema": "z.string().optional()",
                        "type": "Query",
                    },
                    {
                        "name": "password",
                        "schema": "z.string().optional()",
                        "type": "Query",
                    },
                ],
                "path": "/user/login",
                "requestFormat": "json",
                "response": "z.string()",
            },
            {
                "errors": [],
                "method": "get",
                "parameters": [],
                "path": "/user/logout",
                "requestFormat": "json",
                "response": "z.void()",
            },
            {
                "errors": [
                    {
                        "description": "Invalid username supplied",
                        "schema": "z.void()",
                        "status": 400,
                    },
                    {
                        "description": "User not found",
                        "schema": "z.void()",
                        "status": 404,
                    },
                ],
                "method": "get",
                "parameters": [
                    {
                        "name": "username",
                        "schema": "z.string()",
                        "type": "Path",
                    },
                ],
                "path": "/user/:username",
                "requestFormat": "json",
                "response": "User",
            },
            {
                "description": "This can only be done by the logged in user.",
                "errors": [],
                "method": "put",
                "parameters": [
                    {
                        "description": "Update an existent user in the store",
                        "name": "body",
                        "schema": "User",
                        "type": "Body",
                    },
                    {
                        "name": "username",
                        "schema": "z.string()",
                        "type": "Path",
                    },
                ],
                "path": "/user/:username",
                "requestFormat": "json",
                "response": "z.void()",
            },
            {
                "description": "This can only be done by the logged in user.",
                "errors": [
                    {
                        "description": "Invalid username supplied",
                        "schema": "z.void()",
                        "status": 400,
                    },
                    {
                        "description": "User not found",
                        "schema": "z.void()",
                        "status": 404,
                    },
                ],
                "method": "delete",
                "parameters": [
                    {
                        "name": "username",
                        "schema": "z.string()",
                        "type": "Path",
                    },
                ],
                "path": "/user/:username",
                "requestFormat": "json",
                "response": "z.void()",
            },
        ],
        "issues": {
            "ignoredFallbackResponse": [
                "createUsersWithListInput",
            ],
            "ignoredGenericError": [
                "createUser",
                "logoutUser",
                "updateUser",
            ],
        },
        "refsDependencyGraph": {
            "#/components/schemas/Customer": Set {
                "#/components/schemas/Address",
            },
            "#/components/schemas/Pet": Set {
                "#/components/schemas/Category",
                "#/components/schemas/Tag",
            },
        },
        "schemaByName": {},
        "zodSchemaByName": {
            "ApiResponse": "z.object({ code: z.number().int(), type: z.string(), message: z.string() }).partial().passthrough()",
            "Category": "z.object({ id: z.number().int(), name: z.string() }).partial().passthrough()",
            "Order": "z.object({ id: z.number().int(), petId: z.number().int(), quantity: z.number().int(), shipDate: z.string().datetime({ offset: true }), status: z.enum(["placed", "approved", "delivered"]), complete: z.boolean() }).partial().passthrough()",
            "Pet": "z.object({ id: z.number().int().optional(), name: z.string(), category: Category.optional(), photoUrls: z.array(z.string()), tags: z.array(Tag).optional(), status: z.enum(["available", "pending", "sold"]).optional() }).passthrough()",
            "Tag": "z.object({ id: z.number().int(), name: z.string() }).partial().passthrough()",
            "User": "z.object({ id: z.number().int(), username: z.string(), firstName: z.string(), lastName: z.string(), email: z.string(), password: z.string(), phone: z.string(), userStatus: z.number().int() }).partial().passthrough()",
        },
    }
  `);
});

test('getEndpointDefinitionList should return responses if options.withAllResponses is true', () => {
  expect(
    getEndpointDefinitionList(
      {
        ...baseDoc,
        components: { schemas: { Pet: schemas.Pet, Category: schemas.Category, Tag: schemas.Tag } },
        paths: {
          '/pet/findByStatus': {
            get: {
              tags: ['pet'],
              summary: 'Finds Pets by status',
              description: 'Multiple status values can be provided with comma separated strings',
              operationId: 'findPetsByStatus',
              responses: {
                '200': {
                  description: 'successful operation',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Pet',
                        },
                      },
                    },
                  },
                },
                '400': {
                  description: 'Invalid status value',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'string',
                      },
                    },
                  },
                },
                '500': {
                  description: 'Network error',
                },
              },
            },
          },
          '/pet/findByTags': {
            get: {
              tags: ['pet'],
              summary: 'Finds Pets by tags',
              description:
                'Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.',
              operationId: 'findPetsByTags',
              responses: {
                '200': {
                  description: 'successful operation',
                  content: {
                    'application/json': {
                      schema: {
                        type: 'array',
                        items: {
                          $ref: '#/components/schemas/Pet',
                        },
                      },
                    },
                  },
                },
                '400': {
                  description: 'Invalid tag value',
                },
              },
            },
          },
        },
      },
      { withAllResponses: true },
    ),
  ).toMatchInlineSnapshot(`
    {
        "deepDependencyGraph": {
            "#/components/schemas/Pet": Set {
                "#/components/schemas/Category",
                "#/components/schemas/Tag",
            },
        },
        "doc": {
            "components": {
                "schemas": {
                    "Category": {
                        "properties": {
                            "id": {
                                "example": 1,
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "example": "Dogs",
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "category",
                        },
                    },
                    "Pet": {
                        "properties": {
                            "category": {
                                "$ref": "#/components/schemas/Category",
                            },
                            "id": {
                                "example": 10,
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "example": "doggie",
                                "type": "string",
                            },
                            "photoUrls": {
                                "items": {
                                    "type": "string",
                                    "xml": {
                                        "name": "photoUrl",
                                    },
                                },
                                "type": "array",
                                "xml": {
                                    "wrapped": true,
                                },
                            },
                            "status": {
                                "description": "pet status in the store",
                                "enum": [
                                    "available",
                                    "pending",
                                    "sold",
                                ],
                                "type": "string",
                            },
                            "tags": {
                                "items": {
                                    "$ref": "#/components/schemas/Tag",
                                },
                                "type": "array",
                                "xml": {
                                    "wrapped": true,
                                },
                            },
                        },
                        "required": [
                            "name",
                            "photoUrls",
                        ],
                        "type": "object",
                        "xml": {
                            "name": "pet",
                        },
                    },
                    "Tag": {
                        "properties": {
                            "id": {
                                "format": "int64",
                                "type": "integer",
                            },
                            "name": {
                                "type": "string",
                            },
                        },
                        "type": "object",
                        "xml": {
                            "name": "tag",
                        },
                    },
                },
            },
            "info": {
                "contact": {
                    "email": "apiteam@swagger.io",
                },
                "description": "This is a sample Pet Store Server based on the OpenAPI 3.0 specification.  You can find out more about
    Swagger at [https://swagger.io](https://swagger.io). In the third iteration of the pet store, we've switched to the design first approach!
    You can now help us improve the API whether it's by making changes to the definition itself or to the code.
    That way, with time, we can improve the API in general, and expose some of the new features in OAS3.

    _If you're looking for the Swagger 2.0/OAS 2.0 version of Petstore, then click [here](https://editor.swagger.io/?url=https://petstore.swagger.io/v2/swagger.yaml). Alternatively, you can load via the \`Edit > Load Petstore OAS 2.0\` menu option!_

    Some useful links:
    - [The Pet Store repository](https://github.com/swagger-api/swagger-petstore)
    - [The source API definition for the Pet Store](https://github.com/swagger-api/swagger-petstore/blob/master/src/main/resources/openapi.yaml)",
                "license": {
                    "name": "Apache 2.0",
                    "url": "http://www.apache.org/licenses/LICENSE-2.0.html",
                },
                "termsOfService": "http://swagger.io/terms/",
                "title": "Swagger Petstore - OpenAPI 3.0",
                "version": "1.0.11",
            },
            "openapi": "3.0.3",
            "paths": {
                "/pet/findByStatus": {
                    "get": {
                        "description": "Multiple status values can be provided with comma separated strings",
                        "operationId": "findPetsByStatus",
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "items": {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            "type": "array",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "400": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "string",
                                        },
                                    },
                                },
                                "description": "Invalid status value",
                            },
                            "500": {
                                "description": "Network error",
                            },
                        },
                        "summary": "Finds Pets by status",
                        "tags": [
                            "pet",
                        ],
                    },
                },
                "/pet/findByTags": {
                    "get": {
                        "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                        "operationId": "findPetsByTags",
                        "responses": {
                            "200": {
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "items": {
                                                "$ref": "#/components/schemas/Pet",
                                            },
                                            "type": "array",
                                        },
                                    },
                                },
                                "description": "successful operation",
                            },
                            "400": {
                                "description": "Invalid tag value",
                            },
                        },
                        "summary": "Finds Pets by tags",
                        "tags": [
                            "pet",
                        ],
                    },
                },
            },
        },
        "endpoints": [
            {
                "description": "Multiple status values can be provided with comma separated strings",
                "errors": [
                    {
                        "description": "Invalid status value",
                        "schema": "z.string()",
                        "status": 400,
                    },
                    {
                        "description": "Network error",
                        "schema": "z.void()",
                        "status": 500,
                    },
                ],
                "method": "get",
                "parameters": [],
                "path": "/pet/findByStatus",
                "requestFormat": "json",
                "response": "z.array(Pet)",
                "responses": [
                    {
                        "description": "successful operation",
                        "schema": "z.array(Pet)",
                        "statusCode": "200",
                    },
                    {
                        "description": "Invalid status value",
                        "schema": "z.string()",
                        "statusCode": "400",
                    },
                    {
                        "description": "Network error",
                        "schema": "z.void()",
                        "statusCode": "500",
                    },
                ],
            },
            {
                "description": "Multiple tags can be provided with comma separated strings. Use tag1, tag2, tag3 for testing.",
                "errors": [
                    {
                        "description": "Invalid tag value",
                        "schema": "z.void()",
                        "status": 400,
                    },
                ],
                "method": "get",
                "parameters": [],
                "path": "/pet/findByTags",
                "requestFormat": "json",
                "response": "z.array(Pet)",
                "responses": [
                    {
                        "description": "successful operation",
                        "schema": "z.array(Pet)",
                        "statusCode": "200",
                    },
                    {
                        "description": "Invalid tag value",
                        "schema": "z.void()",
                        "statusCode": "400",
                    },
                ],
            },
        ],
        "issues": {
            "ignoredFallbackResponse": [],
            "ignoredGenericError": [],
        },
        "refsDependencyGraph": {
            "#/components/schemas/Pet": Set {
                "#/components/schemas/Category",
                "#/components/schemas/Tag",
            },
        },
        "schemaByName": {},
        "zodSchemaByName": {
            "Category": "z.object({ id: z.number().int(), name: z.string() }).partial().passthrough()",
            "Pet": "z.object({ id: z.number().int().optional(), name: z.string(), category: Category.optional(), photoUrls: z.array(z.string()), tags: z.array(Tag).optional(), status: z.enum(["available", "pending", "sold"]).optional() }).passthrough()",
            "Tag": "z.object({ id: z.number().int(), name: z.string() }).partial().passthrough()",
        },
    }
  `);
});
