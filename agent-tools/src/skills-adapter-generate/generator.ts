/**
 * Skills adapter generator.
 *
 * Reads canonical skills from `.agent/skills/<id>/SKILL-CANONICAL.md` (or
 * legacy `SKILL.md` during migration) and emits two adapter surfaces per
 * skill:
 *
 *   - `.claude/skills/<prefix><id>/SKILL.md`  — Claude Code adapter
 *   - `.agents/skills/<prefix><id>/SKILL.md`  — cross-tool stub (Codex, Cursor, Gemini)
 *
 * Adapters are stub pointers: their body links back to the canonical, which
 * remains the single source of truth for workflow content.
 */
import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';

const CANONICAL_FILENAME = 'SKILL-CANONICAL.md';
const ADAPTER_FILENAME = 'SKILL.md';

export interface GeneratorOptions {
  readonly repoRoot: string;
  readonly prefix: string;
}

export interface GenerateOutcome {
  readonly written: readonly string[];
  readonly skipped: readonly string[];
}

interface CanonicalFrontmatter {
  name: string;
  description: string;
}

interface AdapterFrontmatter {
  readonly name: string;
  readonly description: string;
}

interface ParsedCanonical {
  readonly id: string;
  readonly frontmatter: CanonicalFrontmatter;
  readonly canonicalPath: string;
  readonly canonicalFilename: string;
  /** POSIX-joined path of the skill directory relative to `.agent/skills/` (equals `id` for top-level skills). */
  readonly relativeDir: string;
}

/**
 * Discover, parse, and emit adapters for every canonical skill under
 * `.agent/skills/`. Idempotent — re-running yields byte-identical adapter
 * files when the canonicals are unchanged.
 */
export async function generateAdapters(options: GeneratorOptions): Promise<GenerateOutcome> {
  const written: string[] = [];
  const skipped: string[] = [];
  const canonicalsRoot = join(options.repoRoot, '.agent', 'skills');
  const discovered = await discoverCanonicals(canonicalsRoot, '', skipped);
  assertUniqueLeafIds(discovered);

  for (const parsed of discovered) {
    const claudeWritten = await emitAdapter(options, parsed, 'claude');
    const agentsWritten = await emitAdapter(options, parsed, 'agents');
    written.push(claudeWritten, agentsWritten);
  }

  return { written, skipped };
}

/**
 * Recursive canonical discovery. A directory holding `SKILL-CANONICAL.md`
 * is a skill (its leaf name is the adapter id); a directory without one is
 * a group and is descended into. A branch containing no skill at all, or a
 * canonical whose frontmatter fails to parse, lands in `skipped`.
 */
async function discoverCanonicals(
  canonicalsRoot: string,
  relativeDir: string,
  skipped: string[],
): Promise<readonly ParsedCanonical[]> {
  const found: ParsedCanonical[] = [];
  const absoluteDir = relativeDir === '' ? canonicalsRoot : join(canonicalsRoot, relativeDir);
  const dirents = await readdir(absoluteDir, { withFileTypes: true });

  for (const dirent of dirents) {
    if (!dirent.isDirectory()) {
      continue;
    }
    const childRelative = relativeDir === '' ? dirent.name : `${relativeDir}/${dirent.name}`;
    const canonicalPath = join(canonicalsRoot, childRelative, CANONICAL_FILENAME);
    if (await fileExists(canonicalPath)) {
      const text = await readFile(canonicalPath, 'utf8');
      const frontmatter = parseFrontmatter(text);
      if (frontmatter === undefined) {
        skipped.push(childRelative);
        continue;
      }
      found.push({
        id: dirent.name,
        relativeDir: childRelative,
        frontmatter,
        canonicalPath,
        canonicalFilename: CANONICAL_FILENAME,
      });
      continue;
    }
    const nested = await discoverCanonicals(canonicalsRoot, childRelative, skipped);
    if (nested.length === 0) {
      skipped.push(childRelative);
    } else {
      found.push(...nested);
    }
  }

  return found;
}

/**
 * Adapter names flatten to `<prefix><leaf-id>`, so leaf ids must be unique
 * across the whole tree; a collision silently overwriting an adapter would
 * be a wrong-skill dispatch, so fail loud instead.
 */
