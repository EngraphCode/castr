/**
 * Native cross-platform agent-adapter + cursor-rule generator.
 *
 * Emits the platform adapter surfaces that the portability and subagents
 * validators require, deriving everything from already-gate-checked sources so
 * nothing is hand-maintained:
 *
 *   - `.cursor/agents/<name>.md`  — Cursor reviewer wrapper (18)
 *   - `.claude/agents/<name>.md`  — Claude Code reviewer wrapper (18)
 *   - `.cursor/rules/<name>.mdc`  — Cursor rule trigger (one per canonical rule)
 *
 * The agent roster is projected from `.codex/config.toml` (registrations and
 * descriptions), each hand-authored `.codex/agents/<name>.toml` (Codex runtime
 * configuration and canonical-template references), and canonical template
 * projection metadata (agent class and portable worker tools). This generator
 * never writes the Codex layer or canonical templates. Cursor rule triggers
 * are projected from the canonical `.agent/rules/*.md`.
 *
 * Pure render/derive functions are exported so the drift checker and unit
 * tests can exercise them without filesystem I/O.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join } from 'node:path';

import { readAgentProjection, type AgentClass } from './agent-projection.js';

import {
  extractCanonicalPaths,
  parseCodexRegistrations,
  readCodexDeveloperInstructions,
} from '../validators/subagents/validate-subagents-helpers.js';

const TEMPLATE_DIR = '.agent/sub-agents/templates';
const PERSONA_DIR = '.agent/sub-agents/components/personas';
const CODEX_ADAPTER_DIR = '.codex/agents';
const CODEX_CONFIG_FILE = '.codex/config.toml';
const CANONICAL_RULES_DIR = '.agent/rules';
const CURSOR_AGENTS_DIR = '.cursor/agents';
const CLAUDE_AGENTS_DIR = '.claude/agents';
const CURSOR_RULES_DIR = '.cursor/rules';

/** Model identifiers used in the generated adapter frontmatter, per platform. */
const CURSOR_AGENT_MODEL = 'gpt-5.5';
const CLAUDE_AGENT_MODEL = 'opus';
/** Model for the lean task-worker class on the Claude surface (owner doctrine). */
const CLAUDE_WORKER_MODEL = 'sonnet';

/** A roster entry projected from Codex registrations and canonical templates. */
export interface AgentRosterEntry {
  readonly name: string;
  readonly description: string;
  /** Canonical template path, e.g. `.agent/sub-agents/templates/code-reviewer.md`. */
  readonly templatePath: string;
  /** Persona component path for persona-expanded adapters, if any. */
  readonly personaPath?: string;
  /**
   * Reviewer (default) or lean task worker — selects the render shape. Absent
   * projection metadata on the canonical template defaults to reviewer,
   * keeping every existing reviewer adapter byte-identical.
   */
  readonly agentClass: AgentClass;
  /**
   * Tools explicitly granted to a worker by canonical template metadata.
   * Empty for reviewers (their toolset is fixed) and for a worker that grants
   * none — the least-privilege default.
   */
  readonly tools: readonly string[];
}

export type AgentSurface = 'cursor' | 'claude';

/**
 * Projects the agent roster from supplied Codex and canonical-template text.
 * Pure — no filesystem access.
 *
 * @param configText - Full text of `.codex/config.toml`.
 * @param adapterTextByName - Map of agent name to its `.codex/agents/<name>.toml` text.
 * @param templateTextByPath - Map of canonical template path to its Markdown text.
 * @returns Roster entries sorted by agent name.
 * @throws If an adapter has no matching config registration, or references no
 *   canonical template under {@link TEMPLATE_DIR}.
 */
