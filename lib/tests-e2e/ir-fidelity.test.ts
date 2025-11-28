import { describe, it, expect } from 'vitest';
import { generateZodClientFromOpenAPI, getZodClientTemplateContext } from '../src/index.js';
import { prepareOpenApiDocument } from '../src/shared/prepare-openapi-document.js';
import { serializeIR, deserializeIR } from '../src/context/ir-serialization.js';
import { convertIRToOpenAPI } from '../src/context/converter/index.js';
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

    // 4. Convert back to OpenAPI
    const docReconstructed = convertIRToOpenAPI(irDeserialized);

    // 5. Generate Output from Reconstructed Doc (Code B)
    const resultB = await generateZodClientFromOpenAPI({
      openApiDoc: docReconstructed,
      disableWriteToFile: true,
    });
    const codeB = Array.isArray(resultB) ? resultB[0].content : resultB;

    // 6. Assert Fidelity (Code B should match Code A)
    expect(codeB).toEqual(codeA);
  });
});
