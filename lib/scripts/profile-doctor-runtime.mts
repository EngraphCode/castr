import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { repairOpenApiDocumentWithRuntimeDiagnostics } from '../src/shared/doctor/index.js';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const fixtureRelativePath = '../tests-fixtures/openapi-samples/problematic/real-world-api.json';
const fixturePath = resolve(scriptDir, fixtureRelativePath);

const rawDocument: unknown = JSON.parse(readFileSync(fixturePath, 'utf-8'));
const profiled = await repairOpenApiDocumentWithRuntimeDiagnostics(rawDocument);

const output = {
  fixture: 'tests-fixtures/openapi-samples/problematic/real-world-api.json',
  fixtureBytes: statSync(fixturePath).size,
  diagnosis: {
    originalIsValid: profiled.diagnosis.originalIsValid,
    repairedIsValid: profiled.diagnosis.repairedIsValid,
    warningCount: profiled.diagnosis.warnings.length,
    originalErrorCount: profiled.diagnosis.originalErrors.length,
    finalErrorCount: profiled.diagnosis.finalErrors.length,
  },
  diagnostics: profiled.diagnostics,
};

process.stdout.write(`${JSON.stringify(output, null, 2)}\n`);
