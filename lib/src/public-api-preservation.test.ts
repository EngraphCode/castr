/**
 * Public API Preservation Tests
 *
 * Proves that the full current public surface exported from lib/src/index.ts
 * is present and has the expected runtime shape. Type-only exports are
 * validated by the type-check gate and are not asserted here.
 */

import { describe, expect, test } from 'vitest';
import * as publicApi from './index.js';

describe('Public API Preservation', () => {
  test('all expected function exports are present', () => {
    const expectedFunctions = [
      // Rendering
      'generateZodClientFromOpenAPI',

      // Generation result type guards
      'isSingleFileResult',
      'isGroupedFileResult',

      // Shared utilities
      'getOpenApiDependencyGraph',
      'maybePretty',
      'loadOpenApiDocument',

      // Zod schema generation
      'getZodSchema',

      // Template context and IR
      'getZodClientTemplateContext',
      'extractSchemaNamesFromDoc',
      'buildIR',

      // OpenAPI writer
      'writeOpenApi',
      'generateOpenAPI',

      // MCP helpers
      'getMcpToolName',
      'getMcpToolHints',
      'buildInputSchemaObject',
      'buildOutputSchemaObject',
      'buildMcpToolsFromIR',

      // MCP type guards
      'isMcpTool',
      'isMcpToolInput',
      'isMcpToolOutput',

      // MCP error formatting
      'formatMcpValidationError',

      // Endpoint utilities
      'extractParameterMetadata',
      'extractSchemaConstraints',

      // IR serialisation and validation
      'serializeIR',
      'deserializeIR',
      'isCastrDocument',
      'isIRComponent',
      'isCastrOperation',
      'isCastrSchema',
      'isCastrSchemaNode',
    ];

    for (const name of expectedFunctions) {
      expect(publicApi, `missing export: ${name}`).toHaveProperty(name, expect.any(Function));
    }
  });

  test('CastrSchemaProperties brand is exported', () => {
    expect(publicApi).toHaveProperty('CastrSchemaProperties', expect.any(Function));
  });

  test('logger is exported with expected methods', () => {
    expect(publicApi).toHaveProperty('logger');
    expect(typeof publicApi.logger).toBe('object');

    expect(publicApi.logger).toHaveProperty('info');
    expect(typeof publicApi.logger.info).toBe('function');
    expect(publicApi.logger).toHaveProperty('warn');
    expect(typeof publicApi.logger.warn).toBe('function');
    expect(publicApi.logger).toHaveProperty('error');
    expect(typeof publicApi.logger.error).toBe('function');
  });
});
