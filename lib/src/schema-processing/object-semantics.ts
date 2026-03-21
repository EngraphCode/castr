/**
 * Shared strict object-semantics helpers.
 *
 * Under IDENTITY doctrine, Castr supports one object model only:
 * closed-world objects with explicit properties.
 *
 * @module schema-processing/object-semantics
 * @internal
 */

export interface PortableObjectKeywordInput {
  additionalProperties?: boolean | object | undefined;
}

export function buildClosedWorldObjectSemanticsHint(): string {
  return 'Castr requires closed-world object semantics (additionalProperties: false).';
}

export function buildNonStrictObjectRejectionMessage(inputDescription: string): string {
  return `Non-strict object input "${inputDescription}" is rejected. ${buildClosedWorldObjectSemanticsHint()}`;
}

export function describePortableNonStrictObjectInput(
  input: PortableObjectKeywordInput,
): string | undefined {
  if (input.additionalProperties === undefined) {
    return 'object schema without explicit additionalProperties: false';
  }
  if (input.additionalProperties === true) {
    return 'additionalProperties: true';
  }
  if (typeof input.additionalProperties === 'boolean') {
    return undefined;
  }
  return 'schema-valued additionalProperties';
}