export function assertUniqueLeafIds(skills: readonly ParsedCanonical[]): void {
  const seen = new Map<string, string>();
  for (const skill of skills) {
    const existing = seen.get(skill.id);
    if (existing !== undefined) {
      throw new Error(
        `duplicate skill leaf id "${skill.id}" at "${existing}" and "${skill.relativeDir}" — ` +
          'adapter names flatten to the leaf id, so leaves must be unique across the tree',
      );
    }
    seen.set(skill.id, skill.relativeDir);
  }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    const info = await stat(path);
    return info.isFile();
  } catch {
    return false;
  }
}

/**
 * Parse the leading YAML frontmatter block from a markdown file body.
 * Returns undefined if the file lacks a valid frontmatter fence or omits
 * the required `name`/`description` fields. Extra YAML keys (e.g.
 * `classification`) are silently discarded so the returned value matches
 * the declared {@link CanonicalFrontmatter} shape exactly.
 */
export function parseFrontmatter(text: string): CanonicalFrontmatter | undefined {
  const fenceMatch = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text);
  if (fenceMatch === null) {
    return undefined;
  }
  const yamlBody = fenceMatch[1] ?? '';
  const parsed: unknown = parseYaml(yamlBody);
  if (!hasNameAndDescription(parsed)) {
    return undefined;
  }
  return { name: parsed.name, description: parsed.description };
}

function hasNameAndDescription(
  value: unknown,
): value is { readonly name: string; readonly description: string } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  if (!('name' in value) || !('description' in value)) {
    return false;
  }
  return typeof value.name === 'string' && typeof value.description === 'string';
}

export type AdapterSurface = 'claude' | 'agents';
export type ParsedCanonicalSkill = ParsedCanonical;

async function emitAdapter(
  options: GeneratorOptions,
  parsed: ParsedCanonical,
  surface: AdapterSurface,
): Promise<string> {
  const target = adapterTargetPath(options.repoRoot, options.prefix, parsed.id, surface);
  const fileContent = renderAdapter(parsed, options.prefix, surface);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, fileContent, 'utf8');
  return target;
}

export function renderAdapter(
  parsed: ParsedCanonicalSkill,
  prefix: string,
  surface: AdapterSurface,
): string {
  const frontmatter = buildAdapterFrontmatter(parsed.frontmatter, prefix, parsed.id);
  const surfaceLabel = surface === 'claude' ? 'Claude Code' : 'Cross-tool';
  const body = renderAdapterBody(parsed, surfaceLabel);
  const yamlBlock = stringifyYaml(frontmatter, { lineWidth: 0 }).trimEnd();
  return `---\n${yamlBlock}\n---\n\n${body.trimStart()}`;
}

export function adapterTargetPath(
  repoRoot: string,
  prefix: string,
  canonicalId: string,
  surface: AdapterSurface,
): string {
  const surfaceRoot = surface === 'claude' ? '.claude' : '.agents';
  return join(repoRoot, surfaceRoot, 'skills', `${prefix}${canonicalId}`, ADAPTER_FILENAME);
}

/**
 * Construct the adapter frontmatter from the canonical's frontmatter.
 * Always renames the skill: `<prefix><id>`. Description is preserved.
 */
export function buildAdapterFrontmatter(
  canonical: CanonicalFrontmatter,
  prefix: string,
  id: string,
): AdapterFrontmatter {
  return {
    name: `${prefix}${id}`,
    description: canonical.description,
  };
}

function renderAdapterBody(parsed: ParsedCanonicalSkill, surfaceLabel: string): string {
  const title = toTitleCase(parsed.id);
  return [
    `# ${title} (${surfaceLabel})`,
    '',
    `Read and follow \`.agent/skills/${parsed.relativeDir}/${parsed.canonicalFilename}\`.`,
    '',
  ].join('\n');
}

function toTitleCase(id: string): string {
  return id
    .split('-')
    .map((part) => (part.length === 0 ? part : `${part[0]?.toUpperCase() ?? ''}${part.slice(1)}`))
    .join(' ');
}

/**
 * Remove every adapter directory under `.claude/skills/` and `.agents/skills/`
 * before a fresh generation pass, so stale adapters don't outlive their
 * canonicals. Idempotent.
 */
export async function clearGeneratedAdapters(repoRoot: string): Promise<void> {
  for (const surface of ['.claude/skills', '.agents/skills']) {
    const root = join(repoRoot, surface);
    const dirents = await readdir(root, { withFileTypes: true }).catch(() => []);
    for (const dirent of dirents) {
      if (dirent.isDirectory()) {
        await rm(join(root, dirent.name), { recursive: true, force: true });
      }
    }
  }
}