export function buildAgentRoster(
  configText: string,
  adapterTextByName: ReadonlyMap<string, string>,
  templateTextByPath: ReadonlyMap<string, string>,
): AgentRosterEntry[] {
  const descriptionByName = new Map(
    parseCodexRegistrations(configText).map((registration) => [
      registration.name,
      registration.description,
    ]),
  );

  const entries: AgentRosterEntry[] = [];
  for (const name of [...adapterTextByName.keys()].toSorted((a, b) => a.localeCompare(b))) {
    const adapterText = adapterTextByName.get(name) ?? '';
    const canonicalPaths = extractCanonicalPaths(readCodexDeveloperInstructions(adapterText));
    const templatePath = canonicalPaths.find((p) => p.startsWith(`${TEMPLATE_DIR}/`));
    const personaPath = canonicalPaths.find((p) => p.startsWith(`${PERSONA_DIR}/`));

    if (templatePath === undefined) {
      throw new Error(
        `${CODEX_ADAPTER_DIR}/${name}.toml: references no canonical template under ${TEMPLATE_DIR}`,
      );
    }
    const description = descriptionByName.get(name);
    if (description === undefined || description === '') {
      throw new Error(`${name}: no registration with a description in ${CODEX_CONFIG_FILE}`);
    }
    const templateText = templateTextByPath.get(templatePath);
    if (templateText === undefined) {
      throw new Error(`${templatePath}: canonical template text was not supplied`);
    }
    const projection = readAgentProjection(templatePath, templateText);

    entries.push({
      name,
      description,
      templatePath,
      agentClass: projection.agentClass,
      tools: projection.tools,
      ...(personaPath === undefined ? {} : { personaPath }),
    });
  }
  return entries;
}

/** Humanises a kebab-case identifier into a Title Case label. */
export function toTitleCase(id: string): string {
  return id
    .split('-')
    .map((part) => (part.length === 0 ? part : `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`))
    .join(' ');
}

/**
 * Returns true when a YAML plain scalar would be ambiguous or invalid and the
 * value must be quoted.
 */
