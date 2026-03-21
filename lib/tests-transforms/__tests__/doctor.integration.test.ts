import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { repairOpenApiDocumentWithRuntimeDiagnostics } from '../../src/shared/doctor/index.js';

const PROBLEMATIC_FIXTURE = resolve(
  __dirname,
  '../../tests-fixtures/openapi-samples/problematic/real-world-api.json',
);
const RAW_DOCUMENT = JSON.parse(readFileSync(PROBLEMATIC_FIXTURE, 'utf-8'));

describe('Doctor Reparation Pipeline', () => {
  it('identifies and attempts to repair aggressively non-compliant OpenAPI documents', async () => {
    const { diagnosis, diagnostics } =
      await repairOpenApiDocumentWithRuntimeDiagnostics(RAW_DOCUMENT);

    expect(diagnosis.originalIsValid).toBe(false);

    // Assert that the doctor emitted warnings regarding prefixing or sanitizing
    expect(diagnosis.warnings.length).toBeGreaterThan(0);

    // If the document is fundamentally unrepairable (e.g., structural definitions are entirely missing)
    // we still expect the doctor to successfully execute and provide a final diagnosis,
    // rather than throwing an unhandled exception.
    expect(diagnosis.finalErrors).toBeDefined();
    expect(diagnostics.originalErrorCount).toBeGreaterThan(0);
    expect(diagnostics.warningCount).toBe(diagnosis.warnings.length);
    expect(diagnostics.rescueRetryCount).toBeGreaterThan(0);
    expect(diagnostics.timingsMs.total).toBeGreaterThanOrEqual(
      diagnostics.timingsMs.nonStandardRescue,
    );
  }, 10000); // Post rescue-loop redesign: proof runs in ~0.5s; 10s provides ample headroom.
});
