import { z } from 'zod';
import { readTomlDocument } from './toml-document.js';

/** Keep omission available to callers' field-specific diagnostics. */
function optionalString(key: string) {
  return z.string({ error: `TOML key '${key}' must be a string.` }).optional();
}

const adapterSchema = z.strictObject({
  name: optionalString('name'),
  description: optionalString('description'),
  model: optionalString('model'),
  model_reasoning_effort: optionalString('model_reasoning_effort'),
  sandbox_mode: optionalString('sandbox_mode'),
  approval_policy: optionalString('approval_policy'),
  developer_instructions: optionalString('developer_instructions'),
});

/** Closed reviewer fields after validation; absence remains available for diagnostics. */
export type CodexAdapterDocument = z.output<typeof adapterSchema>;

/**
 * Parse the complete, closed Castr reviewer-adapter document once.
 *
 * @param content - Complete adapter TOML source.
 * @returns The validated schema output with declared string fields preserved.
 * Missing fields remain absent for callers' required-field diagnostics; an
 * omitted model continues to mean inheritance.
 * @throws If TOML is malformed, an undeclared key/table occurs, or a supplied
 * field is not a string. This is Castr's reviewer contract, not the full vendor
 * configuration schema; role-specific values are validated by consumers.
 * @example
 * ```typescript
 * const document = readCodexAdapterDocument(source);
 * const model = tomlString(document, 'model');
 * ```
 */
export function readCodexAdapterDocument(content: string): CodexAdapterDocument {
  return adapterSchema.parse(readTomlDocument(content));
}
