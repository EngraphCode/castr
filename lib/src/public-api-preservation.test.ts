/**
 * Public API Preservation Tests
 *
 * These tests ensure that the directory reorganisation does not change
 * the public API surface. All exports from lib/src/index.ts must remain
 * identical after migration.
 *
 * @see .agent/plans/LIB-SRC-REORGANISATION.md
 */

import { describe, expect, test } from 'vitest';
import * as publicApi from './index.js';

describe('Public API Preservation', () => {
  test('all expected exports are present', () => {
    // Note: Type-only exports (CodeMeta, CodeMetaData, etc.) are not runtime-accessible
    // They are validated by TypeScript compilation and will be checked via type-check gate

    // Functions
    expect(publicApi).toHaveProperty('generateZodClientFromOpenAPI');
    expect(typeof publicApi.generateZodClientFromOpenAPI).toBe('function');

    expect(publicApi).toHaveProperty('getOpenApiDependencyGraph');
    expect(typeof publicApi.getOpenApiDependencyGraph).toBe('function');
    // validateOpenApiSpec removed in Phase 1 Part 5 (replaced by prepareOpenApiDocument internally)
    expect(publicApi).toHaveProperty('getEndpointDefinitionList');
    expect(typeof publicApi.getEndpointDefinitionList).toBe('function');
    expect(publicApi).toHaveProperty('maybePretty');
    expect(typeof publicApi.maybePretty).toBe('function');
    expect(publicApi).toHaveProperty('getZodSchema');
    expect(typeof publicApi.getZodSchema).toBe('function');
    expect(publicApi).toHaveProperty('getZodClientTemplateContext');
    expect(typeof publicApi.getZodClientTemplateContext).toBe('function');

    // ValidationError removed in Phase 1 Part 5 (replaced by prepareOpenApiDocument internally)

    // Note: Type-only exports (EndpointDefinition, TemplateContext, etc.) are validated
    // by TypeScript compilation. Type-check gate ensures they remain exported.

    // Objects
    expect(publicApi).toHaveProperty('logger');
    expect(typeof publicApi.logger).toBe('object');
  });

  // ValidationError test removed - class no longer exported (removed in Phase 1 Part 5)

  test('logger has expected methods', () => {
    expect(publicApi.logger).toHaveProperty('info');
    expect(typeof publicApi.logger.info).toBe('function');
    expect(publicApi.logger).toHaveProperty('warn');
    expect(typeof publicApi.logger.warn).toBe('function');
    expect(publicApi.logger).toHaveProperty('error');
    expect(typeof publicApi.logger.error).toBe('function');
  });
});
