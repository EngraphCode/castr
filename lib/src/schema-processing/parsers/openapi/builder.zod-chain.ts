/**
 * IR Builder - Zod Chain Generation
 *
 * Converts IR schema constraints into Zod validation chain strings.
 * Populates schema.metadata.zodChain.validations.
 *
 * @module ir-builder.zod-chain
 * @internal
 */

import type { CastrSchema } from '../../ir/schema.js';
import { join, split } from 'lodash-es';

const SCHEMA_TYPE_NUMBER = 'number' as const;
const SCHEMA_TYPE_INTEGER = 'integer' as const;
const SCHEMA_TYPE_STRING = 'string' as const;
const SCHEMA_TYPE_ARRAY = 'array' as const;

/**
 * Update Zod chain validations based on schema constraints.
 *
 * @param irSchema - The IR schema to update
 * @internal
 */
export function updateZodChain(irSchema: CastrSchema): void {
  const validations: string[] = [];

  // Numeric constraints
  if (irSchema.type === SCHEMA_TYPE_NUMBER || irSchema.type === SCHEMA_TYPE_INTEGER) {
    addNumericValidations(irSchema, validations);
  }

  // String constraints
  if (irSchema.type === SCHEMA_TYPE_STRING) {
    addStringValidations(irSchema, validations);
  }

  // Array constraints
  if (irSchema.type === SCHEMA_TYPE_ARRAY) {
    addArrayValidations(irSchema, validations);
  }

  // Update metadata
  if (irSchema.metadata && irSchema.metadata.zodChain) {
    irSchema.metadata.zodChain.validations.push(...validations);
  }
}

export function addNumericValidations(schema: CastrSchema, validations: string[]): void {
  addMinMaxValidations(schema, validations);
  addExclusiveValidations(schema, validations);

  if (schema.multipleOf !== undefined) {
    validations.push(`.multipleOf(${schema.multipleOf})`);
  }

  // Integer type check (if type is integer)
  if (schema.type === SCHEMA_TYPE_INTEGER) {
    validations.push('.int()');
  }
}

function addMinMaxValidations(schema: CastrSchema, validations: string[]): void {
  if (schema.minimum !== undefined) {
    validations.push(`.min(${schema.minimum})`);
  }
  if (schema.maximum !== undefined) {
    validations.push(`.max(${schema.maximum})`);
  }
}

function addExclusiveValidations(schema: CastrSchema, validations: string[]): void {
  addExclusiveMinimum(schema, validations);
  addExclusiveMaximum(schema, validations);
}

function addExclusiveMinimum(schema: CastrSchema, validations: string[]): void {
  if (schema.exclusiveMinimum === undefined) {
    return;
  }

  if (typeof schema.exclusiveMinimum === 'boolean') {
    handleBooleanExclusiveMinimum(schema, validations);
  } else {
    validations.push(`.gt(${schema.exclusiveMinimum})`);
  }
}

function handleBooleanExclusiveMinimum(schema: CastrSchema, validations: string[]): void {
  // If we already added .min() but exclusive is true, we need to swap it to .gt()
  if (schema.exclusiveMinimum === true && schema.minimum !== undefined) {
    const minIndex = validations.findIndex((v) => v === `.min(${schema.minimum})`);
    if (minIndex !== -1) {
      validations[minIndex] = `.gt(${schema.minimum})`;
    } else {
      validations.push(`.gt(${schema.minimum})`);
    }
  }
}

function addExclusiveMaximum(schema: CastrSchema, validations: string[]): void {
  if (schema.exclusiveMaximum === undefined) {
    return;
  }

  if (typeof schema.exclusiveMaximum === 'boolean') {
    handleBooleanExclusiveMaximum(schema, validations);
  } else {
    validations.push(`.lt(${schema.exclusiveMaximum})`);
  }
}

function handleBooleanExclusiveMaximum(schema: CastrSchema, validations: string[]): void {
  // If we already added .max() but exclusive is true, we need to swap it to .lt()
  if (schema.exclusiveMaximum === true && schema.maximum !== undefined) {
    const maxIndex = validations.findIndex((v) => v === `.max(${schema.maximum})`);
    if (maxIndex !== -1) {
      validations[maxIndex] = `.lt(${schema.maximum})`;
    } else {
      validations.push(`.lt(${schema.maximum})`);
    }
  }
}

export function addStringValidations(schema: CastrSchema, validations: string[]): void {
  if (schema.minLength !== undefined) {
    validations.push(`.min(${schema.minLength})`);
  }
  if (schema.maxLength !== undefined) {
    validations.push(`.max(${schema.maxLength})`);
  }
  if (schema.pattern) {
    // Escape forward slashes for regex literal format
    const escapedPattern = join(split(schema.pattern, '/'), '\\/');
    validations.push(`.regex(/${escapedPattern}/)`);
  }
  if (schema.format) {
    addFormatValidations(schema.format, validations);
  }
}

function addFormatValidations(format: string, validations: string[]): void {
  const formatMap: Record<string, string> = {
    email: '.email()',
    uuid: '.uuid()',
    uri: '.url()',
    url: '.url()',
    'date-time': '.datetime()',
    ipv4: '.ip({ version: "v4" })',
    ipv6: '.ip({ version: "v6" })',
  };

  if (formatMap[format]) {
    validations.push(formatMap[format]);
  }
}

function addArrayValidations(schema: CastrSchema, validations: string[]): void {
  if (schema.minItems !== undefined) {
    validations.push(`.min(${schema.minItems})`);
  }
  if (schema.maxItems !== undefined) {
    validations.push(`.max(${schema.maxItems})`);
  }
  // uniqueItems is not directly supported by Zod chain without refinement, skipping for now
  // or could use .refine(items => new Set(items).size === items.length)
}
