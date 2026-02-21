import { describe, it, expect } from 'vitest';
import { join } from 'path';
import { buildIR } from '../schema-processing/parsers/openapi/index.js';
import { writeOpenApi, validateOpenAPI } from '../schema-processing/writers/openapi/index.js';
import { loadOpenApiDocument } from '../shared/load-openapi-document/orchestrator.js';

describe('OpenAPI Fidelity', () => {
  it('should preserve semantics for TicTacToe spec', async () => {
    const specPath = join(__dirname, '../../examples/openapi/v3.1/tictactoe.yaml');
    const loaded = await loadOpenApiDocument(specPath);
    const originalDoc = loaded.document;

    const ir = buildIR(originalDoc);
    const generatedDoc = writeOpenApi(ir);

    await validateOpenAPI(generatedDoc);

    // Basic structural checks
    expect(generatedDoc.openapi).toBe(originalDoc.openapi);
    expect(generatedDoc.info).toEqual(originalDoc.info);

    // Compare paths keys
    const originalPaths = Object.keys(originalDoc.paths || {}).sort();
    const generatedPaths = Object.keys(generatedDoc.paths || {}).sort();
    expect(generatedPaths).toEqual(originalPaths);

    // Verify components exist
    expect(generatedDoc.components).toBeDefined();
    if (originalDoc.components?.schemas) {
      const originalSchemas = Object.keys(originalDoc.components.schemas).sort();
      const generatedSchemas = Object.keys(generatedDoc.components?.schemas || {}).sort();
      expect(generatedSchemas).toEqual(originalSchemas);
    }
  });
});
