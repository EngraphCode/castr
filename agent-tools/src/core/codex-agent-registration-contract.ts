/** Whether a Codex agent name is a lowercase, hyphen-delimited filename token. */
export function isCanonicalCodexAgentName(name: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(name);
}

/** The only config_file spelling owned by a Codex project-agent registration. */
export function expectedCodexAgentConfigFile(name: string): string {
  return `agents/${name}.toml`;
}

/** Reject any registration that does not own one exact canonical adapter path. */
export function assertCanonicalCodexAgentRegistration(registration: {
  readonly name: string;
  readonly description: string;
  readonly configFile: string;
}): void {
  if (!isCanonicalCodexAgentName(registration.name)) {
    throw new Error(
      `Codex agent registration name '${registration.name}' must be a lowercase, hyphen-delimited token.`,
    );
  }
  if (registration.description.trim().length === 0) {
    throw new Error(`Codex agent '${registration.name}' is missing a description.`);
  }
  if (!registration.configFile) {
    throw new Error(`Codex agent '${registration.name}' is missing a config_file.`);
  }
  const expectedConfigFile = expectedCodexAgentConfigFile(registration.name);
  if (registration.configFile !== expectedConfigFile) {
    throw new Error(
      `Codex agent '${registration.name}' config_file must be '${expectedConfigFile}' (found '${registration.configFile}').`,
    );
  }
}
