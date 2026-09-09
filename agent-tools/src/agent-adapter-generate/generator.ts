/**
 * Native cross-platform agent-adapter + cursor-rule generator.
 *
 * Emits the platform adapter surfaces that the portability and subagents
 * validators require, validating the Codex source contract before projection:
 *
 *   - `.cursor/agents/<name>.md`  — Cursor reviewer wrapper
 *   - `.claude/agents/<name>.md`  — Claude Code reviewer wrapper
 *   - `.cursor/rules/<name>.mdc`  — Cursor rule trigger (one per canonical rule)
 *
 * The reviewer roster is projected from the Codex layer — `.codex/config.toml`
 * (names + descriptions) and each `.codex/agents/<name>.toml`
 * (`developer_instructions` template + persona references). The Codex adapters
 * remain the hand-authored source of truth; this generator never writes them.
 * A complete three-seat Codex Cricket panel expands to four Claude/Cursor seats
 * according to the shared platform contract.
 * Cursor rule triggers are projected from the canonical `.agent/rules/*.md`.
 *
 * Pure render/derive functions are exported so the drift checker and unit
 * tests can exercise them without filesystem I/O.
 */
import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { stringify } from 'yaml';
import {
  CRICKET_ROLES,
  completeReviewerNames,
  cricketRole,
  supportsReviewer,
  type CricketRoleContract,
} from '../core/reviewer-adapter-platform-contract.js';

import {
  parseCodexRegistrations,
  getCodexAdapterValidation,
  getCodexRegistrationValidation,
  extractCanonicalPaths,
  readCodexDeveloperInstructions,
  resolveCodexConfigFilePath,
} from '../validators/subagents/validate-subagents-helpers.js';
import { inspectGeneratedEstate } from './generated-estate.js';
import {
  isCanonicalAgentReferenceInside,
  readCanonicalAgentFile,
} from '../core/canonical-agent-reference.js';

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

/** A reviewer roster entry projected from the Codex adapter layer. */
export interface AgentRosterEntry {
  readonly name: string;
  readonly description: string;
  /** Canonical template path, e.g. `.agent/sub-agents/templates/code-reviewer.md`. */
  readonly templatePath: string;
  /** Persona component path for persona-expanded adapters, if any. */
  readonly personaPath?: string;
}

export type AgentSurface = 'cursor' | 'claude';

/**
 * Validates and projects the reviewer roster from Codex source strings without
 * filesystem access. Every adapter must match its registration, declared
 * identity, safety settings and platform-specific model/effort/method contract.
 * Installing any Cricket seat requires the complete supported Codex trio.
 *
 * @param configText - Full text of `.codex/config.toml`.
 * @param adapterTextByName - Map of agent name to its `.codex/agents/<name>.toml` text.
 * @returns Roster entries sorted by agent name.
 * @throws If the source TOML or registration mapping is invalid, an adapter
 *   violates its contract, it references other than one canonical template,
 *   or the supported Cricket roster is incomplete.
 */
