/**
 * IR Builder - Zod Chain Generation
 *
 * Converts IR schema constraints into Zod validation chain strings.
 * Populates schema.metadata.zodChain.validations.
 *
 * @module ir-builder.zod-chain
 * @internal
 */

import type { CastrSchema } from './ir-schema.js';

/**
 * Update Zod chain validations based on schema constraints.
 *
 * @param irSchema - The IR schema to update
 * @internal
 */
export function updateZodChain(irSchema: CastrSchema): void {
  const validations: string[] = [];

  // Numeric constraints
  if (irSchema.type === 'number' || irSchema.type === 'integer') {
    addNumericValidations(irSchema, validations);
  }

  // String constraints
  if (irSchema.type === 'string') {
    addStringValidations(irSchema, validations);
  }

  // Array constraints
  if (irSchema.type === 'array') {
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
  if (schema.type === 'integer') {
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
  if (schema.exclusiveMinimum === true && schema.minimum !== undefined) {
    // Remove the last .min() and replace with .gt()
    const lastValidation = validations[validations.length - 1];
    if (lastValidation === `.min(${schema.minimum})`) {
      validations.pop();
    }
    validations.push(`.gt(${schema.minimum})`);
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
  if (schema.exclusiveMaximum === true && schema.maximum !== undefined) {
    // Remove the last .max() and replace with .lt()
    const lastValidation = validations[validations.length - 1];
    if (lastValidation === `.max(${schema.maximum})`) {
      validations.pop();
    }
    validations.push(`.lt(${schema.maximum})`);
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
    const escapedPattern = schema.pattern.split('/').join('\\/');
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
    hostname: '.url()',
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
