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
import { attemptNonStandardPropertyRescue } from './prefix-nonstandard.js';

import type { UnknownRecord } from '../types.js';

export interface DoctorDiagnosis {
  readonly originalIsValid: boolean;
  readonly repairedIsValid: boolean;
  readonly warnings: readonly string[];
  readonly originalErrors: readonly unknown[];
  readonly finalErrors: readonly unknown[];
  readonly document: unknown;
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

/**
 * Attempts aggressive reparations on an OpenAPI document to produce a valid OpenAPI 3.1.x spec.
 *
 * @param inputDocument The parsed (but potentially invalid) OpenAPI document object
 * @returns A diagnosis report containing the repaired document and its validation status.
 */
export async function repairOpenApiDocument(inputDocument: unknown): Promise<DoctorDiagnosis> {
  if (!isAnyObject(inputDocument)) {
    throw new Error('Input must be a parsed OpenAPI object');
  }

  const workingDocument = deepClone(inputDocument);
  if (!isAnyObject(workingDocument)) {
    throw new Error('Failed to clone object');
  }

  const rawWarnings: { readonly message: string }[] = [];

  const initialValidation = await validate(workingDocument);
  const originalIsValid = initialValidation.valid;
  const originalErrors = initialValidation.valid ? [] : (initialValidation.errors ?? []);

  if (originalIsValid) {
    return {
      originalIsValid: true,
      repairedIsValid: true,
      warnings: [],
      originalErrors: [],
      finalErrors: [],
      document: workingDocument,
    };
  }

  await attemptNonStandardPropertyRescue(workingDocument, initialValidation, rawWarnings);
  const warnings = rawWarnings.map((w) => w.message);

  const upgradedDocument = performUpgrade(workingDocument, warnings);

  const finalValidation = await validate(upgradedDocument);

  return {
    originalIsValid,
    repairedIsValid: finalValidation.valid,
    warnings,
    originalErrors,
    finalErrors: finalValidation.valid ? [] : (finalValidation.errors ?? []),
    document: upgradedDocument,
  };
}
