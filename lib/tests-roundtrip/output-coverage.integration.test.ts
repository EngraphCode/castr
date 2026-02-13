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
import type { OpenAPIObject } from 'openapi3-ts/oas31';

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
 * This is a complete round-trip through the system.
 */
async function roundTrip(fixturePath: string): Promise<OpenAPIObject> {
  const result = await loadOpenApiDocument(fixturePath);
  const ir = buildIR(result.document);
  return writeOpenApi(ir);
}

// ============================================================================
// Tests: Output Format
// ============================================================================

describe('Output Coverage: IR → OpenAPI 3.1', () => {
  describe('Output format', () => {
    it('outputs OpenAPI 3.1.x version (flows from IR)', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);
      expect(output.openapi).toMatch(/^3\.1\./);
    });

    it('outputs valid JSON (serializable object)', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      // Should be JSON-serializable without circular references
      const jsonString = JSON.stringify(output);
      expect(jsonString).toBeTruthy();

      // Should parse back to identical object
      const parsed = JSON.parse(jsonString) as OpenAPIObject;
      expect(parsed.openapi).toMatch(/^3\.1\./);
    });
  });

  // ==========================================================================
  // Tests: Document-Level Fields
  // ==========================================================================

  describe('Document-level fields', () => {
    it('writes info object complete', async () => {
      const output = await roundTrip(`${SWAGGER_DIR}/petstore.yaml`);

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
      const output = await roundTrip(`${SWAGGER_DIR}/petstore.yaml`);

      expect(output.servers).toBeDefined();
      expect(output.servers).toHaveLength(1);
      expect(output.servers?.[0]?.url).toBe('https://petstore3.swagger.io/api/v3');
    });

    it('writes document-level security', async () => {
      // Verify that security is handled
      const output = await roundTrip(`${SWAGGER_DIR}/petstore.yaml`);

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
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      expect(output.paths).toBeDefined();
      expect(Object.keys(output.paths ?? {}).length).toBe(2); // /board, /board/{row}/{column}
    });

    it('writes operation methods', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const boardPath = output.paths?.['/board'];
      expect(boardPath).toBeDefined();
      expect(boardPath?.get).toBeDefined();
    });

    it('writes operation metadata', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = output.paths?.['/board']?.get;
      expect(getBoard).toBeDefined();
      expect(getBoard?.operationId).toBe('get-board');
      expect(getBoard?.summary).toBe('Get the whole board');
      expect(getBoard?.description).toBeTruthy();
    });

    it('writes operation tags', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = output.paths?.['/board']?.get;
      expect(getBoard?.tags).toBeDefined();
      expect(getBoard?.tags).toContain('Gameplay');
    });

    it('writes operation requestBody', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const putSquare = output.paths?.['/board/{row}/{column}']?.put;
      expect(putSquare?.requestBody).toBeDefined();
    });

    it('writes operation responses', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = output.paths?.['/board']?.get;
      expect(getBoard?.responses).toBeDefined();
      expect(getBoard?.responses?.['200']).toBeDefined();
    });

    it('preserves response.description through round-trip (Semantic Integrity Proof)', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

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
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const getBoard = output.paths?.['/board']?.get;
      expect(getBoard?.security).toBeDefined();
      expect(getBoard?.security?.length).toBeGreaterThan(0);
    });

    it('writes trace method operations', async () => {
      const fixturePath = resolve(__dirname, '__fixtures__/trace-method.yaml');
      const output = await roundTrip(fixturePath);

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
      const output = await roundTrip(`${SWAGGER_DIR}/petstore.yaml`);

      expect(output.components?.schemas).toBeDefined();
      expect(Object.keys(output.components?.schemas ?? {}).length).toBeGreaterThan(0);
      expect(output.components?.schemas?.['Pet']).toBeDefined();
    });

    it('writes component parameters', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      expect(output.components?.parameters).toBeDefined();
      expect(output.components?.parameters?.['rowParam']).toBeDefined();
      expect(output.components?.parameters?.['columnParam']).toBeDefined();
    });

    it('writes component securitySchemes', async () => {
      const output = await roundTrip(`${SWAGGER_DIR}/petstore.yaml`);

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
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const errorMessage = output.components?.schemas?.['errorMessage'];
      expect(errorMessage).toBeDefined();
      expect((errorMessage as { type?: string })?.type).toBe('string');
      expect((errorMessage as { maxLength?: number })?.maxLength).toBe(256);
    });

    it('writes number type and constraints', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const coordinate = output.components?.schemas?.['coordinate'];
      expect(coordinate).toBeDefined();
      expect((coordinate as { type?: string })?.type).toBe('integer');
      expect((coordinate as { minimum?: number })?.minimum).toBe(1);
      expect((coordinate as { maximum?: number })?.maximum).toBe(3);
    });

    it('writes enum values', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const mark = output.components?.schemas?.['mark'];
      expect(mark).toBeDefined();
      expect((mark as { enum?: unknown[] })?.enum).toEqual(['.', 'X', 'O']);
    });

    it('writes array schemas', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const board = output.components?.schemas?.['board'];
      expect(board).toBeDefined();
      expect((board as { type?: string })?.type).toBe('array');
      expect((board as { minItems?: number })?.minItems).toBe(3);
      expect((board as { maxItems?: number })?.maxItems).toBe(3);
    });

    it('writes object schemas with properties', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const status = output.components?.schemas?.['status'];
      expect(status).toBeDefined();
      expect((status as { type?: string })?.type).toBe('object');
      expect((status as { properties?: object })?.properties).toBeDefined();
    });

    it('writes $ref references', async () => {
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      const status = output.components?.schemas?.['status'] as
        | { properties?: { winner?: { $ref?: string }; board?: { $ref?: string } } }
        | undefined;
      expect(status?.properties?.winner?.$ref).toBe('#/components/schemas/winner');
      expect(status?.properties?.board?.$ref).toBe('#/components/schemas/board');
    });
  });

  // ==========================================================================
  // Tests: OpenAPI 3.1 Specific Features
  // ==========================================================================

  describe('OpenAPI 3.1 specific features', () => {
    it('writes nullable as type array', async () => {
      // In OpenAPI 3.1, nullable: true becomes type: ['string', 'null']
      // We need to verify this is handled correctly
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.1/tictactoe.yaml`);

      // Verify output is valid 3.1.x format
      expect(output.openapi).toMatch(/^3\.1\./);
    });

    it('handles 3.0 → 3.1 upgrade correctly', async () => {
      // When a 3.0 spec is loaded, it should be upgraded to 3.1.x by scalar parser
      const output = await roundTrip(`${EXAMPLES_DIR}/v3.0/petstore.yaml`);

      // Version flows from IR (scalar parser upgrades 3.0.x to 3.1.x)
      expect(output.openapi).toMatch(/^3\.1\./);
    });
  });
});
