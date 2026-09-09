import { expect, it } from 'vitest';
import { readAgentRegistrations, readTomlDocument, tomlString } from './toml-document.js';

it('does not promote nested settings to runtime bindings', () => {
  expect(tomlString(readTomlDocument('[nested]\nmodel = "decoy"'), 'model')).toBeNull();
});

it('decodes literal strings, quoted keys and comments', () => {
  expect(tomlString(readTomlDocument('"model" = \'bound\' # comment'), 'model')).toBe('bound');
});

it.each(['model = 42', 'model = true', 'model = []'])(
  'rejects a non-string binding: %s',
  (content) => {
    expect(() => tomlString(readTomlDocument(content), 'model')).toThrow(/must be a string/);
  },
);

it.each(['model = "x"\nmodel = "y"', 'model = "unterminated'])(
  'rejects invalid TOML: %s',
  (content) => {
    expect(() => readTomlDocument(content)).toThrow();
  },
);

it('does not fill missing registration fields from an unrelated section', () => {
  expect(
    readAgentRegistrations(
      '[agents.reviewer]\ndescription = "Review"\n[other]\nconfig_file = "agents/decoy.toml"',
    ),
  ).toEqual([{ name: 'reviewer', description: 'Review', configFile: '' }]);
});

it('rejects duplicate role registrations', () => {
  expect(() =>
    readAgentRegistrations(
      '[agents.reviewer]\ndescription = "one"\n[agents.reviewer]\ndescription = "two"',
    ),
  ).toThrow();
});

it.each([
  'max_threads = 3',
  'max_concurrent_threads_per_session = 3',
  'max_concurrent_threads_per_session = 9223372036854775807',
  'max_depth = -1',
  'max_depth = 2147483647',
  'job_max_runtime_seconds = 0',
  'job_max_runtime_seconds = 9007199254740993',
  'job_max_runtime_seconds = 9223372036854775807',
  'enabled = true',
  'interrupt_message = false',
  'default_subagent_model = "configured-model"',
  'default_subagent_reasoning_effort = "ultra"',
])('validates and excludes a supported agent setting: %s', (setting) => {
  expect(readAgentRegistrations(`[agents]\n${setting}`)).toEqual([]);
});

it.each([
  'max_threads = -2.5',
  'max_threads = 0',
  'max_threads = 3.0',
  'max_threads = 9223372036854775808',
  'max_concurrent_threads_per_session = 0',
  'max_concurrent_threads_per_session = 3.0',
  'max_concurrent_threads_per_session = 9223372036854775808',
  'max_depth = 1.0',
  'max_depth = 2147483648',
  'max_depth = -2147483649',
  'job_max_runtime_seconds = -1',
  'job_max_runtime_seconds = 1.5',
  'job_max_runtime_seconds = 9223372036854775808',
  'job_max_runtime_seconds = 18446744073709551615',
  'enabled = "true"',
  'interrupt_message = 1',
  'default_subagent_model = false',
  'default_subagent_reasoning_effort = "extreme"',
  'unknown_setting = 3',
])('rejects malformed or unknown agent settings: %s', (setting) => {
  expect(() => readAgentRegistrations(`[agents]\n${setting}`)).toThrow();
});

it.each([
  'max_threads',
  'max_concurrent_threads_per_session',
  'max_depth',
  'job_max_runtime_seconds',
  'enabled',
  'interrupt_message',
  'default_subagent_model',
  'default_subagent_reasoning_effort',
])('never admits a reserved setting as a role: %s', (setting) => {
  expect(() =>
    readAgentRegistrations(
      `[agents.${setting}]\ndescription = "Fake role"\nconfig_file = "agents/fake.toml"`,
    ),
  ).toThrow();
});

it('rejects concurrent and legacy spellings of the same setting', () => {
  expect(() =>
    readAgentRegistrations('[agents]\nmax_threads = 3\nmax_concurrent_threads_per_session = 4'),
  ).toThrow();
});

it('rejects unknown registration fields instead of stripping them', () => {
  expect(() =>
    readAgentRegistrations(
      '[agents.reviewer]\ndescription = "Review"\nconfig_file = "agents/reviewer.toml"\nmodel = "hidden"',
    ),
  ).toThrow();
});

it.each(['agents = []', 'agents = 3', 'agents = "invalid"', 'agents = 2026-09-06'])(
  'requires the agents namespace to be a table: %s',
  (content) => {
    expect(() => readAgentRegistrations(content)).toThrow();
  },
);