export function buildAgentRoster(
  configText: string,
  adapterTextByName: ReadonlyMap<string, string>,
): AgentRosterEntry[] {
  const registrations = parseCodexRegistrations(configText);
  const adapterNames = [...adapterTextByName.keys()];
  const adapterPaths = new Set(adapterNames.map((name) => `${CODEX_ADAPTER_DIR}/${name}.toml`));
  const registrationValidation = getCodexRegistrationValidation({
    registrations,
    fileExists: (path) => adapterPaths.has(path),
  });
  if (registrationValidation.issues.length > 0) {
    throw new Error(registrationValidation.issues.join('\n'));
  }
  for (const registration of registrations) {
    const adapterPath = resolveCodexConfigFilePath(registration.configFile);
    const expectedPath = `${CODEX_ADAPTER_DIR}/${registration.name}.toml`;
    if (adapterPath !== expectedPath) {
      throw new Error(
        `${CODEX_CONFIG_FILE}: resolves "${registration.name}" to ${adapterPath}; expected ${expectedPath}`,
      );
    }
  }

  const entries: AgentRosterEntry[] = [];
  for (const [name, content] of [...adapterTextByName].toSorted(([a], [b]) => a.localeCompare(b))) {
    const registeredAgent = registrationValidation.registrationsByName.get(name);
    if (registeredAgent === undefined) {
      throw new Error(`${name}: no matching agent registration in ${CODEX_CONFIG_FILE}`);
    }
    const validation = getCodexAdapterValidation({
      codexAdapterFile: `${CODEX_ADAPTER_DIR}/${name}.toml`,
      content,
      registeredAgent,
    });
    if (validation.issues.length > 0) {
      throw new Error(validation.issues.join('\n'));
    }
    const [templatePath] = validation.templatePaths;
    if (validation.templatePaths.length !== 1 || templatePath === undefined) {
      throw new Error(
        `${CODEX_ADAPTER_DIR}/${name}.toml: must reference exactly one canonical template under ${TEMPLATE_DIR}`,
      );
    }
    const personaPath = validation.canonicalPaths.find((path) =>
      isCanonicalAgentReferenceInside(path, PERSONA_DIR),
    );

    entries.push({
      name,
      description: registeredAgent.description,
      templatePath,
      ...(personaPath === undefined ? {} : { personaPath }),
    });
  }
  const missingRoles = completeReviewerNames(adapterNames).filter(
    (name) => supportsReviewer(name, 'codex') && !adapterTextByName.has(name),
  );
  if (missingRoles.length > 0) {
    throw new Error(
      `${CODEX_CONFIG_FILE}: missing supported Codex Cricket roles: ${missingRoles.join(', ')}`,
    );
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

/** Preserve string meaning and continuation indentation within a YAML mapping. */
function yamlStringField(field: 'name' | 'description', value: string): string {
  // The surrounding frontmatter adds the terminating newline; retain all value whitespace.
  return stringify({ [field]: value }, { singleQuote: true, lineWidth: 0 }).slice(0, -1);
}

function renderAgentFrontmatter(
  entry: AgentRosterEntry,
  surface: AgentSurface,
  role: CricketRoleContract | undefined,
): string[] {
  if (surface === 'cursor') {
    return [
      yamlStringField('name', entry.name),
      ...(role === undefined ? [`model: ${CURSOR_AGENT_MODEL}`] : []),
      yamlStringField('description', entry.description),
      'readonly: true',
    ];
  }
  return [
    yamlStringField('name', entry.name),
    yamlStringField('description', entry.description),
    `model: ${role?.claudeModel ?? CLAUDE_AGENT_MODEL}`,
    ...(role === undefined
      ? [
          'tools: Read, Grep, Glob, Bash, WebFetch, WebSearch',
          'disallowedTools: Write, Edit, NotebookEdit',
        ]
      : [
          `effort: ${role.effort}`,
          'tools: Read',
          'disallowedTools: Write, Edit, Bash, Grep, Glob',
        ]),
    'permissionMode: plan',
  ];
}

/**
 * Renders a Cursor or Claude reviewer adapter for a roster entry. The output is
 * deterministic and idempotent. The template-load line uses the exact phrasing
 * the subagents validator requires.
 */
export function renderAgentAdapter(entry: AgentRosterEntry, surface: AgentSurface): string {
  const role = cricketRole(entry.name);
  const frontmatter = renderAgentFrontmatter(entry, surface, role);
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
    ...(surface === 'claude' && role !== undefined
      ? [
          'Reading-discipline grounding is waived for this bounded panel; retain the template identity requirements.',
          '',
        ]
      : []),
    `Your first action MUST be to read and internalise \`${entry.templatePath}\`.`,
    '',
    'Review or recommend; do not modify code. The calling agent executes any changes you propose.',
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
    yamlStringField('description', description),
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

/** Lists files in a required source directory; filesystem failures propagate. */
async function listNames(repoRoot: string, relDir: string, extension: string): Promise<string[]> {
  const entries = await readdir(join(repoRoot, relDir), { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => basename(entry.name, extension))
    .toSorted((a, b) => a.localeCompare(b));
}

/**
 * Reads the Codex layer and delegates to the same pure generation boundary
 * consumed by callers with in-memory sources.
 */
async function readAgentGeneration(repoRoot: string): Promise<GenerationUnit[]> {
  const configText = await readFile(join(repoRoot, CODEX_CONFIG_FILE), 'utf8');
  const adapterNames = await listNames(repoRoot, CODEX_ADAPTER_DIR, '.toml');
  const adapterTextByName = new Map<string, string>();
  for (const name of adapterNames) {
    adapterTextByName.set(
      name,
      await readFile(join(repoRoot, CODEX_ADAPTER_DIR, `${name}.toml`), 'utf8'),
    );
  }
  const units = planAgentAdapters(repoRoot, configText, adapterTextByName);
  const canonicalPaths = new Set(
    [...adapterTextByName.values()].flatMap((content) =>
      extractCanonicalPaths(readCodexDeveloperInstructions(content)),
    ),
  );
  for (const path of canonicalPaths) {
    await readCanonicalAgentFile(repoRoot, path);
  }
  return units;
}

/** A single (target path, rendered content) generation unit. */
export interface GenerationUnit {
  readonly target: string;
  readonly content: string;
}

/**
 * Computes Cursor and Claude adapter targets and contents from Codex sources
 * without reading or writing files. The same validated boundary drives
 * {@link planGeneration}; the complete Codex Cricket trio produces each
 * platform's quartet, including the Claude/Cursor-only high judgement seat.
 *
 * @param repoRoot - Repository root used to resolve generated target paths.
 * @param configText - Full text of `.codex/config.toml`.
 * @param adapterTextByName - Codex adapter contents keyed by filename without `.toml`.
 * @returns Deterministic target/content pairs for both Markdown platforms.
 * @throws If {@link buildAgentRoster} rejects any Codex source or roster constraint.
 */
export function planAgentAdapters(
  repoRoot: string,
  configText: string,
  adapterTextByName: ReadonlyMap<string, string>,
): GenerationUnit[] {
  const units: GenerationUnit[] = [];
  const roster = buildAgentRoster(configText, adapterTextByName);
  const extraRoles = roster.some((entry) => cricketRole(entry.name) !== undefined)
    ? CRICKET_ROLES.filter((role) => role.codexModel === null).map((role) => ({
        name: role.name,
        templatePath: role.templatePath,
        description: 'Cricket judgement conscience check — high effort.',
      }))
    : [];
  for (const entry of [...roster, ...extraRoles]) {
    for (const surface of ['cursor', 'claude'] as const) {
      units.push({
        target: agentTargetPath(repoRoot, entry.name, surface),
        content: renderAgentAdapter(entry, surface),
      });
    }
  }
  return units;
}

/**
 * Computes every validated adapter and canonical-rule target/content pair.
 * Required source directories and every referenced canonical file must be readable
 * before this plan can be written or used to clear existing outputs.
 */
export async function planGeneration(repoRoot: string): Promise<GenerationUnit[]> {
  const units = await readAgentGeneration(repoRoot);
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

/**
 * Validates all sources before changing any generated adapter or Cursor rule.
 * When clearing is requested, removes the previous outputs only after the full
 * generation plan has passed validation, then writes that same plan.
 *
 * @param repoRoot - Repository root containing Codex sources and canonical rules.
 * @param options - Whether to clear generated surfaces before writing validated outputs.
 * @returns Paths written from the validated generation plan.
 * @throws If a source contract or existing output estate is invalid, or a filesystem operation fails.
 * @remarks Generated paths must not be concurrently replaced between output
 * inspection and writing; generation does not lock the filesystem.
 */
export async function generateAdapters(
  repoRoot: string,
  { clear = false }: { readonly clear?: boolean } = {},
): Promise<GenerateOutcome> {
  const root = resolve(repoRoot);
  const units = await planGeneration(root);
  const generatedPaths = await inspectGeneratedEstate(
    root,
    units.map((unit) => unit.target),
  );
  if (clear) {
    await clearGeneratedAdapters(root, generatedPaths);
  }
  const written: string[] = [];
  for (const unit of units) {
    await mkdir(dirname(unit.target), { recursive: true });
    await writeFile(unit.target, unit.content, 'utf8');
    written.push(unit.target);
  }
  return { written };
}

/**
 * Removes the generated estate only for an explicit clear request, after source validation.
 * Cursor rule cleanup follows the checker's recursive `.mdc` estate and preserves
 * other documents and directories under `.cursor/rules`.
 */
async function clearGeneratedAdapters(
  repoRoot: string,
  generatedPaths: readonly string[],
): Promise<void> {
  for (const dir of [CURSOR_AGENTS_DIR, CLAUDE_AGENTS_DIR]) {
    await rm(join(repoRoot, dir), { recursive: true, force: true });
  }
  for (const rulePath of generatedPaths.filter((path) => path.endsWith('.mdc'))) {
    await rm(rulePath, { force: true });
  }
}