function needsYamlQuoting(value: string): boolean {
  if (value === '' || value !== value.trim()) {
    return true;
  }
  if (/^[-?:,[\]{}#&*!|>'"%@`]/u.test(value)) {
    return true;
  }
  if (/:(\s|$)/u.test(value) || /\s#/u.test(value) || value.includes('"')) {
    return true;
  }
  return false;
}

/**
 * Renders a YAML scalar, quoting only when the plain form would be unsafe.
 * Uses single quotes (Prettier's YAML default) with YAML single-quote escaping
 * so generated frontmatter stays Prettier-stable.
 */
function yamlScalar(value: string): string {
  return needsYamlQuoting(value) ? `'${value.replaceAll("'", "''")}'` : value;
}

interface SurfaceShape {
  readonly frontmatter: (entry: AgentRosterEntry) => string[];
}

const SURFACE_SHAPES: Record<AgentSurface, SurfaceShape> = {
  cursor: {
    frontmatter: (entry) =>
      entry.agentClass === 'worker'
        ? cursorWorkerFrontmatter(entry)
        : [
            `name: ${entry.name}`,
            `model: ${CURSOR_AGENT_MODEL}`,
            `description: ${yamlScalar(entry.description)}`,
            'readonly: true',
            'tools: Read, Glob, Grep, LS, Shell, ReadLints, WebFetch, WebSearch',
          ],
  },
  claude: {
    frontmatter: (entry) =>
      entry.agentClass === 'worker'
        ? claudeWorkerFrontmatter(entry)
        : [
            `name: ${entry.name}`,
            `description: ${yamlScalar(entry.description)}`,
            `model: ${CLAUDE_AGENT_MODEL}`,
            'tools: Read, Grep, Glob, Bash, WebFetch, WebSearch',
            'disallowedTools: Write, Edit, NotebookEdit',
            'permissionMode: plan',
          ],
  },
};

function cursorWorkerFrontmatter(entry: AgentRosterEntry): string[] {
  const head = [
    `name: ${entry.name}`,
    `model: ${CURSOR_AGENT_MODEL}`,
    `description: ${yamlScalar(entry.description)}`,
    'readonly: true',
  ];
  return entry.tools.length === 0
    ? [...head, 'tools:']
    : [...head, `tools: ${entry.tools.join(', ')}`];
}

/**
 * Claude frontmatter lines for a lean task-worker.
 *
 * A worker's `tools` is a strict allowlist. It is NEVER omitted — an omitted
 * `tools` inherits ALL tools (Claude docs), the opposite of least privilege.
 * There is no `permissionMode: plan` (that is the reviewer's read-only posture;
 * a worker executes its allowlisted tools and never exceeds the session's own
 * privilege). Note `Bash` is deliberately absent from any default grant: a shell
 * is a universal capability (arbitrary write + exec), so it is granted only when
 * a specific task genuinely needs it, never as part of a "read-only" set.
 *
 * A worker with NO granted tools renders the probe-verified zero-tools shape:
 * `tools` present with an EMPTY value (null). Probed 2026-07-02 (see the Practice donor's
 * corpus-voter/corpus-reducer wrappers): an empty `tools` value grants nothing,
 * while `tools: []` and an omitted `tools` both fall back to inherit-all. A
 * `disallowedTools` wildcard is NOT used — with zero granted there is nothing to
 * subtract, and a bare `*` is undocumented. So the zero-tools shape is
 * `tools`-only.
 */
function claudeWorkerFrontmatter(entry: AgentRosterEntry): string[] {
  const head = [
    `name: ${entry.name}`,
    `description: ${yamlScalar(entry.description)}`,
    `model: ${CLAUDE_WORKER_MODEL}`,
  ];
  if (entry.tools.length === 0) {
    return [...head, 'tools:'];
  }
  return [...head, `tools: ${entry.tools.join(', ')}`];
}

/**
 * Renders a Cursor or Claude reviewer adapter for a roster entry. The output is
 * deterministic and idempotent. The template-load line uses the exact phrasing
 * the subagents validator requires.
 */
export function renderAgentAdapter(entry: AgentRosterEntry, surface: AgentSurface): string {
  const frontmatter = SURFACE_SHAPES[surface].frontmatter(entry);
  const personaBlock =
    entry.personaPath === undefined
      ? []
      : [`Read and apply \`${entry.personaPath}\` for your persona identity and review lens.`, ''];

  const lines = [
    '---',
    ...frontmatter,
    '---',
    '',
    `# ${toTitleCase(entry.name)}`,
    '',
    'All file paths in this document are relative to the repository root.',
    '',
    ...personaBlock,
    `Your first action MUST be to read and internalise \`${entry.templatePath}\`.`,
    '',
    entry.agentClass === 'worker'
      ? 'Do the task exactly as briefed and return the raw result. Do not reason about, synthesise, or decide anything beyond the task — the calling agent owns all judgement.'
      : 'Review or recommend; do not modify code. The calling agent executes any changes you propose.',
    '',
  ];
  return lines.join('\n');
}

/**
 * Derives a one-line description for a canonical rule: the H1 title (stripped of
 * leading hashes) when present, otherwise the first non-empty line.
 */
export function deriveRuleDescription(ruleText: string): string {
  for (const rawLine of ruleText.split(/\r?\n/u)) {
    const line = rawLine.trim();
    if (line === '') {
      continue;
    }
    return line.startsWith('#') ? line.replace(/^#+\s*/u, '').trim() : line;
  }
  return '';
}

/** Renders a Cursor rule trigger (`.mdc`) for a canonical rule. */
export function renderCursorRule(ruleName: string, description: string): string {
  return [
    '---',
    `description: ${yamlScalar(description)}`,
    'alwaysApply: true',
    '---',
    '',
    `Read and follow \`${CANONICAL_RULES_DIR}/${ruleName}.md\`.`,
    '',
  ].join('\n');
}

function cursorAgentTargetPath(repoRoot: string, name: string): string {
  return join(repoRoot, CURSOR_AGENTS_DIR, `${name}.md`);
}

function claudeAgentTargetPath(repoRoot: string, name: string): string {
  return join(repoRoot, CLAUDE_AGENTS_DIR, `${name}.md`);
}

function agentTargetPath(repoRoot: string, name: string, surface: AgentSurface): string {
  return surface === 'cursor'
    ? cursorAgentTargetPath(repoRoot, name)
    : claudeAgentTargetPath(repoRoot, name);
}

function cursorRuleTargetPath(repoRoot: string, ruleName: string): string {
  return join(repoRoot, CURSOR_RULES_DIR, `${ruleName}.mdc`);
}

/** Lists files with a given extension in a repo-relative directory. */
async function listNames(repoRoot: string, relDir: string, extension: string): Promise<string[]> {
  const entries = await readdir(join(repoRoot, relDir), { withFileTypes: true }).catch(() => []);
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => basename(entry.name, extension))
    .toSorted((a, b) => a.localeCompare(b));
}

/**
 * Reads the Codex layer from disk and projects the reviewer roster.
 */
async function readAgentRoster(repoRoot: string): Promise<AgentRosterEntry[]> {
  const configText = await readFile(join(repoRoot, CODEX_CONFIG_FILE), 'utf8');
  const adapterNames = await listNames(repoRoot, CODEX_ADAPTER_DIR, '.toml');
  const adapterTextByName = new Map<string, string>();
  for (const name of adapterNames) {
    adapterTextByName.set(
      name,
      await readFile(join(repoRoot, CODEX_ADAPTER_DIR, `${name}.toml`), 'utf8'),
    );
  }
  const templateTextByPath = new Map<string, string>();
  for (const adapterText of adapterTextByName.values()) {
    const templatePath = extractCanonicalPaths(readCodexDeveloperInstructions(adapterText)).find(
      (path) => path.startsWith(`${TEMPLATE_DIR}/`),
    );
    if (templatePath !== undefined && !templateTextByPath.has(templatePath)) {
      templateTextByPath.set(templatePath, await readFile(join(repoRoot, templatePath), 'utf8'));
    }
  }
  return buildAgentRoster(configText, adapterTextByName, templateTextByPath);
}

/** A single (target path, rendered content) generation unit. */
export interface GenerationUnit {
  readonly target: string;
  readonly content: string;
}

/** Computes every (target, content) pair the generator would write. */
export async function planGeneration(repoRoot: string): Promise<GenerationUnit[]> {
  const units: GenerationUnit[] = [];

  const roster = await readAgentRoster(repoRoot);
  for (const entry of roster) {
    for (const surface of ['cursor', 'claude'] as const) {
      units.push({
        target: agentTargetPath(repoRoot, entry.name, surface),
        content: renderAgentAdapter(entry, surface),
      });
    }
  }

  const ruleNames = await listNames(repoRoot, CANONICAL_RULES_DIR, '.md');
  for (const ruleName of ruleNames) {
    const ruleText = await readFile(join(repoRoot, CANONICAL_RULES_DIR, `${ruleName}.md`), 'utf8');
    units.push({
      target: cursorRuleTargetPath(repoRoot, ruleName),
      content: renderCursorRule(ruleName, deriveRuleDescription(ruleText)),
    });
  }

  return units;
}

export interface GenerateOutcome {
  readonly written: readonly string[];
}

/** Generates every adapter + cursor-rule surface, writing them to disk. */
export async function generateAdapters(repoRoot: string): Promise<GenerateOutcome> {
  const units = await planGeneration(repoRoot);
  const written: string[] = [];
  for (const unit of units) {
    await mkdir(dirname(unit.target), { recursive: true });
    await writeFile(unit.target, unit.content, 'utf8');
    written.push(unit.target);
  }
  return { written };
}

/** Removes the generated agent + cursor-rule surfaces before a fresh pass. */
export async function clearGeneratedAdapters(repoRoot: string): Promise<void> {
  for (const dir of [CURSOR_AGENTS_DIR, CLAUDE_AGENTS_DIR]) {
    await rm(join(repoRoot, dir), { recursive: true, force: true });
  }
  for (const ruleName of await listNames(repoRoot, CURSOR_RULES_DIR, '.mdc')) {
    await rm(cursorRuleTargetPath(repoRoot, ruleName), { force: true });
  }
}
