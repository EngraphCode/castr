import { parse, type TomlTable } from 'smol-toml';
import { z } from 'zod';

/**
 * Parse TOML while preserving integer/float distinctions and integer precision.
 * @param content - Complete TOML source.
 * @returns Parsed document; integer literals remain bigint values.
 * @throws When the source is invalid TOML.
 */
export function readTomlDocument(content: string) {
  return parse(content, { integersAsBigInt: true });
}

/** Read a top-level string; distinguish wrong types from genuine omission. */
export function tomlString(document: TomlTable, key: string): string | null {
  if (!Object.hasOwn(document, key)) return null;
  const value = document[key];
  if (typeof value !== 'string') throw new Error(`TOML key '${key}' must be a string.`);
  return value;
}

const registrationSchema = z.strictObject({
  description: z.string().optional(),
  config_file: z.string().optional(),
});

// Codex's TOML loader caps integer literals at signed int64 before decoding u64.
const nonNegativeTomlInteger = z.bigint().min(0n).max(9_223_372_036_854_775_807n);
const concurrentThreads = nonNegativeTomlInteger.min(1n);
const settingsSchema = z.strictObject({
  max_threads: concurrentThreads,
  max_concurrent_threads_per_session: concurrentThreads,
  max_depth: z.bigint().min(-2_147_483_648n).max(2_147_483_647n),
  job_max_runtime_seconds: nonNegativeTomlInteger,
  enabled: z.boolean(),
  interrupt_message: z.boolean(),
  default_subagent_model: z.string(),
  default_subagent_reasoning_effort: z.enum([
    'none',
    'minimal',
    'low',
    'medium',
    'high',
    'xhigh',
    'max',
    'ultra',
  ]),
});
const settingNames = settingsSchema.keyof();

/**
 * Decode Castr role registrations after separating reserved Codex settings.
 *
 * @param content - The complete project config TOML.
 * @returns Registrations; missing fields remain empty for validation diagnostics.
 * @throws When a role has unknown fields, a namespace is malformed, a reserved
 * setting has the wrong type/range, or both concurrency-setting aliases occur.
 *
 * @remarks
 * Codex 0.153.4 accepts max_threads as an alias for the positive unsigned thread
 * limit, signed int32 max_depth, and unsigned job_max_runtime_seconds (including
 * zero). Its file loader rejects literals above signed int64 even for u64 fields;
 * these bounds were verified with isolated config files. Current settings:
 * https://developers.openai.com/codex/config-schema.json
 */
export function readAgentRegistrations(content: string) {
  const document = readTomlDocument(content);
  if (!Object.hasOwn(document, 'agents')) return [];
  const agents = document['agents'];
  if (!agents || typeof agents !== 'object' || Array.isArray(agents) || agents instanceof Date) {
    throw new Error("TOML key 'agents' must be a table.");
  }
  if (
    Object.hasOwn(agents, 'max_threads') &&
    Object.hasOwn(agents, 'max_concurrent_threads_per_session')
  ) {
    throw new Error('Codex agents concurrency setting is specified through both aliases.');
  }
  return Object.entries(agents).flatMap(([name, value]) => {
    const setting = settingNames.safeParse(name);
    if (setting.success) {
      settingsSchema.shape[setting.data].parse(value);
      return [];
    }
    const registration = registrationSchema.parse(value);
    return [
      {
        name,
        description: registration.description ?? '',
        configFile: registration.config_file ?? '',
      },
    ];
  });
}
