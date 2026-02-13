import { describe, it, expect } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../src/index.js';
import { prepareOpenApiDocument } from '../src/shared/prepare-openapi-document.js';
import { serializeIR, deserializeIR } from '../src/schema-processing/ir/serialization.js';
import { writeOpenApi } from '../src/schema-processing/writers/openapi/index.js';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

describe('IR Fidelity', () => {
  const petstorePath = path.resolve(__dirname, '../examples/openapi/v3.1/tictactoe.yaml');

  it('should maintain fidelity through IR round-trip', async () => {
    // 1. Generate Standard Output (Code A)
    const resultA = await generateZodClientFromOpenAPI({
      input: petstorePath,
      disableWriteToFile: true,
    });
    const codeA = Array.isArray(resultA) ? resultA[0].content : resultA;

    // 2. Build IR from Spec
    const doc = await prepareOpenApiDocument(petstorePath);
    const context = getZodClientTemplateContext(doc);
    const irOriginal = context._ir;

    if (!irOriginal) {
      throw new Error('IR not generated in context');
    }

    // 3. Serialize -> Deserialize
    const serialized = serializeIR(irOriginal);
    const irDeserialized = deserializeIR(serialized);

    // 4. Convert back to OpenAPI using canonical writer
    const docReconstructed = writeOpenApi(irDeserialized);

    // 5. Generate Output from Reconstructed Doc (Code B)
    const resultB = await generateZodClientFromOpenAPI({
      openApiDoc: docReconstructed,
      disableWriteToFile: true,
    });
    const codeB = Array.isArray(resultB) ? resultB[0].content : resultB;

    // 6. Assert Fidelity (Code B should match Code A)
    expect(codeB).toEqual(codeA);

    // 7. Verify IR Enhancements
    // Check Enums
    expect(irDeserialized.enums).toBeDefined();
    expect(irDeserialized.enums.size).toBeGreaterThan(0);

    // 'mark' enum should exist (from components/schemas/mark)
    const markEnum = Array.from(irDeserialized.enums.values()).find((e) => e.name === 'mark');
    expect(markEnum).toBeDefined();
    expect(markEnum?.values).toEqual(['.', 'X', 'O']);

    // Check Parameters By Location
    const getSquareOp = irDeserialized.operations.find((op) => op.operationId === 'get-square');
    expect(getSquareOp).toBeDefined();
    if (getSquareOp) {
      expect(getSquareOp.parametersByLocation).toBeDefined();
      expect(getSquareOp.parametersByLocation.path).toHaveLength(2); // row, column
      expect(getSquareOp.parametersByLocation.query).toHaveLength(0);
    }
  });
});
