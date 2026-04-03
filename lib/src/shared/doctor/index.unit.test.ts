import { describe, expect, it } from 'vitest';
import { repairOpenApiDocument, repairOpenApiDocumentWithRuntimeDiagnostics } from './index.js';

describe('repairOpenApiDocumentWithRuntimeDiagnostics', () => {
  it('reports a zero-rescue fast path for already valid documents', async () => {
    const document = {
      openapi: '3.1.0',
      info: { title: 'Valid API', version: '1.0.0' },
      paths: {},
    };

    const diagnosis = await repairOpenApiDocument(document);
    const profiled = await repairOpenApiDocumentWithRuntimeDiagnostics(document);

    expect(profiled.diagnosis).toEqual(diagnosis);
    expect(profiled.diagnostics.originalIsValid).toBe(true);
    expect(profiled.diagnostics.repairedIsValid).toBe(true);
    expect(profiled.diagnostics.originalErrorCount).toBe(0);
    expect(profiled.diagnostics.finalErrorCount).toBe(0);
    expect(profiled.diagnostics.warningCount).toBe(0);
    expect(profiled.diagnostics.rescueRetryCount).toBe(0);
    expect(profiled.diagnostics.timingsMs.nonStandardRescue).toBe(0);
    expect(profiled.diagnostics.timingsMs.upgrade).toBe(0);
    expect(profiled.diagnostics.timingsMs.finalValidate).toBe(0);
  });

  it('reports a zero-rescue fast path for valid native OpenAPI 3.2 documents', async () => {
    const document = {
      openapi: '3.2.0',
      info: { title: 'Valid API', version: '1.0.0' },
      paths: {},
    };

    const diagnosis = await repairOpenApiDocument(document);
    const profiled = await repairOpenApiDocumentWithRuntimeDiagnostics(document);

    expect(profiled.diagnosis).toEqual(diagnosis);
    expect(profiled.diagnostics.originalIsValid).toBe(true);
    expect(profiled.diagnostics.repairedIsValid).toBe(true);
    expect(profiled.diagnostics.originalErrorCount).toBe(0);
    expect(profiled.diagnostics.finalErrorCount).toBe(0);
    expect(profiled.diagnostics.warningCount).toBe(0);
    expect(profiled.diagnostics.rescueRetryCount).toBe(0);
  });

  it('does not blow up on legacy OpenAPI 3.0 documents when repo-local preflight is unavailable', async () => {
    const document = {
      openapi: '3.0.0',
      info: { title: 'Legacy API', version: '1.0.0' },
      paths: {},
      extraDocs: 'Prefix me',
    };

    await expect(repairOpenApiDocumentWithRuntimeDiagnostics(document)).resolves.toEqual(
      expect.objectContaining({
        diagnosis: expect.objectContaining({
          originalIsValid: expect.any(Boolean),
          repairedIsValid: expect.any(Boolean),
        }),
        diagnostics: expect.objectContaining({
          originalIsValid: expect.any(Boolean),
          repairedIsValid: expect.any(Boolean),
        }),
      }),
    );
  });

  it('reports rescue diagnostics for non-standard property repair', async () => {
    const document = {
      openapi: '3.1.0',
      info: { title: 'Needs Repair', version: '1.0.0' },
      paths: {},
      extraDocs: 'Prefix me',
    };

    const diagnosis = await repairOpenApiDocument(document);
    const profiled = await repairOpenApiDocumentWithRuntimeDiagnostics(document);

    expect(profiled.diagnosis).toEqual(diagnosis);
    expect(profiled.diagnostics.originalIsValid).toBe(false);
    expect(profiled.diagnostics.originalErrorCount).toBeGreaterThan(0);
    expect(profiled.diagnostics.warningCount).toBeGreaterThan(0);
    expect(profiled.diagnostics.rescueRetryCount).toBeGreaterThan(0);
    expect(profiled.diagnostics.timingsMs.clone).toBeGreaterThanOrEqual(0);
    expect(profiled.diagnostics.timingsMs.initialValidate).toBeGreaterThanOrEqual(0);
    expect(profiled.diagnostics.timingsMs.nonStandardRescue).toBeGreaterThanOrEqual(0);
    expect(profiled.diagnostics.timingsMs.upgrade).toBeGreaterThanOrEqual(0);
    expect(profiled.diagnostics.timingsMs.finalValidate).toBeGreaterThanOrEqual(0);
    expect(profiled.diagnostics.timingsMs.total).toBeGreaterThanOrEqual(
      profiled.diagnostics.timingsMs.initialValidate,
    );
  });
});
