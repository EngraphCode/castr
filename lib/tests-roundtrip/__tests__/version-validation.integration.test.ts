/**
 * Comprehensive OpenAPI Version Validation Tests
 *
 * PROVES that the parser correctly validates OpenAPI documents against their declared version:
 * - Valid 3.0.x and 3.1.x specs MUST be accepted
 * - Invalid specs (wrong version features, missing required fields) MUST be rejected
 *
 * Per RULES.md: "Fail fast, fail hard, be strict at all times"
 *
 * @module
 */

import { describe, it, expect } from 'vitest';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURES_DIR = resolve(__dirname, '../__fixtures__');

describe('OpenAPI Version Validation', () => {
  // =========================================================================
  // VALID 3.0.x SPECS - MUST PASS
  // =========================================================================
  describe('Valid 3.0.x specs MUST be accepted', () => {
    it('accepts minimal valid 3.0.x spec', async () => {
      const result = await loadOpenApiDocument(`${FIXTURES_DIR}/valid/3.0.x/minimal-valid.yaml`);
      expect(result.document).toBeDefined();
      expect(result.document.openapi).toMatch(/^3\.1\./); // Upgraded to 3.1.x
    });

    it('accepts complete 3.0.x spec with all fields', async () => {
      const result = await loadOpenApiDocument(`${FIXTURES_DIR}/valid/3.0.x/complete-fields.yaml`);
      expect(result.document).toBeDefined();
      expect(result.document.info.title).toBe('Complete Fields API');
    });

    it('accepts 3.0.x spec with nullable: true syntax', async () => {
      const result = await loadOpenApiDocument(`${FIXTURES_DIR}/valid/3.0.x/nullable-syntax.yaml`);
      expect(result.document).toBeDefined();
    });
  });

  // =========================================================================
  // VALID 3.1.x SPECS - MUST PASS
  // =========================================================================
  describe('Valid 3.1.x specs MUST be accepted', () => {
    it('accepts minimal valid 3.1.x spec', async () => {
      const result = await loadOpenApiDocument(`${FIXTURES_DIR}/valid/3.1.x/minimal-valid.yaml`);
      expect(result.document).toBeDefined();
      expect(result.document.openapi).toMatch(/^3\.1\./);
    });

    it('accepts complete 3.1.x spec with all fields including new additions', async () => {
      const result = await loadOpenApiDocument(`${FIXTURES_DIR}/valid/3.1.x/complete-fields.yaml`);
      expect(result.document).toBeDefined();
      expect(result.document.info.title).toBe('Complete Fields API');
    });

    it('accepts 3.1.x spec with webhooks only (no paths)', async () => {
      const result = await loadOpenApiDocument(`${FIXTURES_DIR}/valid/3.1.x/webhooks-only.yaml`);
      expect(result.document).toBeDefined();
      expect(result.document.webhooks).toBeDefined();
    });

    it('accepts 3.1.x spec with type array and null', async () => {
      const result = await loadOpenApiDocument(`${FIXTURES_DIR}/valid/3.1.x/type-array-null.yaml`);
      expect(result.document).toBeDefined();
    });

    it('accepts 3.1.x spec with jsonSchemaDialect', async () => {
      const result = await loadOpenApiDocument(
        `${FIXTURES_DIR}/valid/3.1.x/json-schema-dialect.yaml`,
      );
      expect(result.document).toBeDefined();
    });
  });

  // =========================================================================
  // JSON FORMAT TESTS - MUST PASS (proves JSON handling works)
  // =========================================================================
  describe('JSON format specs MUST be accepted', () => {
    it('accepts valid 3.0.x spec in JSON format', async () => {
      const result = await loadOpenApiDocument(`${FIXTURES_DIR}/valid/3.0.x/minimal-valid.json`);
      expect(result.document).toBeDefined();
      expect(result.document.info.title).toBe('Minimal Valid API (JSON)');
    });

    it('accepts valid 3.1.x spec in JSON format', async () => {
      const result = await loadOpenApiDocument(`${FIXTURES_DIR}/valid/3.1.x/complete-fields.json`);
      expect(result.document).toBeDefined();
      expect(result.document.info.title).toBe('Complete Fields API (JSON)');
      expect(result.document.webhooks).toBeDefined();
    });

    it('REJECTS invalid 3.0.x spec in JSON format', async () => {
      await expect(
        loadOpenApiDocument(
          `${FIXTURES_DIR}/invalid/3.0.x-with-3.1.x-fields/has-jsonSchemaDialect.json`,
        ),
      ).rejects.toThrow(/jsonSchemaDialect|not expected|not allowed/i);
    });
  });

  // =========================================================================
  // INVALID 3.0.x WITH 3.1.x FIELDS - MUST REJECT
  // =========================================================================
  describe('3.0.x with 3.1.x-only fields MUST be rejected', () => {
    it('REJECTS 3.0.x with jsonSchemaDialect (3.1.x only)', async () => {
      await expect(
        loadOpenApiDocument(
          `${FIXTURES_DIR}/invalid/3.0.x-with-3.1.x-fields/has-jsonSchemaDialect.yaml`,
        ),
      ).rejects.toThrow(/jsonSchemaDialect|not expected|not allowed/i);
    });

    it('REJECTS 3.0.x with webhooks (3.1.x only)', async () => {
      await expect(
        loadOpenApiDocument(`${FIXTURES_DIR}/invalid/3.0.x-with-3.1.x-fields/has-webhooks.yaml`),
      ).rejects.toThrow(/webhooks|not expected|not allowed/i);
    });

    it('REJECTS 3.0.x with type: null (3.1.x only)', async () => {
      await expect(
        loadOpenApiDocument(`${FIXTURES_DIR}/invalid/3.0.x-with-3.1.x-fields/has-type-null.yaml`),
      ).rejects.toThrow(/type|null|enum|not allowed/i);
    });

    it('REJECTS 3.0.x with type array (3.1.x only)', async () => {
      await expect(
        loadOpenApiDocument(`${FIXTURES_DIR}/invalid/3.0.x-with-3.1.x-fields/has-type-array.yaml`),
      ).rejects.toThrow(/type|array|string|not allowed/i);
    });

    it('REJECTS 3.0.x without paths (required in 3.0.x)', async () => {
      await expect(
        loadOpenApiDocument(`${FIXTURES_DIR}/invalid/3.0.x-with-3.1.x-fields/missing-paths.yaml`),
      ).rejects.toThrow(/paths|required/i);
    });
  });

  // =========================================================================
  // NOTE: 3.1.x with 3.0.x-only fields (nullable: true, boolean exclusiveMinimum)
  // are NOT tested here. Scalar validator does not reject these constructs.
  // See scalar-behavior.integration.test.ts for documented Scalar limitations.
  // =========================================================================

  // =========================================================================
  // COMMON INVALID CASES - MUST REJECT
  // =========================================================================
  describe('Common invalid cases MUST be rejected', () => {
    it('REJECTS spec missing required info object', async () => {
      await expect(
        loadOpenApiDocument(`${FIXTURES_DIR}/invalid/common/missing-info.yaml`),
      ).rejects.toThrow(/info|required/i);
    });

    it('REJECTS spec missing required openapi version field', async () => {
      await expect(
        loadOpenApiDocument(`${FIXTURES_DIR}/invalid/common/missing-openapi.yaml`),
      ).rejects.toThrow(/openapi|required/i);
    });

    it('REJECTS spec with response missing required description', async () => {
      await expect(
        loadOpenApiDocument(`${FIXTURES_DIR}/invalid/common/missing-response-description.yaml`),
      ).rejects.toThrow(/description|\$ref|required/i);
    });

    it('REJECTS spec with invalid openapi version (2.0)', async () => {
      await expect(
        loadOpenApiDocument(`${FIXTURES_DIR}/invalid/common/invalid-openapi-version.yaml`),
      ).rejects.toThrow(/openapi|version|pattern|2\.0/i);
    });
  });
});
