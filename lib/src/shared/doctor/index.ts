/**
 * Castr OpenAPI Doctor
 *
 * An opt-in repair pipeline strictly separated from the main Strict Pipeline.
 * Designed to take fundamentally problematic OpenAPI specifications and agressively
 * sanitize, patch, and upgrade them to a format the main pipeline can digest.
 *
 * @module
 */

import { validate, upgrade } from '@scalar/openapi-parser';
import {
  attemptNonStandardPropertyRescue,
  type NonStandardPropertyRescueDiagnostics,
} from './prefix-nonstandard.js';
import {
  buildDoctorRuntimeDiagnostics,
  measureAsync,
  measureSync,
  type DoctorRuntimeDiagnostics,
} from './runtime-diagnostics.js';

import type { UnknownRecord } from '../type-utils/types.js';

export interface DoctorDiagnosis {
  readonly originalIsValid: boolean;
  readonly repairedIsValid: boolean;
  readonly warnings: readonly string[];
  readonly originalErrors: readonly unknown[];
  readonly finalErrors: readonly unknown[];
  readonly document: unknown;
}

export interface DoctorRuntimeProfile {
  readonly diagnosis: DoctorDiagnosis;
  readonly diagnostics: DoctorRuntimeDiagnostics;
}

export type { DoctorRuntimeDiagnostics } from './runtime-diagnostics.js';

interface DoctorCloneResult {
  readonly workingDocument: UnknownRecord;
  readonly cloneMs: number;
}

interface DoctorInitialValidationResult {
  readonly initialValidation: Awaited<ReturnType<typeof validate>>;
  readonly initialValidateMs: number;
  readonly originalErrors: readonly unknown[];
}

interface DoctorRepairPhasesResult {
  readonly warnings: readonly string[];
  readonly upgradedDocument: UnknownRecord;
  readonly nonStandardRescueMs: number;
  readonly rescueRetryCount: number;
  readonly finalValidation: Awaited<ReturnType<typeof validate>>;
  readonly finalValidateMs: number;
  readonly upgradeMs: number;
}

function isAnyObject(val: unknown): val is UnknownRecord {
  return typeof val === 'object' && val !== null && !Array.isArray(val);
}

function deepClone(value: unknown): unknown {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map(deepClone);
  }
  const result: UnknownRecord = {};
  for (const [key, val] of Object.entries(value)) {
    result[key] = deepClone(val);
  }
  return result;
}

function performUpgrade(document: UnknownRecord, warnings: string[]): UnknownRecord {
  try {
    const res: unknown = upgrade(document);
    if (isAnyObject(res)) {
      const spec = Reflect.get(res, 'specification');
      if (isAnyObject(spec)) {
        return spec;
      }
    }
  } catch (err) {
    warnings.push(`Upgrade failed: ${err instanceof Error ? err.message : String(err)}`);
  }
  return document;
}

function createDoctorDiagnosis(
  originalIsValid: boolean,
  repairedIsValid: boolean,
  warnings: readonly string[],
  originalErrors: readonly unknown[],
  finalErrors: readonly unknown[],
  document: unknown,
): DoctorDiagnosis {
  return {
    originalIsValid,
    repairedIsValid,
    warnings,
    originalErrors,
    finalErrors,
    document,
  };
}

function cloneDoctorInput(inputDocument: unknown): DoctorCloneResult {
  const cloneResult = measureSync(() => deepClone(inputDocument));
  const workingDocument = cloneResult.result;
  if (!isAnyObject(workingDocument)) {
    throw new Error('Failed to clone object');
  }

  return {
    workingDocument,
    cloneMs: cloneResult.elapsedMs,
  };
}

async function measureInitialValidation(
  workingDocument: UnknownRecord,
): Promise<DoctorInitialValidationResult> {
  const initialValidationResult = await measureAsync(() => validate(workingDocument));
  const initialValidation = initialValidationResult.result;

  return {
    initialValidation,
    initialValidateMs: initialValidationResult.elapsedMs,
    originalErrors: initialValidation.valid ? [] : (initialValidation.errors ?? []),
  };
}

