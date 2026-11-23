/**
 * Shared strict object-semantics helpers.
 *
 * Castr reads a closed object (`additionalProperties: false`). The OpenAPI reader also
 * reads a constrained map, the first row of the specification's Appendix B.2; the JSON
 * Schema and Zod readers do not yet. Every other object input is refused with the
 * messages built here.
 *
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
