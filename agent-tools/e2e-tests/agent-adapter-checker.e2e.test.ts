import { execFileSync, spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { execPath } from 'node:process';
import { afterEach, describe, expect, it } from 'vitest';
import { parseDocument } from 'yaml';
import { resolveCodexProjectAgent } from '../src/core/codex-project-agents.js';

const directories: string[] = [];
const cli = resolve('src/bin/agent-adapter-generate.ts');
const cliArguments = ['--import', import.meta.resolve('tsx'), cli];
const validatorCli = resolve('src/validators/subagents/validate-subagents.ts');
const validatorCliArguments = ['--import', import.meta.resolve('tsx'), validatorCli];
const templatePath = '.agent/sub-agents/templates/architecture-expert.md';
const personaPath = '.agent/sub-agents/components/personas/barney.md';

// First-party fixture of the supported Codex source contract; no native models run here.
const codexSeats = [
  { name: 'cricket-judgement-low', model: 'gpt-5.6-sol', effort: 'low', method: 'judgement' },
  {
    name: 'cricket-judgement-medium',
    model: 'gpt-5.6-terra',
    effort: 'medium',
    method: 'judgement',
  },
  { name: 'cricket-procedure-xhigh', model: 'gpt-5.6-luna', effort: 'xhigh', method: 'procedure' },
];

const markdownSeats = [
  { name: 'cricket-judgement-high', model: 'sonnet', effort: 'high', method: 'judgement' },
  { name: 'cricket-judgement-low', model: 'fable', effort: 'low', method: 'judgement' },
  { name: 'cricket-judgement-medium', model: 'opus', effort: 'medium', method: 'judgement' },
  { name: 'cricket-procedure-xhigh', model: 'haiku', effort: 'xhigh', method: 'procedure' },
];

afterEach(() => {
  for (const directory of directories.splice(0)) rmSync(directory, { recursive: true });
});

function generatedRepository(): string {
  const root = mkdtempSync(join(tmpdir(), 'castr-adapter-check-'));
  directories.push(root);
  mkdirSync(join(root, '.codex/agents'), { recursive: true });
  mkdirSync(join(root, '.agent/rules'), { recursive: true });
  mkdirSync(join(root, '.agent/sub-agents/templates'), { recursive: true });
  writeFileSync(join(root, 'pnpm-workspace.yaml'), 'packages: []\n');
  const registrations = codexSeats.map(
    ({ name }) =>
      `[agents.${name}]\ndescription = "Conscience check."\nconfig_file = "agents/${name}.toml"\n`,
  );
  writeFileSync(join(root, '.codex/config.toml'), registrations.join('\n'));
  for (const { name, model, effort, method } of codexSeats) {
    writeFileSync(
      join(root, `.codex/agents/${name}.toml`),
      `name = "${name}"
description = "Conscience check."
model = "${model}"
model_reasoning_effort = "${effort}"
sandbox_mode = "read-only"
approval_policy = "never"
developer_instructions = "Read \`.agent/sub-agents/templates/cricket-${method}.md\`."
`,
    );
  }
  for (const method of ['judgement', 'procedure']) {
    writeFileSync(
      join(root, `.agent/sub-agents/templates/cricket-${method}.md`),
      `# Cricket ${method}\n\nReview the supplied checkpoint.\n`,
    );
  }
  writeFileSync(join(root, '.agent/rules/example.md'), '# Example rule\n');
  execFileSync(execPath, cliArguments, { cwd: root });
  return root;
}

function generatedFiles(root: string): Map<string, string> {
  const paths = ['.claude/agents', '.cursor/agents', '.cursor/rules'].flatMap((directory) =>
    readdirSync(join(root, directory), { recursive: true, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => relative(root, join(entry.parentPath, entry.name))),
  );
  return new Map(paths.toSorted().map((path) => [path, readFileSync(join(root, path), 'utf8')]));
}

function generatedPersonaRepository(): string {
  const root = generatedRepository();
  const config = join(root, '.codex/config.toml');
  writeFileSync(
    config,
    `${readFileSync(config, 'utf8')}\n[agents.architecture-expert-barney]\ndescription = "Review architecture."\nconfig_file = "agents/architecture-expert-barney.toml"\n`,
  );
  mkdirSync(join(root, '.agent/sub-agents/components/personas'), { recursive: true });
  writeFileSync(join(root, templatePath), '# Architecture review\n');
  writeFileSync(join(root, personaPath), '# Barney\n');
  writeFileSync(
    join(root, '.codex/agents/architecture-expert-barney.toml'),
    [
      'name = "architecture-expert-barney"',
      'description = "Review architecture."',
      'model_reasoning_effort = "high"',
      'sandbox_mode = "read-only"',
      'approval_policy = "never"',
      `developer_instructions = "Read \`${templatePath}\` and \`${personaPath}\`."`,
      '',
    ].join('\n'),
  );
  execFileSync(execPath, cliArguments, { cwd: root });
  writeFileSync(join(root, '.cursor/rules/example.mdc'), 'Original rule work\n');
  mkdirSync(join(root, '.cursor/rules/nested'), { recursive: true });
  writeFileSync(join(root, '.cursor/rules/nested/notes.txt'), 'Preserved notes\n');
  return root;
}

function directorySnapshot(root: string): Map<string, string> {
  const paths = readdirSync(root, { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => relative(root, join(entry.parentPath, entry.name)));
  return new Map(paths.toSorted().map((path) => [path, readFileSync(join(root, path), 'utf8')]));
}

function directoryLink(path: string, safeOutput: string) {
  return {
    path,
    safeOutput,
    prepare(root: string, outside: string): void {
      mkdirSync(join(root, path), { recursive: true });
      const target = join(outside, 'linked');
      renameSync(join(root, path), target);
      writeFileSync(join(target, 'external.mdc'), 'External rule work\n');
      writeFileSync(join(target, 'external.md'), 'External adapter work\n');
      symlinkSync(target, join(root, path), 'dir');
    },
  };
}

function fileLink(path: string, safeOutput: string) {
  return {
    path,
    safeOutput,
    prepare(root: string, outside: string): void {
      const target = join(outside, 'linked-file');
      writeFileSync(target, 'External file work\n');
      rmSync(join(root, path), { force: true });
      symlinkSync(target, join(root, path), 'file');
    },
  };
}

const cursorSafeOutput = '.claude/agents/cricket-judgement-low.md';
const claudeSafeOutput = '.cursor/agents/cricket-judgement-low.md';
const outputSurfaces = [
  {
    path: '.cursor/agents',
    expected: 'cricket-judgement-low.md',
    extension: '.md',
    safeOutput: cursorSafeOutput,
  },
  {
    path: '.claude/agents',
    expected: 'cricket-judgement-low.md',
    extension: '.md',
    safeOutput: claudeSafeOutput,
  },
  {
    path: '.cursor/rules',
    expected: 'example.mdc',
    extension: '.mdc',
    safeOutput: cursorSafeOutput,
  },
];
const symbolicLinkScenarios = [
  directoryLink('.cursor', cursorSafeOutput),
  directoryLink('.claude', claudeSafeOutput),
  ...outputSurfaces.flatMap(({ path, expected, extension, safeOutput }) => [
    directoryLink(path, safeOutput),
    directoryLink(`${path}/nested`, safeOutput),
    fileLink(`${path}/${expected}`, safeOutput),
    fileLink(`${path}/retired${extension}`, safeOutput),
    {
      path: `${path}/dangling${extension}`,
      safeOutput,
      prepare(root: string, outside: string): void {
        symlinkSync(join(outside, 'absent'), join(root, `${path}/dangling${extension}`), 'file');
      },
    },
    {
      path: `${path}/cycle`,
      safeOutput,
      prepare(root: string): void {
        symlinkSync(join(root, path), join(root, `${path}/cycle`), 'dir');
      },
    },
  ]),
];

it('persists the Claude and Cursor Cricket quartets from the registered Codex trio', () => {
  const root = generatedRepository();
  expect(readdirSync(join(root, '.codex/agents')).toSorted()).toEqual(
    codexSeats.map(({ name }) => `${name}.toml`),
  );
  for (const platform of ['claude', 'cursor']) {
    expect(readdirSync(join(root, `.${platform}/agents`)).toSorted()).toEqual(
      markdownSeats.map(({ name }) => `${name}.md`),
    );
    for (const { name, model, effort, method } of markdownSeats) {
      const content = readFileSync(join(root, `.${platform}/agents/${name}.md`), 'utf8');
      const frontmatter = parseDocument(/^---\n([\s\S]*?)\n---(?:\n|$)/u.exec(content)?.[1] ?? '');
      expect(frontmatter.errors).toEqual([]);
      expect(frontmatter.get('name')).toBe(name);
      expect(content).toContain(`\`.agent/sub-agents/templates/cricket-${method}.md\``);
      if (platform === 'claude') {
        expect(frontmatter.get('model')).toBe(model);
        expect(frontmatter.get('effort')).toBe(effort);
        expect(frontmatter.get('tools')).toBe('Read');
        expect(frontmatter.get('disallowedTools')).toBe('Write, Edit, Bash, Grep, Glob');
      } else {
        expect(frontmatter.get('readonly')).toBe(true);
        for (const field of ['model', 'effort', 'tools'])
          expect(frontmatter.has(field)).toBe(false);
      }
    }
  }
  const result = spawnSync(execPath, [...cliArguments, '--check'], { cwd: root, encoding: 'utf8' });
  expect(result.status).toBe(0);
  expect(result.stdout).toContain('up to date');
});

it('reports surplus generated files and fails the running check command', () => {
  const root = generatedRepository();
  mkdirSync(join(root, '.cursor/agents'), { recursive: true });
  writeFileSync(join(root, '.cursor/agents/retired.md'), 'Surplus adapter\n');
  expect(() =>
    execFileSync(execPath, [...cliArguments, '--check'], { cwd: root, stdio: 'pipe' }),
  ).toThrow(/Unexpected adapters/);
});

it('recovers from surplus adapters and nested rules using the advertised clear command', () => {
  const root = generatedRepository();
  mkdirSync(join(root, '.cursor/rules/nested'), { recursive: true });
  writeFileSync(join(root, '.cursor/rules/nested/retired.mdc'), 'Surplus rule\n');
  writeFileSync(join(root, '.cursor/rules/nested/README.md'), 'Rule documentation\n');
  writeFileSync(join(root, '.cursor/rules/notes.txt'), 'Retained notes\n');
  writeFileSync(join(root, '.claude/agents/retired.md'), 'Surplus adapter\n');
  const failing = spawnSync(execPath, [...cliArguments, '--check'], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(failing.status).toBe(1);
  expect(failing.stderr).toContain('.cursor/rules/nested/retired.mdc');
  expect(failing.stderr).toContain('pnpm agents:adapter-generate --clear');

  const repaired = spawnSync(execPath, [...cliArguments, '--clear'], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(repaired.status).toBe(0);
  const checked = spawnSync(execPath, [...cliArguments, '--check'], {
    cwd: root,
    encoding: 'utf8',
  });
  expect(checked.status).toBe(0);
  expect(checked.stdout).toContain('up to date');
  expect(existsSync(join(root, '.cursor/rules/nested/retired.mdc'))).toBe(false);
  expect(existsSync(join(root, '.claude/agents/retired.md'))).toBe(false);
  expect(readFileSync(join(root, '.cursor/rules/nested/README.md'), 'utf8')).toBe(
    'Rule documentation\n',
  );
  expect(readFileSync(join(root, '.cursor/rules/notes.txt'), 'utf8')).toBe('Retained notes\n');
});

it.each([
  { label: '--help', args: ['--help'], expectedStatus: 0, expectedStream: 'stdout' },
  { label: 'an unknown flag', args: ['--chek'], expectedStatus: 1, expectedStream: 'stderr' },
  {
    label: 'a duplicated flag',
    args: ['--check', '--check'],
    expectedStatus: 1,
    expectedStream: 'stderr',
  },
  {
    label: '--help with another flag',
    args: ['--help', '--check'],
    expectedStatus: 1,
    expectedStream: 'stderr',
  },
  {
    label: '--check with --clear',
    args: ['--check', '--clear'],
    expectedStatus: 1,
    expectedStream: 'stderr',
  },
] as const)(
  'handles $label without changing generated files',
  ({ args, expectedStatus, expectedStream }) => {
    const root = generatedRepository();
    writeFileSync(join(root, '.cursor/rules/example.mdc'), 'Original rule work\n');
    const original = generatedFiles(root);

    const result = spawnSync(execPath, [...cliArguments, ...args], {
      cwd: root,
      encoding: 'utf8',
    });

    expect(result.status).toBe(expectedStatus);
    expect(result[expectedStream]).toContain('agent-adapter-generate');
    expect(result[expectedStream]).toContain('--check');
    expect(result[expectedStream]).toContain('--clear');
    expect(result[expectedStream]).toContain('--help');
    expect(result[expectedStream]).toContain('Example:');
    expect(generatedFiles(root)).toEqual(original);
  },
);

it('rejects an alias registration through the running subagent validator', () => {
  const root = generatedRepository();
  const config = join(root, '.codex/config.toml');
  writeFileSync(
    config,
    `${readFileSync(config, 'utf8')}\n[agents.alias-reviewer]\ndescription = "Conscience check."\nconfig_file = "agents/cricket-judgement-low.toml"\n`,
  );

  const result = spawnSync(execPath, validatorCliArguments, {
    cwd: root,
    encoding: 'utf8',
    env: { CLAUDE_PROJECT_DIR: root },
  });

  expect(result.status).toBe(1);
  expect(result.stderr).toContain(
    'resolves "alias-reviewer" to .codex/agents/cricket-judgement-low.toml; expected .codex/agents/alias-reviewer.toml',
  );
});

it('rejects a linked Codex registry through the running subagent validator', () => {
  const root = generatedRepository();
  const source = '.codex/config.toml';
  const target = join(root, 'linked-config.toml');
  renameSync(join(root, source), target);
  symlinkSync(target, join(root, source), 'file');

  const result = spawnSync(execPath, validatorCliArguments, {
    cwd: root,
    encoding: 'utf8',
    env: { CLAUDE_PROJECT_DIR: root },
  });

  expect(result.status).toBe(1);
  expect(result.stderr).toContain(
    '.codex/config.toml: required source must not traverse symbolic link .codex/config.toml',
  );
});

it.each([
  '.agent/sub-agents/components/behaviours/subagent-identity.md',
  '.agent/sub-agents/components/behaviours',
])(
  'rejects a linked required identity source %s through the running subagent validator',
  (source) => {
    const root = generatedPersonaRepository();
    const identityPath = join(root, '.agent/sub-agents/components/behaviours/subagent-identity.md');
    mkdirSync(join(root, '.agent/sub-agents/components/behaviours'), { recursive: true });
    writeFileSync(identityPath, '# Subagent identity\n');
    const outside = mkdtempSync(join(tmpdir(), 'castr-external-identity-source-'));
    directories.push(outside);
    const target = join(
      outside,
      source.endsWith('.md') ? 'linked-identity.md' : 'linked-behaviours',
    );
    renameSync(join(root, source), target);
    symlinkSync(target, join(root, source), source.endsWith('.md') ? 'file' : 'dir');

    const result = spawnSync(execPath, validatorCliArguments, {
      cwd: root,
      encoding: 'utf8',
      env: { CLAUDE_PROJECT_DIR: root },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      `.agent/sub-agents/components/behaviours/subagent-identity.md: required source must not traverse symbolic link ${source}`,
    );
  },
);

describe.each([
  { label: 'generate', args: [] },
  { label: 'clear', args: ['--clear'] },
  { label: 'check', args: ['--check'] },
])('$label source-failure preservation', ({ args }) => {
  it.each([
    '.agent/rules',
    '.codex/agents',
    '.codex/config.toml',
    '.agent/sub-agents/templates/cricket-judgement.md',
    templatePath,
    personaPath,
  ])('fails without changing any output when %s is missing', (source) => {
    const root = generatedPersonaRepository();
    const original = generatedFiles(root);
    rmSync(join(root, source), { recursive: true });
    const result = spawnSync(execPath, [...cliArguments, ...args], {
      cwd: root,
      encoding: 'utf8',
    });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(source);
    expect(generatedFiles(root)).toEqual(original);
  });

  it.each([templatePath, personaPath])(
    'fails without changing any output when canonical reference %s is a directory',
    (source) => {
      const root = generatedPersonaRepository();
      const original = generatedFiles(root);
      rmSync(join(root, source));
      mkdirSync(join(root, source));

      const result = spawnSync(execPath, [...cliArguments, ...args], {
        cwd: root,
        encoding: 'utf8',
      });
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(source);
      expect(result.stderr).toContain('must be a readable file');
      expect(generatedFiles(root)).toEqual(original);
    },
  );

  it('validates every canonical reference before changing outputs', () => {
    const root = generatedPersonaRepository();
    const original = generatedFiles(root);
    const adapterPath = join(root, '.codex/agents/architecture-expert-barney.toml');
    const missingComponent = '.agent/sub-agents/components/behaviours/missing.md';
    writeFileSync(
      adapterPath,
      readFileSync(adapterPath, 'utf8').replace(
        `and \`${personaPath}\``,
        `and \`${personaPath}\` and \`${missingComponent}\``,
      ),
    );

    const result = spawnSync(execPath, [...cliArguments, ...args], { cwd: root, encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(missingComponent);
    expect(generatedFiles(root)).toEqual(original);
  });

  it('rejects a canonical reference that escapes the .agent tree before changing outputs', () => {
    const root = generatedPersonaRepository();
    const original = generatedFiles(root);
    const adapterPath = join(root, '.codex/agents/architecture-expert-barney.toml');
    writeFileSync(join(root, 'outside.md'), '# Outside\n');
    writeFileSync(
      adapterPath,
      readFileSync(adapterPath, 'utf8').replace(personaPath, '.agent/../outside.md'),
    );

    const result = spawnSync(execPath, [...cliArguments, ...args], { cwd: root, encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('.agent/../outside.md');
    expect(result.stderr).toContain('normalized path beneath .agent');
    expect(generatedFiles(root)).toEqual(original);
  });

  it.each([
    { label: 'leaf file', source: personaPath },
    { label: 'intermediate directory', source: '.agent/sub-agents/templates' },
  ])('rejects a canonical $label symbolic link before changing outputs', ({ source }) => {
    const root = generatedPersonaRepository();
    const original = generatedFiles(root);
    const outside = mkdtempSync(join(tmpdir(), 'castr-external-canonical-source-'));
    directories.push(outside);
    const target = join(outside, 'linked-source');
    renameSync(join(root, source), target);
    symlinkSync(target, join(root, source), source === personaPath ? 'file' : 'dir');
    const externalOriginal = directorySnapshot(outside);

    const result = spawnSync(execPath, [...cliArguments, ...args], { cwd: root, encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(source);
    expect(result.stderr).toContain('symbolic link');
    expect(generatedFiles(root)).toEqual(original);
    expect(directorySnapshot(outside)).toEqual(externalOriginal);
  });

  it('rejects a canonical rule symbolic link before changing outputs', () => {
    const root = generatedPersonaRepository();
    const original = generatedFiles(root);
    const source = '.agent/rules/example.md';
    const outside = mkdtempSync(join(tmpdir(), 'castr-external-canonical-rule-'));
    directories.push(outside);
    const target = join(outside, 'example.md');
    renameSync(join(root, source), target);
    symlinkSync(target, join(root, source), 'file');
    const externalOriginal = directorySnapshot(outside);

    const result = spawnSync(execPath, [...cliArguments, ...args], { cwd: root, encoding: 'utf8' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(source);
    expect(result.stderr).toContain('symbolic link');
    expect(generatedFiles(root)).toEqual(original);
    expect(directorySnapshot(outside)).toEqual(externalOriginal);
  });

  it.each([
    { source: '.agent/rules', linkType: 'dir' as const },
    { source: '.codex/agents', linkType: 'dir' as const },
    { source: '.codex/config.toml', linkType: 'file' as const },
  ])('rejects linked required source $source before changing outputs', ({ source, linkType }) => {
    const root = generatedPersonaRepository();
    const original = generatedFiles(root);
    const outside = mkdtempSync(join(tmpdir(), 'castr-external-required-source-'));
    directories.push(outside);
    const target = join(outside, linkType === 'dir' ? 'linked-directory' : 'linked-file');
    renameSync(join(root, source), target);
    symlinkSync(target, join(root, source), linkType);
    const externalOriginal = directorySnapshot(outside);

    const result = spawnSync(execPath, [...cliArguments, ...args], { cwd: root, encoding: 'utf8' });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(source);
    expect(result.stderr).toContain('symbolic link');
    expect(generatedFiles(root)).toEqual(original);
    expect(directorySnapshot(outside)).toEqual(externalOriginal);
  });

  it('rejects an absent Codex adapter directory even with an empty registry', () => {
    const root = generatedPersonaRepository();
    const original = generatedFiles(root);
    writeFileSync(join(root, '.codex/config.toml'), '[features]\nmulti_agent = true\n');
    rmSync(join(root, '.codex/agents'), { recursive: true });

    const result = spawnSync(execPath, [...cliArguments, ...args], { cwd: root, encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('.codex/agents');
    expect(generatedFiles(root)).toEqual(original);
  });

  it('preserves generated work when source TOML is invalid', () => {
    const root = generatedPersonaRepository();
    const original = generatedFiles(root);
    writeFileSync(join(root, '.codex/agents/cricket-judgement-low.toml'), 'invalid TOML');

    const result = spawnSync(execPath, [...cliArguments, ...args], { cwd: root, encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('invalid TOML');
    expect(result.stderr).toContain('.codex/agents/cricket-judgement-low.toml');
    expect(generatedFiles(root)).toEqual(original);
  });

  it('fails without changing any output when an alias shares a real adapter', () => {
    const root = generatedRepository();
    writeFileSync(join(root, '.cursor/rules/example.mdc'), 'Original rule work\n');
    const original = generatedFiles(root);
    const config = join(root, '.codex/config.toml');
    writeFileSync(
      config,
      `${readFileSync(config, 'utf8')}\n[agents.alias-reviewer]\ndescription = "Conscience check."\nconfig_file = "agents/cricket-judgement-low.toml"\n`,
    );

    const result = spawnSync(execPath, [...cliArguments, ...args], { cwd: root, encoding: 'utf8' });
    expect(result.status).toBe(1);
    expect(result.stderr).toContain('alias-reviewer');
    expect(generatedFiles(root)).toEqual(original);
  });
});

it.each([
  { label: 'leaf file', source: personaPath },
  { label: 'intermediate directory', source: '.agent/sub-agents/templates' },
])('validator and resolver reject a canonical $label symbolic link', ({ source }) => {
  const root = generatedPersonaRepository();
  const outside = mkdtempSync(join(tmpdir(), 'castr-external-canonical-consumer-'));
  directories.push(outside);
  const target = join(outside, 'linked-source');
  renameSync(join(root, source), target);
  symlinkSync(target, join(root, source), source === personaPath ? 'file' : 'dir');
  const externalOriginal = directorySnapshot(outside);

  const validation = spawnSync(execPath, validatorCliArguments, {
    cwd: root,
    encoding: 'utf8',
    env: { CLAUDE_PROJECT_DIR: root },
  });
  expect(validation.status).toBe(1);
  expect(validation.stderr).toContain(source);
  expect(validation.stderr).toContain('symbolic link');
  if (source === '.agent/sub-agents/templates') {
    expect(validation.stderr).toContain(
      '.agent/sub-agents/templates: required source must not traverse symbolic link .agent/sub-agents/templates',
    );
  }
  expect(() => resolveCodexProjectAgent(root, 'architecture-expert-barney')).toThrow(
    /symbolic link/u,
  );
  expect(directorySnapshot(outside)).toEqual(externalOriginal);
});

it('reports missing and drifted Cursor rules', () => {
  const root = generatedRepository();
  writeFileSync(join(root, '.cursor/rules/example.mdc'), 'Drifted rule\n');
  expect(() =>
    execFileSync(execPath, [...cliArguments, '--check'], { cwd: root, stdio: 'pipe' }),
  ).toThrow(/Drifted adapters/);
  rmSync(join(root, '.cursor/rules/example.mdc'));
  expect(() =>
    execFileSync(execPath, [...cliArguments, '--check'], { cwd: root, stdio: 'pipe' }),
  ).toThrow(/Missing adapters/);
});

it.each([
  ['missing', 'Missing adapters'],
  ['drifted', 'Drifted adapters'],
  ['surplus', 'Unexpected adapters'],
])('fails the running check with a %s Claude adapter', (fault, diagnostic) => {
  const root = generatedRepository();
  const path = join(root, '.claude/agents/cricket-judgement-high.md');
  if (fault === 'missing') rmSync(path);
  if (fault === 'drifted')
    writeFileSync(path, `${readFileSync(path, 'utf8')}\nChanged generated adapter.\n`);
  if (fault === 'surplus')
    writeFileSync(join(root, '.claude/agents/retired.md'), 'Surplus adapter\n');
  const result = spawnSync(execPath, [...cliArguments, '--check'], { cwd: root, encoding: 'utf8' });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain(diagnostic);
  expect(result.stderr).toContain(
    fault === 'surplus' ? '.claude/agents/retired.md' : '.claude/agents/cricket-judgement-high.md',
  );
});

describe.each([
  { label: 'generate', args: [] },
  { label: 'clear', args: ['--clear'] },
  { label: 'check', args: ['--check'] },
])('$label output-estate safety', ({ args }) => {
  it.each(symbolicLinkScenarios)(
    'rejects symbolic link $path before changing safe or external files',
    ({ path, safeOutput, prepare }) => {
      const root = generatedRepository();
      const outside = mkdtempSync(join(tmpdir(), 'castr-external-rule-target-'));
      directories.push(outside);
      writeFileSync(join(outside, 'sentinel.txt'), 'External work\n');
      writeFileSync(join(root, safeOutput), 'Original safe output\n');
      prepare(root, outside);
      const externalOriginal = directorySnapshot(outside);

      const result = spawnSync(execPath, [...cliArguments, ...args], {
        cwd: root,
        encoding: 'utf8',
      });

      expect(readFileSync(join(root, safeOutput), 'utf8')).toBe('Original safe output\n');
      expect(directorySnapshot(outside)).toEqual(externalOriginal);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(path);
      expect(result.stderr).toContain('symbolic link');
    },
  );

  it.each(outputSurfaces)(
    'rejects a non-directory root $path before other output changes',
    ({ path, safeOutput }) => {
      const root = generatedRepository();
      writeFileSync(join(root, safeOutput), 'Original safe output\n');
      rmSync(join(root, path), { recursive: true });
      writeFileSync(join(root, path), 'Unexpected file\n');

      const result = spawnSync(execPath, [...cliArguments, ...args], {
        cwd: root,
        encoding: 'utf8',
      });

      expect(readFileSync(join(root, safeOutput), 'utf8')).toBe('Original safe output\n');
      expect(readFileSync(join(root, path), 'utf8')).toBe('Unexpected file\n');
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(path);
      expect(result.stderr).toContain('directory');
    },
  );

  it.each(outputSurfaces)(
    'rejects a directory occupying the expected output in $path',
    ({ path, expected, safeOutput }) => {
      const root = generatedRepository();
      writeFileSync(join(root, safeOutput), 'Original safe output\n');
      const target = join(root, path, expected);
      rmSync(target);
      mkdirSync(target);

      const result = spawnSync(execPath, [...cliArguments, ...args], {
        cwd: root,
        encoding: 'utf8',
      });

      expect(readFileSync(join(root, safeOutput), 'utf8')).toBe('Original safe output\n');
      expect(readdirSync(target)).toEqual([]);
      expect(result.status).toBe(1);
      expect(result.stderr).toContain(join(path, expected));
      expect(result.stderr).toContain('regular file');
    },
  );
});

it('allows clear-and-generate when output directories are absent', () => {
  const root = generatedRepository();
  const original = generatedFiles(root);
  rmSync(join(root, '.cursor'), { recursive: true });
  rmSync(join(root, '.claude'), { recursive: true });

  const result = spawnSync(execPath, [...cliArguments, '--clear'], { cwd: root, encoding: 'utf8' });

  expect(result.status).toBe(0);
  expect(generatedFiles(root)).toEqual(original);
});
