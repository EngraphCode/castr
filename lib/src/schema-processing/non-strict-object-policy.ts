import type { CastrSchema, PortableUnknownKeyBehaviorMode } from './ir/index.js';
import {
  UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY,
  UNKNOWN_KEY_MODE_PASSTHROUGH,
  UNKNOWN_KEY_MODE_STRIP,
} from './ir/index.js';

const NON_STRICT_OBJECT_POLICY_REJECT = 'reject';
const NON_STRICT_OBJECT_POLICY_STRIP = 'strip';

export type NonStrictObjectPolicy =
  | typeof NON_STRICT_OBJECT_POLICY_REJECT
  | typeof NON_STRICT_OBJECT_POLICY_STRIP;

export interface NonStrictObjectPolicyOptions {
  nonStrictObjectPolicy?: NonStrictObjectPolicy | undefined;
}

export const DEFAULT_NON_STRICT_OBJECT_POLICY: NonStrictObjectPolicy =
  NON_STRICT_OBJECT_POLICY_REJECT;

export interface PortableObjectKeywordInput {
  additionalProperties?: boolean | object | undefined;
  [UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY]?: PortableUnknownKeyBehaviorMode | undefined;
}

export function resolveNonStrictObjectPolicy(
  options?: NonStrictObjectPolicyOptions,
): NonStrictObjectPolicy {
  return options?.nonStrictObjectPolicy ?? DEFAULT_NON_STRICT_OBJECT_POLICY;
}

export function shouldNormalizeNonStrictObjectInput(
  options?: NonStrictObjectPolicyOptions,
): boolean {
  return resolveNonStrictObjectPolicy(options) === NON_STRICT_OBJECT_POLICY_STRIP;
}

export function buildNonStrictObjectPolicyHint(): string {
  return `Pass { nonStrictObjectPolicy: '${NON_STRICT_OBJECT_POLICY_STRIP}' } to deliberately normalize non-strict object input to strip semantics.`;
}

export function buildNonStrictObjectRejectionMessage(inputDescription: string): string {
  return `Non-strict object input "${inputDescription}" is not supported because strict object ingest is the default. ${buildNonStrictObjectPolicyHint()}`;
}

export function describePortableNonStrictObjectInput(
  input: PortableObjectKeywordInput,
): string | undefined {
  const extensionValue = input[UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY];
  if (extensionValue === UNKNOWN_KEY_MODE_STRIP) {
    return `${UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY}: "${UNKNOWN_KEY_MODE_STRIP}"`;
  }
  if (extensionValue === UNKNOWN_KEY_MODE_PASSTHROUGH) {
    return `${UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY}: "${UNKNOWN_KEY_MODE_PASSTHROUGH}"`;
  }
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

export function normalizeObjectSchemaToStrip(schema: CastrSchema): void {
  schema.additionalProperties = true;
  schema.unknownKeyBehavior = { mode: UNKNOWN_KEY_MODE_STRIP };
}

export function normalizePortableObjectInputToStrip(input: PortableObjectKeywordInput): void {
  input.additionalProperties = true;
  input[UNKNOWN_KEY_BEHAVIOR_EXTENSION_KEY] = UNKNOWN_KEY_MODE_STRIP;
}