function createFastPathProfile(
  workingDocument: UnknownRecord,
  cloneMs: number,
  initialValidateMs: number,
): DoctorRuntimeProfile {
  const diagnosis = createDoctorDiagnosis(true, true, [], [], [], workingDocument);
  const diagnostics = buildDoctorRuntimeDiagnostics({
    cloneMs,
    initialValidateMs,
    nonStandardRescueMs: 0,
    upgradeMs: 0,
    finalValidateMs: 0,
    rescueRetryCount: 0,
    warningCount: 0,
    originalErrorCount: 0,
    finalErrorCount: 0,
    originalIsValid: true,
    repairedIsValid: true,
  });

  return { diagnosis, diagnostics };
}

async function runRepairPhases(
  workingDocument: UnknownRecord,
  initialValidation: Awaited<ReturnType<typeof validate>>,
): Promise<DoctorRepairPhasesResult> {
  const rawWarnings: { readonly message: string }[] = [];
  const rescueDiagnostics: NonStandardPropertyRescueDiagnostics = { retryCount: 0 };
  const rescueResult = await measureAsync(() =>
    attemptNonStandardPropertyRescue(
      workingDocument,
      initialValidation,
      rawWarnings,
      rescueDiagnostics,
    ),
  );
  const warnings = rawWarnings.map((warning) => warning.message);
  const upgradedDocumentResult = measureSync(() => performUpgrade(workingDocument, warnings));
  const finalValidationResult = await measureAsync(() => validate(upgradedDocumentResult.result));

  return {
    warnings,
    upgradedDocument: upgradedDocumentResult.result,
    nonStandardRescueMs: rescueResult.elapsedMs,
    rescueRetryCount: rescueDiagnostics.retryCount,
    finalValidation: finalValidationResult.result,
    finalValidateMs: finalValidationResult.elapsedMs,
    upgradeMs: upgradedDocumentResult.elapsedMs,
  };
}

function createProfileFromRepair(
  originalErrors: readonly unknown[],
  cloneMs: number,
  initialValidateMs: number,
  repairPhases: DoctorRepairPhasesResult,
): DoctorRuntimeProfile {
  const diagnosis = createDoctorDiagnosis(
    false,
    repairPhases.finalValidation.valid,
    repairPhases.warnings,
    originalErrors,
    repairPhases.finalValidation.valid ? [] : (repairPhases.finalValidation.errors ?? []),
    repairPhases.upgradedDocument,
  );
  const diagnostics = buildDoctorRuntimeDiagnostics({
    cloneMs,
    initialValidateMs,
    nonStandardRescueMs: repairPhases.nonStandardRescueMs,
    upgradeMs: repairPhases.upgradeMs,
    finalValidateMs: repairPhases.finalValidateMs,
    rescueRetryCount: repairPhases.rescueRetryCount,
    warningCount: diagnosis.warnings.length,
    originalErrorCount: diagnosis.originalErrors.length,
    finalErrorCount: diagnosis.finalErrors.length,
    originalIsValid: diagnosis.originalIsValid,
    repairedIsValid: diagnosis.repairedIsValid,
  });

  return { diagnosis, diagnostics };
}

/**
 * Attempts aggressive reparations on an OpenAPI document to produce a valid OpenAPI 3.1.x spec.
 *
 * @param inputDocument The parsed (but potentially invalid) OpenAPI document object
 * @returns A diagnosis report containing the repaired document and its validation status.
 */
export async function repairOpenApiDocumentWithRuntimeDiagnostics(
  inputDocument: unknown,
): Promise<DoctorRuntimeProfile> {
  if (!isAnyObject(inputDocument)) {
    throw new Error('Input must be a parsed OpenAPI object');
  }

  const { workingDocument, cloneMs } = cloneDoctorInput(inputDocument);
  const { initialValidation, initialValidateMs, originalErrors } =
    await measureInitialValidation(workingDocument);

  if (initialValidation.valid) {
    return createFastPathProfile(workingDocument, cloneMs, initialValidateMs);
  }

  const repairPhases = await runRepairPhases(workingDocument, initialValidation);
  return createProfileFromRepair(originalErrors, cloneMs, initialValidateMs, repairPhases);
}

export async function repairOpenApiDocument(inputDocument: unknown): Promise<DoctorDiagnosis> {
  const { diagnosis } = await repairOpenApiDocumentWithRuntimeDiagnostics(inputDocument);
  return diagnosis;
}
