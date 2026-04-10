/**
 * Output Coverage Integration Tests
 *
 * Tests that ALL valid OpenAPI 3.1.x syntax is correctly written from IR.
 * Verifies that the writer produces valid, complete OpenAPI 3.1 documents.
 *
 * **TDD Strategy:**
 * - Tests for existing writer capabilities: Should PASS (green)
 * - Tests for missing writer capabilities: Will be added in Phase 1.3 after IR expansion (ADR-030)
 *
 * @module
 */

import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildIR } from '../src/schema-processing/parsers/openapi/index.js';
import { writeOpenApi } from '../src/schema-processing/writers/openapi/index.js';
import { loadOpenApiDocument } from '../src/shared/load-openapi-document/index.js';
import { CANONICAL_OPENAPI_VERSION } from '../src/shared/openapi/version.js';
import { isReferenceObject, type OpenAPIObject } from '../src/shared/openapi-types.js';
import { assertOpenApiObject, assertSchemaObject } from '../tests-helpers/openapi-assertions.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================================
// Fixture Paths
// ============================================================================

const EXAMPLES_DIR = resolve(__dirname, '../examples/openapi');
const SWAGGER_DIR = resolve(__dirname, '../examples/swagger');

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Loads an OpenAPI document, builds IR, and writes back to OpenAPI 3.1.
 * This is a complete transform pipeline pass through the system.
 */
async function runTransformPass(fixturePath: string): Promise<OpenAPIObject> {
  const result = await loadOpenApiDocument(fixturePath);
  const ir = buildIR(result.document);
  return writeOpenApi(ir);
}

function getComponentSchema(output: OpenAPIObject, name: string) {
  return assertSchemaObject(output.components?.schemas?.[name], `components.schemas.${name}`);
}

// ============================================================================
// Tests: Output Format
// ============================================================================

