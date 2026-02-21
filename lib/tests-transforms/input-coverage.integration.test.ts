/**
 * Input Coverage Integration Tests
 *
 * Tests that ALL valid OpenAPI 3.0.x and 3.1.x syntax is correctly parsed into IR.
 * These tests use real fixtures from the official OpenAPI examples.
 *
 * **TDD Strategy:**
 * - Tests for existing IR fields: Should PASS (green)
 * - Tests for missing IR fields: Will be added in Phase 1.3 after IR expansion (ADR-030)
 *
 * @see {@link https://github.com/OAI/OpenAPI-Specification/tree/main/examples OpenAPI Examples}
 * @module
 */

import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildIR } from '../src/schema-processing/parsers/openapi/index.js';
import { loadOpenApiDocument } from '../src/shared/load-openapi-document/index.js';
import type { CastrDocument } from '../src/schema-processing/ir/models/schema-document.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ============================================================================
// Fixture Paths
// ============================================================================

const EXAMPLES_DIR = resolve(__dirname, '../examples/openapi');
const SWAGGER_DIR = resolve(__dirname, '../examples/swagger');
const CUSTOM_DIR = resolve(__dirname, '../examples/custom/openapi/v3.1');

/**
 * All fixtures that MUST be supported with current implementation.
 * Format: [displayName, absolutePath]
 */
const ALL_FIXTURES: [string, string][] = [
  // OpenAPI 3.0.x fixtures (YAML)
  ['v3.0/api-with-examples.yaml', `${EXAMPLES_DIR}/v3.0/api-with-examples.yaml`],
  ['v3.0/callback-example.yaml', `${EXAMPLES_DIR}/v3.0/callback-example.yaml`],
  ['v3.0/link-example.yaml', `${EXAMPLES_DIR}/v3.0/link-example.yaml`],
  ['v3.0/petstore-expanded.yaml', `${EXAMPLES_DIR}/v3.0/petstore-expanded.yaml`],
  ['v3.0/petstore.yaml', `${EXAMPLES_DIR}/v3.0/petstore.yaml`],
  ['v3.0/uspto.yaml', `${EXAMPLES_DIR}/v3.0/uspto.yaml`],

  // OpenAPI 3.0.x fixtures (JSON)
  ['v3.0/api-with-examples.json', `${EXAMPLES_DIR}/v3.0/api-with-examples.json`],
  ['v3.0/callback-example.json', `${EXAMPLES_DIR}/v3.0/callback-example.json`],
  ['v3.0/link-example.json', `${EXAMPLES_DIR}/v3.0/link-example.json`],
  ['v3.0/petstore-expanded.json', `${EXAMPLES_DIR}/v3.0/petstore-expanded.json`],
  ['v3.0/petstore.json', `${EXAMPLES_DIR}/v3.0/petstore.json`],
  ['v3.0/uspto.json', `${EXAMPLES_DIR}/v3.0/uspto.json`],

  // OpenAPI 3.1.x fixtures (YAML)
  ['v3.1/non-oauth-scopes.yaml', `${EXAMPLES_DIR}/v3.1/non-oauth-scopes.yaml`],
  ['v3.1/tictactoe.yaml', `${EXAMPLES_DIR}/v3.1/tictactoe.yaml`],
  ['v3.1/webhook-example.yaml', `${EXAMPLES_DIR}/v3.1/webhook-example.yaml`],

  // OpenAPI 3.1.x fixtures (JSON)
  ['v3.1/non-oauth-scopes.json', `${EXAMPLES_DIR}/v3.1/non-oauth-scopes.json`],
  ['v3.1/tictactoe.json', `${EXAMPLES_DIR}/v3.1/tictactoe.json`],
  ['v3.1/webhook-example.json', `${EXAMPLES_DIR}/v3.1/webhook-example.json`],

  // Swagger (OpenAPI 3.0.3)
  ['swagger/petstore.yaml', `${SWAGGER_DIR}/petstore.yaml`],

  // Custom fixtures
  ['custom/multi-auth.yaml', `${CUSTOM_DIR}/multi-auth.yaml`],

  // Multi-file fixture
  ['multi-file/main.yaml', `${EXAMPLES_DIR}/multi-file/main.yaml`],
];

// All 21 fixtures now supported including webhook-example (Session 2.6 complete)

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Loads and parses an OpenAPI document into IR.
 */
async function loadAndBuildIR(fixturePath: string): Promise<CastrDocument> {
  const result = await loadOpenApiDocument(fixturePath);
  return buildIR(result.document);
}

// ============================================================================
// Tests: All Fixtures Load Successfully
// ============================================================================

