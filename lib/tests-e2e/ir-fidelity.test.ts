import { describe, it, expect } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../src/index.js';
import { prepareOpenApiDocument } from '../src/shared/prepare-openapi-document.js';
import { serializeIR, deserializeIR } from '../src/schema-processing/ir/serialization.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('IR Fidelity', () => {
  const petstorePath = path.resolve(__dirname, '../examples/openapi/v3.1/tictactoe.yaml');

  it('should maintain IR structural equality through serialize→deserialize round-trip', async () => {
    // 1. Build IR from Spec
    const doc = await prepareOpenApiDocument(petstorePath);
    const context = getZodClientTemplateContext(doc);
    const irOriginal = context._ir;

    if (!irOriginal) {
      throw new Error('IR not generated in context');
    }

    // 2. Serialize -> Deserialize (the actual fidelity property)
    const serialized = serializeIR(irOriginal);
    const irDeserialized = deserializeIR(serialized);

    // 3. Assert IR structural equality
    // Component count must be preserved
    expect(irDeserialized.components).toHaveLength(irOriginal.components.length);

    // Each schema component must round-trip with matching name and content
    const originalSchemas = irOriginal.components.filter((c) => c.type === 'schema');
    const deserializedSchemas = irDeserialized.components.filter((c) => c.type === 'schema');
    expect(deserializedSchemas).toHaveLength(originalSchemas.length);
    for (const originalSchema of originalSchemas) {
      const match = deserializedSchemas.find((s) => s.name === originalSchema.name);
      expect(match).toBeDefined();
      expect(JSON.stringify(match?.schema)).toBe(JSON.stringify(originalSchema.schema));
    }

    // Operation count must be preserved
    expect(irDeserialized.operations).toHaveLength(irOriginal.operations.length);

    // Each operation must round-trip with matching operationId, path, and method
    for (const originalOp of irOriginal.operations) {
      const deserializedOp = irDeserialized.operations.find(
        (op) => op.operationId === originalOp.operationId,
      );
      expect(deserializedOp).toBeDefined();
      expect(deserializedOp?.path).toBe(originalOp.path);
      expect(deserializedOp?.method).toBe(originalOp.method);
      expect(deserializedOp?.parameters).toHaveLength(originalOp.parameters.length);
    }

    // Enum content must be preserved
    expect(irDeserialized.enums.size).toBe(irOriginal.enums.size);
    for (const [name, enumDef] of irOriginal.enums) {
      expect(irDeserialized.enums.has(name)).toBe(true);
      expect(irDeserialized.enums.get(name)?.values).toEqual(enumDef.values);
    }

    // Schema names must be preserved
    expect(irDeserialized.schemaNames).toEqual(irOriginal.schemaNames);

    // 4. Verify specific IR content (tictactoe-specific)
    const markEnum = Array.from(irDeserialized.enums.values()).find((e) => e.name === 'mark');
    expect(markEnum).toBeDefined();
    expect(markEnum?.values).toEqual(['.', 'X', 'O']);

    const getSquareOp = irDeserialized.operations.find((op) => op.operationId === 'get-square');
    expect(getSquareOp).toBeDefined();
    expect(getSquareOp?.path).toBe('/board/{row}/{column}');
    expect(getSquareOp?.method).toBe('get');
  });

  it('should produce deterministic code from the same OpenAPI document', async () => {
    // Generate twice from the same input and assert byte-identical output
    const resultA = await generateZodClientFromOpenAPI({
      input: petstorePath,
      disableWriteToFile: true,
    });
    const resultB = await generateZodClientFromOpenAPI({
      input: petstorePath,
      disableWriteToFile: true,
    });
    const codeA = Array.isArray(resultA) ? resultA[0].content : resultA;
    const codeB = Array.isArray(resultB) ? resultB[0].content : resultB;
    expect(codeB).toEqual(codeA);
  });
});