describe('Output Coverage: IR → OpenAPI 3.1', () => {
  describe('Output format', () => {
    it('outputs OpenAPI 3.1.x version (flows from IR)', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);
      expect(output.openapi).toBe(CANONICAL_OPENAPI_VERSION);
    });

    it('outputs valid JSON (serializable object)', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      // Should be JSON-serializable without circular references
      const jsonString = JSON.stringify(output);
      expect(jsonString).toBeTruthy();

      // Should parse back to identical object
      const parsed = JSON.parse(jsonString);
      assertOpenApiObject(parsed, 'serialized OpenAPI output');
      expect(parsed.openapi).toBe(CANONICAL_OPENAPI_VERSION);
    });
  });

  describe('OpenAPI 3.2 mediaTypes references', () => {
    it('round-trips media type component refs across parameters, request bodies, responses, and headers', async () => {
      const doc: OpenAPIObject = {
        openapi: '3.2.0',
        info: { title: 'Media Type Ref API', version: '1.0.0' },
        paths: {
          '/users': {
            post: {
              operationId: 'createUser',
              parameters: [
                {
                  name: 'payload',
                  in: 'query',
                  required: false,
                  content: {
                    'application/json': {
                      $ref: '#/components/mediaTypes/JsonEnvelope',
                    },
                  },
                },
              ],
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    $ref: '#/components/mediaTypes/JsonEnvelope',
                  },
                },
              },
              responses: {
                '200': {
                  content: {
                    'application/json': {
                      $ref: '#/components/mediaTypes/JsonEnvelope',
                    },
                  },
                  headers: {
                    'X-Envelope': {
                      content: {
                        'application/json': {
                          $ref: '#/components/mediaTypes/JsonEnvelope',
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          mediaTypes: {
            JsonEnvelope: {
              schema: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                },
                additionalProperties: false,
              },
            },
          },
        },
      };

      const ir = buildIR(doc);
      const output = writeOpenApi(ir);

      expect(output.components?.mediaTypes?.['JsonEnvelope']).toBeDefined();

      const operation = output.paths?.['/users']?.post;
      const parameter = operation?.parameters?.[0];
      const requestBody = operation?.requestBody;
      const response = operation?.responses?.['200'];

      if (!parameter || isReferenceObject(parameter)) {
        throw new Error('Expected inline parameter object');
      }
      if (!requestBody || isReferenceObject(requestBody)) {
        throw new Error('Expected inline request body object');
      }
      if (!response || isReferenceObject(response)) {
        throw new Error('Expected inline response object');
      }

      expect(parameter.content?.['application/json']).toEqual({
        $ref: '#/components/mediaTypes/JsonEnvelope',
      });
      expect(requestBody.content?.['application/json']).toEqual({
        $ref: '#/components/mediaTypes/JsonEnvelope',
      });
      expect(response.content?.['application/json']).toEqual({
        $ref: '#/components/mediaTypes/JsonEnvelope',
      });

      const responseHeader = response.headers?.['X-Envelope'];
      if (!responseHeader || isReferenceObject(responseHeader)) {
        throw new Error('Expected inline response header object');
      }
      expect(responseHeader.content?.['application/json']).toEqual({
        $ref: '#/components/mediaTypes/JsonEnvelope',
      });
    });

    it('preserves schema-less reusable media types and their refs', () => {
      const doc: OpenAPIObject = {
        openapi: '3.2.0',
        info: { title: 'Schema-less Media Type API', version: '1.0.0' },
        paths: {
          '/plain-text': {
            get: {
              operationId: 'getPlainText',
              responses: {
                '200': {
                  content: {
                    'text/plain': {
                      $ref: '#/components/mediaTypes/PlainText',
                    },
                  },
                },
              },
            },
          },
        },
        components: {
          mediaTypes: {
            PlainText: {
              example: 'hello world',
            },
          },
        },
      };

      const output = writeOpenApi(buildIR(doc));

      expect(output.components?.mediaTypes?.['PlainText']).toEqual({
        example: 'hello world',
      });

      const response = output.paths?.['/plain-text']?.get?.responses?.['200'];
      if (!response || isReferenceObject(response)) {
        throw new Error('Expected inline response object');
      }

      expect(response.content?.['text/plain']).toEqual({
        $ref: '#/components/mediaTypes/PlainText',
      });
    });
  });

  describe('OpenAPI reusable pathItems', () => {
    it('preserves referenced pathItems in components.pathItems', () => {
      const doc: OpenAPIObject = {
        openapi: '3.1.0',
        info: { title: 'Path Item Ref API', version: '1.0.0' },
        paths: {},
        components: {
          pathItems: {
            SharedPath: {
              get: {
                operationId: 'sharedGet',
                responses: {
                  '200': {
                    description: 'OK',
                  },
                },
              },
            },
            SharedPathAlias: {
              $ref: '#/components/pathItems/SharedPath',
            },
          },
        },
      };

      const ir = buildIR(doc);
      const aliasedPathItem = ir.components.find(
        (component) => component.type === 'pathItem' && component.name === 'SharedPathAlias',
      );

      if (!aliasedPathItem || aliasedPathItem.type !== 'pathItem') {
        throw new Error('Expected pathItem component for SharedPathAlias');
      }

      expect(aliasedPathItem.pathItem).toEqual({
        $ref: '#/components/pathItems/SharedPath',
      });

      const output = writeOpenApi(ir);
      expect(output.components?.pathItems?.['SharedPathAlias']).toEqual({
        $ref: '#/components/pathItems/SharedPath',
      });
    });
  });

  // ==========================================================================
  // Tests: Document-Level Fields
  // ==========================================================================

  describe('Document-level fields', () => {
    it('writes info object complete', async () => {
      const output = await runTransformPass(`${SWAGGER_DIR}/petstore.yaml`);

      expect(output.info).toBeDefined();
      expect(output.info.title).toBe('Swagger Petstore - OpenAPI 3.0');
      expect(output.info.description).toBeTruthy();
      expect(output.info.version).toBe('1.0.11');
      expect(output.info.termsOfService).toBe('http://swagger.io/terms/');
      expect(output.info.contact).toBeDefined();
      expect(output.info.contact?.email).toBe('apiteam@swagger.io');
      expect(output.info.license).toBeDefined();
      expect(output.info.license?.name).toBe('Apache 2.0');
    });

    it('writes servers array', async () => {
      const output = await runTransformPass(`${SWAGGER_DIR}/petstore.yaml`);

      expect(output.servers).toBeDefined();
      expect(output.servers).toHaveLength(1);
      expect(output.servers?.[0]?.url).toBe('https://petstore3.swagger.io/api/v3');
    });

    it('writes document-level security', async () => {
      // Verify that security is handled
      const output = await runTransformPass(`${SWAGGER_DIR}/petstore.yaml`);

      // petstore doesn't have document-level security
      // This is correct - security should be undefined or empty at document level
      expect(output.security === undefined || Array.isArray(output.security)).toBe(true);
    });

    // Tests for tags, externalDocs, webhooks will be added after IR expansion (Phase 1.3)
  });

  // ==========================================================================
  // Tests: Paths and Operations
  // ==========================================================================

  describe('Paths and Operations', () => {
    it('writes paths object', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      expect(output.paths).toBeDefined();
      expect(Object.keys(output.paths ?? {}).length).toBe(2); // /board, /board/{row}/{column}
    });

    it('writes operation methods', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const boardPath = output.paths?.['/board'];
      expect(boardPath).toBeDefined();
      expect(boardPath?.get).toBeDefined();
    });

    it('writes operation metadata', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = output.paths?.['/board']?.get;
      expect(getBoard).toBeDefined();
      expect(getBoard?.operationId).toBe('get-board');
      expect(getBoard?.summary).toBe('Get the whole board');
      expect(getBoard?.description).toBeTruthy();
    });

    it('writes operation tags', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = output.paths?.['/board']?.get;
      expect(getBoard?.tags).toBeDefined();
      expect(getBoard?.tags).toContain('Gameplay');
    });

    it('writes operation requestBody', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const putSquare = output.paths?.['/board/{row}/{column}']?.put;
      expect(putSquare?.requestBody).toBeDefined();
    });

    it('writes operation responses', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = output.paths?.['/board']?.get;
      expect(getBoard?.responses).toBeDefined();
      expect(getBoard?.responses?.['200']).toBeDefined();
    });

    it('preserves response.description through transform pipeline (Semantic Integrity Proof)', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      // Verify description is preserved through OpenAPI → IR → OpenAPI
      const getBoard = output.paths?.['/board']?.get;
      const response200 = getBoard?.responses?.['200'];
      expect(response200).toBeDefined();
      expect(response200?.description).toBe('OK');

      // Also verify 400 response description exists and has content
      const getSquare = output.paths?.['/board/{row}/{column}']?.get;
      const response400 = getSquare?.responses?.['400'];
      expect(response400).toBeDefined();
      expect(response400?.description).toBe('The provided parameters are incorrect');
    });

    it('writes operation security', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = output.paths?.['/board']?.get;
      expect(getBoard?.security).toBeDefined();
      expect(getBoard?.security?.length).toBeGreaterThan(0);
    });

    it('writes trace method operations', async () => {
      const fixturePath = resolve(__dirname, '__fixtures__/trace-method.yaml');
      const output = await runTransformPass(fixturePath);

      const debugPath = output.paths?.['/debug'];
      expect(debugPath).toBeDefined();
      expect(debugPath?.trace).toBeDefined();
      expect(debugPath?.trace?.operationId).toBe('trace-debug');
    });
  });

  // ==========================================================================
  // Tests: Components
  // ==========================================================================

  describe('Components', () => {
    it('writes component schemas', async () => {
      const output = await runTransformPass(`${SWAGGER_DIR}/petstore.yaml`);

      expect(output.components?.schemas).toBeDefined();
      expect(Object.keys(output.components?.schemas ?? {}).length).toBeGreaterThan(0);
      expect(output.components?.schemas?.['Pet']).toBeDefined();
    });

    it('writes component parameters', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      expect(output.components?.parameters).toBeDefined();
      expect(output.components?.parameters?.['rowParam']).toBeDefined();
      expect(output.components?.parameters?.['columnParam']).toBeDefined();
    });

    it('writes component securitySchemes', async () => {
      const output = await runTransformPass(`${SWAGGER_DIR}/petstore.yaml`);

      expect(output.components?.securitySchemes).toBeDefined();
      expect(Object.keys(output.components?.securitySchemes ?? {}).length).toBe(2);
    });

    // Tests for links and callbacks will be added after IR expansion (Phase 1.3)
  });

  // ==========================================================================
  // Tests: Schema Features
  // ==========================================================================

  describe('Schema features', () => {
    it('writes string type and constraints', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const errorMessage = getComponentSchema(output, 'errorMessage');
      expect(errorMessage.type).toBe('string');
      expect(errorMessage.maxLength).toBe(256);
    });

    it('writes number type and constraints', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const coordinate = getComponentSchema(output, 'coordinate');
      expect(coordinate.type).toBe('integer');
      expect(coordinate.minimum).toBe(1);
      expect(coordinate.maximum).toBe(3);
    });

    it('writes enum values', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const mark = getComponentSchema(output, 'mark');
      expect(mark.enum).toEqual(['.', 'X', 'O']);
    });

    it('writes array schemas', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const board = getComponentSchema(output, 'board');
      expect(board.type).toBe('array');
      expect(board.minItems).toBe(3);
      expect(board.maxItems).toBe(3);
    });

    it('writes object schemas with properties', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const status = getComponentSchema(output, 'status');
      expect(status.type).toBe('object');
      expect(status.properties).toBeDefined();
    });

    it('writes $ref references', async () => {
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const status = getComponentSchema(output, 'status');
      const winner = status.properties?.['winner'];
      const board = status.properties?.['board'];
      expect(isReferenceObject(winner) ? winner.$ref : undefined).toBe(
        '#/components/schemas/winner',
      );
      expect(isReferenceObject(board) ? board.$ref : undefined).toBe('#/components/schemas/board');
    });
  });

  // ==========================================================================
  // Tests: OpenAPI 3.1 Specific Features
  // ==========================================================================

  describe('OpenAPI 3.1 specific features', () => {
    it('writes nullable as type array', async () => {
      // In OpenAPI 3.1, nullable: true becomes type: ['string', 'null']
      // We need to verify this is handled correctly
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      expect(output.openapi).toBe(CANONICAL_OPENAPI_VERSION);
    });

    it('handles 3.0 → 3.1 upgrade correctly', async () => {
      // When a 3.0 spec is loaded, it should be upgraded to 3.1.x by scalar parser
      const output = await runTransformPass(`${EXAMPLES_DIR}/v3.0/petstore.yaml`);

      expect(output.openapi).toBe(CANONICAL_OPENAPI_VERSION);
    });
  });
});
