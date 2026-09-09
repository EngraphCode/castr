import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { execPath } from 'node:process';
import { afterEach, expect, it } from 'vitest';
import { parseDocument } from 'yaml';

const directories: string[] = [];
const cli = resolve('src/bin/agent-adapter-generate.ts');
const cliArguments = ['--import', import.meta.resolve('tsx'), cli];

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
    readdirSync(join(root, directory)).map((name) => join(directory, name)),
  );
  return new Map(paths.toSorted().map((path) => [path, readFileSync(join(root, path), 'utf8')]));
}

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

it('preserves generated work when clear-and-regenerate rejects invalid sources', () => {
  const root = generatedRepository();
  const original = generatedFiles(root);
  writeFileSync(join(root, '.codex/agents/cricket-judgement-low.toml'), 'invalid TOML');
  const result = spawnSync(execPath, [...cliArguments, '--clear'], { cwd: root, encoding: 'utf8' });
  expect(result.status).toBe(1);
  expect(result.stderr).toContain('invalid TOML');
  expect(result.stderr).toContain('.codex/agents/cricket-judgement-low.toml');
  expect(generatedFiles(root)).toEqual(original);
});
