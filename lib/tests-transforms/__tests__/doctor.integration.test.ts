import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { repairOpenApiDocument } from '../../src/shared/doctor/index.js';

const PROBLEMATIC_FIXTURE = resolve(
  __dirname,
  '../../tests-fixtures/openapi-samples/problematic/real-world-api.json',
);

describe('Doctor Reparation Pipeline', () => {
  it('identifies and attempts to repair aggressively non-compliant OpenAPI documents', async () => {
    const rawDocument = JSON.parse(readFileSync(PROBLEMATIC_FIXTURE, 'utf-8'));

    const diagnosis = await repairOpenApiDocument(rawDocument);

    expect(diagnosis.originalIsValid).toBe(false);

    // Assert that the doctor emitted warnings regarding prefixing or sanitizing
    expect(diagnosis.warnings.length).toBeGreaterThan(0);

    // If the document is fundamentally unrepairable (e.g., structural definitions are entirely missing)
    // we still expect the doctor to successfully execute and provide a final diagnosis,
    // rather than throwing an unhandled exception.
    expect(diagnosis.finalErrors).toBeDefined();

    console.log(
      `[Doctor Diagnosis] Original Valid: ${diagnosis.originalIsValid}, Repaired Valid: ${diagnosis.repairedIsValid}`,
    );
    console.log(`[Doctor Diagnosis] Warnings generated: ${diagnosis.warnings.length}`);
    if (!diagnosis.repairedIsValid) {
      console.log(`[Doctor Diagnosis] Remaining Errors: ${diagnosis.finalErrors.length}`);
      console.log(`[Doctor Diagnosis] First Error:`, diagnosis.finalErrors[0]);
    }
  }, 30000); // 30s timeout since problematic specs can be massive
});