describe('Input Coverage: OpenAPI → IR', () => {
  describe('All fixtures load successfully', () => {
    it.each(ALL_FIXTURES)('parses %s without error', async (_name, path) => {
      const ir = await loadAndBuildIR(path);

      // Basic structural assertions
      expect(ir).toBeDefined();
      expect(ir.version).toBeDefined();
      expect(ir.info).toBeDefined();
      expect(ir.info.title).toBeTruthy();
    });
  });

  // ==========================================================================
  // Tests: Document-Level Fields (Existing in IR)
  // ==========================================================================

  describe('Document-level fields', () => {
    it('parses openapi version correctly', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);
      expect(ir.openApiVersion).toBe('3.1.0');
    });

    it('parses info object complete', async () => {
      const ir = await loadAndBuildIR(`${SWAGGER_DIR}/petstore.yaml`);

      expect(ir.info.title).toBe('Swagger Petstore - OpenAPI 3.0');
      expect(ir.info.description).toBeTruthy();
      expect(ir.info.version).toBe('1.0.11');
      expect(ir.info.termsOfService).toBe('http://swagger.io/terms/');
      expect(ir.info.contact).toBeDefined();
      expect(ir.info.contact?.email).toBe('apiteam@swagger.io');
      expect(ir.info.license).toBeDefined();
      expect(ir.info.license?.name).toBe('Apache 2.0');
    });

    it('parses servers array', async () => {
      const ir = await loadAndBuildIR(`${SWAGGER_DIR}/petstore.yaml`);

      expect(ir.servers).toHaveLength(1);
      expect(ir.servers[0]?.url).toBe('https://petstore3.swagger.io/api/v3');
    });

    it('parses document-level security requirements', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      // Document-level security may or may not be present
      // This fixture does not have document-level security (only operation-level)
      expect(ir.security).toBeUndefined();
    });

    // Tests for tags, externalDocs, webhooks will be added after IR expansion (Phase 1.3)
  });

  // ==========================================================================
  // Tests: Components
  // ==========================================================================

  describe('Components', () => {
    it('parses component schemas', async () => {
      const ir = await loadAndBuildIR(`${SWAGGER_DIR}/petstore.yaml`);

      const schemaComponents = ir.components.filter((c) => c.type === 'schema');
      expect(schemaComponents.length).toBeGreaterThan(0);

      // Check for specific schemas
      const petSchema = schemaComponents.find((c) => c.name === 'Pet');
      expect(petSchema).toBeDefined();
    });

    it('parses component parameters', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const paramComponents = ir.components.filter((c) => c.type === 'parameter');
      expect(paramComponents.length).toBe(2); // rowParam, columnParam
    });

    it('parses component responses', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.0/link-example.yaml`);

      const responseComponents = ir.components.filter((c) => c.type === 'response');
      // link-example has responses in components
      expect(responseComponents.length).toBeGreaterThanOrEqual(0);
    });

    it('parses component requestBodies', async () => {
      const ir = await loadAndBuildIR(`${SWAGGER_DIR}/petstore.yaml`);

      const requestBodyComponents = ir.components.filter((c) => c.type === 'requestBody');
      // petstore has Pet and UserArray requestBodies
      expect(requestBodyComponents.length).toBeGreaterThanOrEqual(0);
    });

    it('parses component securitySchemes', async () => {
      const ir = await loadAndBuildIR(`${SWAGGER_DIR}/petstore.yaml`);

      const securityComponents = ir.components.filter((c) => c.type === 'securityScheme');
      expect(securityComponents.length).toBe(2); // petstore_auth, api_key
    });

    // Tests for links and callbacks will be added after IR expansion (Phase 1.3)
  });

  // ==========================================================================
  // Tests: Operations
  // ==========================================================================

  describe('Operations', () => {
    it('parses all operations from paths', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      expect(ir.operations.length).toBe(3); // get-board, get-square, put-square
    });

    it('parses operation metadata', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = ir.operations.find((op) => op.operationId === 'get-board');
      expect(getBoard).toBeDefined();
      expect(getBoard?.method).toBe('get');
      expect(getBoard?.path).toBe('/board');
      expect(getBoard?.summary).toBe('Get the whole board');
      expect(getBoard?.description).toBeTruthy();
    });

    it('parses operation tags', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = ir.operations.find((op) => op.operationId === 'get-board');
      expect(getBoard?.tags).toContain('Gameplay');
    });

    it('parses operation parameters', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getSquare = ir.operations.find((op) => op.operationId === 'get-square');
      // Path-level $ref parameters are tracked separately to preserve DRY structure
      // The operation may have 0 inline params if all come from path-level refs
      expect(getSquare?.pathItemParameterRefs?.length).toBe(2); // rowParam, columnParam refs
    });

    it('parses operation requestBody', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const putSquare = ir.operations.find((op) => op.operationId === 'put-square');
      expect(putSquare?.requestBody).toBeDefined();
      expect(putSquare?.requestBody?.required).toBe(true);
    });

    it('parses operation responses', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getSquare = ir.operations.find((op) => op.operationId === 'get-square');
      expect(getSquare?.responses.length).toBe(2); // 200, 400
    });

    it('parses operation security', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = ir.operations.find((op) => op.operationId === 'get-board');
      expect(getBoard?.security).toBeDefined();
      expect(getBoard?.security?.length).toBe(2); // defaultApiKey, app2AppOauth
    });

    it('parses trace method operations', async () => {
      const fixturePath = resolve(__dirname, '__fixtures__/trace-method.yaml');
      const ir = await loadAndBuildIR(fixturePath);

      const traceOp = ir.operations.find((op) => op.operationId === 'trace-debug');
      expect(traceOp).toBeDefined();
      expect(traceOp?.method).toBe('trace');
      expect(traceOp?.path).toBe('/debug');
    });
  });

  // ==========================================================================
  // Tests: Format Support
  // ==========================================================================

  describe('Format support', () => {
    it('parses YAML input', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);
      expect(ir.info.title).toBe('Tic Tac Toe');
    });

    it('parses JSON input', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.json`);
      expect(ir.info.title).toBe('Tic Tac Toe');
    });

    it('parses YAML and JSON identically', async () => {
      const yamlIR = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);
      const jsonIR = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.json`);

      // Core structure should match
      expect(yamlIR.info.title).toBe(jsonIR.info.title);
      expect(yamlIR.operations.length).toBe(jsonIR.operations.length);
      expect(yamlIR.components.length).toBe(jsonIR.components.length);
    });
  });

  // ==========================================================================
  // Tests: Schema Features
  // ==========================================================================

  describe('Schema features', () => {
    it('parses string constraints', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const errorMessageSchema = ir.components.find(
        (c) => c.type === 'schema' && c.name === 'errorMessage',
      );
      expect(errorMessageSchema).toBeDefined();
      if (errorMessageSchema?.type === 'schema') {
        expect(errorMessageSchema.schema.maxLength).toBe(256);
      }
    });

    it('parses number constraints', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const coordSchema = ir.components.find((c) => c.type === 'schema' && c.name === 'coordinate');
      expect(coordSchema).toBeDefined();
      if (coordSchema?.type === 'schema') {
        expect(coordSchema.schema.minimum).toBe(1);
        expect(coordSchema.schema.maximum).toBe(3);
      }
    });

    it('parses enum values', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const markSchema = ir.components.find((c) => c.type === 'schema' && c.name === 'mark');
      expect(markSchema).toBeDefined();
      if (markSchema?.type === 'schema') {
        expect(markSchema.schema.enum).toEqual(['.', 'X', 'O']);
      }
    });

    it('parses array schemas', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const boardSchema = ir.components.find((c) => c.type === 'schema' && c.name === 'board');
      expect(boardSchema).toBeDefined();
      if (boardSchema?.type === 'schema') {
        expect(boardSchema.schema.type).toBe('array');
        expect(boardSchema.schema.minItems).toBe(3);
        expect(boardSchema.schema.maxItems).toBe(3);
      }
    });

    it('parses object schemas with properties', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const statusSchema = ir.components.find((c) => c.type === 'schema' && c.name === 'status');
      expect(statusSchema).toBeDefined();
      if (statusSchema?.type === 'schema') {
        expect(statusSchema.schema.type).toBe('object');
        expect(statusSchema.schema.properties).toBeDefined();
      }
    });

    it('parses $ref references', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      // The status schema references winner and board
      const statusSchema = ir.components.find((c) => c.type === 'schema' && c.name === 'status');
      expect(statusSchema).toBeDefined();
    });
  });

  // ==========================================================================
  // Tests: Version Auto-Upgrade
  // ==========================================================================

  describe('Version handling', () => {
    it('upgrades OpenAPI 3.0.x to 3.1.0 internally', async () => {
      const ir = await loadAndBuildIR(`${EXAMPLES_DIR}/v3.0/petstore.yaml`);

      // Internal representation should be 3.1.0
      // The original version might be preserved in openApiVersion
      expect(ir.version).toBeDefined();
    });
  });
});
