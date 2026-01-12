/**
 * Layer Boundary Enforcement Tests
 *
 * These architectural tests enforce the IR architecture's layer boundaries.
 * After `buildIR()`, the OpenAPI document is conceptually discarded.
 * Writers and MCP layers must only work with IR types (CastrDocument, CastrSchema, etc.).
 *
 * **Protected Layers (no OpenAPIObject allowed):**
 * - `lib/src/writers/**` — Output generation layer
 * - `lib/src/context/template-context.mcp*.ts` — MCP subsystem (excluding tests)
 *
 * **Allowed Layers:**
 * - `lib/src/context/ir-builder*.ts` — Input parsing
 * - `lib/src/context/template-context.ts` — Orchestration (builds IR)
 * - `lib/src/shared/load-openapi-document/**` — Input loading
 * - `lib/src/cli/**` — Entry point
 * - `lib/src/validation/**` — Input validation
 * - Test files (`*.test.ts`)
 *
 * @see ADR-024 for the architectural decision
 * @module architecture/layer-boundaries
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

/**
 * Pattern that detects OpenAPIObject imports from openapi3-ts.
 * Matches variations like:
 * - import { OpenAPIObject } from 'openapi3-ts/oas31'
 * - import type { OpenAPIObject } from 'openapi3-ts/oas31'
 * - import { OpenAPIObject, SchemaObject } from 'openapi3-ts/oas31'
 */
const OPENAPI_OBJECT_IMPORT_PATTERN =
  /import\s+(?:type\s+)?{[^}]*\bOpenAPIObject\b[^}]*}\s+from\s+['"]openapi3-ts/;

/**
 * Get all TypeScript files in a directory recursively.
 * Excludes test files and optionally specific subdirectory paths.
 */
function getTypeScriptFiles(
  dir: string,
  excludeTests = true,
  excludePaths: string[] = [],
): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip excluded paths
    if (excludePaths.some((excludePath) => fullPath.includes(excludePath))) {
      continue;
    }

    if (entry.isDirectory()) {
      files.push(...getTypeScriptFiles(fullPath, excludeTests, excludePaths));
    } else if (entry.isFile() && entry.name.endsWith('.ts')) {
      if (excludeTests && entry.name.includes('.test.')) {
        continue;
      }
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * Get MCP layer files (template-context.mcp*.ts excluding tests).
 */
function getMcpLayerFiles(contextDir: string): string[] {
  if (!fs.existsSync(contextDir)) {
    return [];
  }

  const entries = fs.readdirSync(contextDir);
  return entries
    .filter((name) => name.startsWith('template-context.mcp') && name.endsWith('.ts'))
    .filter((name) => !name.includes('.test.'))
    .map((name) => path.join(contextDir, name));
}

/**
 * Check a file for forbidden imports.
 * Returns the file path if a violation is found, null otherwise.
 */
function checkFileForViolations(filePath: string): string | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  if (OPENAPI_OBJECT_IMPORT_PATTERN.test(content)) {
    return filePath;
  }
  return null;
}

describe('Layer Boundary Enforcement', () => {
  const libSrcPath = path.resolve(__dirname, '..');

  describe('Writers Layer', () => {
    it('should not import OpenAPIObject in writer files', () => {
      const writersDir = path.join(libSrcPath, 'writers');
      // Exception: writers/openapi is allowed to import OpenAPI types
      // because it's for OUTPUT generation (IR → OpenAPI), not input consumption.
      // The rule protects against inputs; output generation legitimately needs the output types.
      const writerFiles = getTypeScriptFiles(writersDir, true, ['writers/openapi']);

      const violations = writerFiles
        .map(checkFileForViolations)
        .filter((v): v is string => v !== null);

      expect(violations).toEqual([]);
    });

    it('should have writer files to test', () => {
      const writersDir = path.join(libSrcPath, 'writers');
      const writerFiles = getTypeScriptFiles(writersDir, true, ['writers/openapi']);

      // Sanity check: we should have writers to test
      expect(writerFiles.length).toBeGreaterThan(0);
    });
  });

  describe('MCP Layer', () => {
    it('should not import OpenAPIObject in MCP files', () => {
      const contextDir = path.join(libSrcPath, 'context');
      const mcpFiles = getMcpLayerFiles(contextDir);

      const violations = mcpFiles
        .map(checkFileForViolations)
        .filter((v): v is string => v !== null);

      expect(violations).toEqual([]);
    });

    it('should have MCP files to test', () => {
      const contextDir = path.join(libSrcPath, 'context');
      const mcpFiles = getMcpLayerFiles(contextDir);

      // Sanity check: we should have MCP files to test
      expect(mcpFiles.length).toBeGreaterThan(0);
    });
  });

  describe('Boundary Compliance Summary', () => {
    it('should list all protected files checked', () => {
      const writersDir = path.join(libSrcPath, 'writers');
      const contextDir = path.join(libSrcPath, 'context');

      const writerFiles = getTypeScriptFiles(writersDir);
      const mcpFiles = getMcpLayerFiles(contextDir);

      const allProtectedFiles = [...writerFiles, ...mcpFiles];

      // This test documents which files are being checked
      expect(allProtectedFiles.length).toBeGreaterThan(0);

      // Log for visibility during test runs (useful for debugging)
      // console.log(`Checked ${allProtectedFiles.length} protected files for OpenAPIObject imports`);
    });
  });
});
