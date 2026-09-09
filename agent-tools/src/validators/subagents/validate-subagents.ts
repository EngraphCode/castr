#!/usr/bin/env node

import fs from 'node:fs/promises';
import path from 'node:path';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { readCanonicalAgentFile } from '../../core/canonical-agent-reference.js';
import { validateMarkdownWrapper, type SubagentPlatform } from './frontmatter-schema.js';

import {
  CODEX_CONFIG_PATH,
  type CodexRegistration,
  getCodexAdapterValidation,
  getCodexRegistrationValidation,
  parseCodexRegistrations,
} from './validate-subagents-helpers.js';

const repoRoot = resolveRepoRoot(import.meta.url);

const CURSOR_WRAPPER_DIR = '.cursor/agents';
const CLAUDE_WRAPPER_DIR = '.claude/agents';
const CODEX_ADAPTER_DIR = '.codex/agents';
const TEMPLATE_DIR = '.agent/sub-agents/templates';
const IDENTITY_COMPONENT_PATH = '.agent/sub-agents/components/behaviours/subagent-identity.md';

const REQUIRED_IDENTITY_LINE = `Read and apply \`${IDENTITY_COMPONENT_PATH}\`.`;

/** Read a file relative to the repo root as a UTF-8 string. */
async function readText(relPath: string): Promise<string> {
  const filePath = path.join(repoRoot, relPath);
  return fs.readFile(filePath, 'utf8');
}

/** Check whether a file relative to the repo root exists. */
async function exists(relPath: string): Promise<boolean> {
  try {
    await fs.access(path.join(repoRoot, relPath));
    return true;
  } catch {
    return false;
  }
}

async function validateCanonicalReference(owner: string, relPath: string): Promise<void> {
  try {
    await readCanonicalAgentFile(repoRoot, relPath);
  } catch (error) {
    addIssue(`${owner}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/** List markdown files in a directory relative to the repo root. */
async function listMarkdownFiles(relDir: string): Promise<string[]> {
  return listFiles(relDir, '.md');
}

/** List files with a given extension in a directory relative to the repo root. */
async function listFiles(relDir: string, extension: string): Promise<string[]> {
  const absDir = path.join(repoRoot, relDir);
  const entries = await fs.readdir(absDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(extension))
    .map((entry) => `${relDir}/${entry.name}`)
    .toSorted((a, b) => a.localeCompare(b));
}

const issues: string[] = [];

function addIssue(message: string): void {
  issues.push(message);
}

if (!(await exists(IDENTITY_COMPONENT_PATH))) {
  addIssue(`Missing required shared component: ${IDENTITY_COMPONENT_PATH}`);
}

const wrapperFiles = await listMarkdownFiles(CURSOR_WRAPPER_DIR);
const claudeWrapperFiles = await listMarkdownFiles(CLAUDE_WRAPPER_DIR);
const codexAdapterFiles = await listFiles(CODEX_ADAPTER_DIR, '.toml');
const templateFiles = await listMarkdownFiles(TEMPLATE_DIR);
const cursorReferencedTemplates = new Set<string>();
const claudeReferencedTemplates = new Set<string>();
const codexReferencedTemplates = new Set<string>();
const codexRegistrationsByName = new Map<string, CodexRegistration>();

async function validateWrappers(
  platform: SubagentPlatform,
  files: string[],
  referencedTemplates: Set<string>,
): Promise<void> {
  for (const file of files) {
    const result = validateMarkdownWrapper(platform, file, await readText(file));
    for (const issue of result.issues) addIssue(issue);
    for (const templatePath of result.templatePaths) {
      referencedTemplates.add(templatePath);
      await validateCanonicalReference(file, templatePath);
    }
  }
}

await validateWrappers('claude', claudeWrapperFiles, claudeReferencedTemplates);
await validateWrappers('cursor', wrapperFiles, cursorReferencedTemplates);

if (await exists(CODEX_CONFIG_PATH)) {
  const codexRegistrations = parseCodexRegistrations(await readText(CODEX_CONFIG_PATH));
  const { issues: registrationIssues, registrationsByName: resolvedRegistrationsByName } =
    getCodexRegistrationValidation({
      registrations: codexRegistrations,
      configPath: CODEX_CONFIG_PATH,
      fileExists: (relPath: string) => codexAdapterFiles.includes(relPath),
    });
  for (const issue of registrationIssues) {
    addIssue(issue);
  }
  for (const [agentName, registration] of resolvedRegistrationsByName.entries()) {
    codexRegistrationsByName.set(agentName, registration);
  }
} else {
  addIssue(`Missing Codex project-agent registry: ${CODEX_CONFIG_PATH}`);
}

for (const codexAdapterFile of codexAdapterFiles) {
  const content = await readText(codexAdapterFile);
  const adapterBasename = path.basename(codexAdapterFile, '.toml');
  const registeredAgent = codexRegistrationsByName.get(adapterBasename) ?? null;
  const {
    issues: codexAdapterIssues,
    templatePaths,
    canonicalPaths,
  } = getCodexAdapterValidation({
    codexAdapterFile,
    content,
    registeredAgent,
    templateDir: TEMPLATE_DIR,
  });
  for (const issue of codexAdapterIssues) {
    addIssue(issue);
  }
  for (const canonicalPath of canonicalPaths) {
    await validateCanonicalReference(codexAdapterFile, canonicalPath);
  }
  for (const templatePath of templatePaths) {
    codexReferencedTemplates.add(templatePath);
  }
}

for (const templateFile of templateFiles) {
  const content = await readText(templateFile);

  if (
    !content.includes(
      'Read and apply `.agent/sub-agents/components/behaviours/reading-discipline.md`.',
    )
  ) {
    addIssue(`${templateFile}: missing reading-discipline component reference`);
  }

  if (!content.includes(REQUIRED_IDENTITY_LINE)) {
    addIssue(
      `${templateFile}: missing required identity component reference (${IDENTITY_COMPONENT_PATH})`,
    );
  }

  if (!cursorReferencedTemplates.has(templateFile)) {
    addIssue(
      `${templateFile}: no wrapper in ${CURSOR_WRAPPER_DIR} currently references this template`,
    );
  }

  if (!claudeReferencedTemplates.has(templateFile)) {
    addIssue(
      `${templateFile}: no wrapper in ${CLAUDE_WRAPPER_DIR} currently references this template`,
    );
  }

  if (!codexReferencedTemplates.has(templateFile)) {
    addIssue(
      `${templateFile}: no adapter in ${CODEX_ADAPTER_DIR} currently references this template`,
    );
  }
}

if (issues.length > 0) {
  process.stderr.write(
    `Sub-agent standards validation failed (${issues.length} issue${issues.length === 1 ? '' : 's'}):\n`,
  );
  for (const issue of issues) {
    process.stderr.write(`- ${issue}\n`);
  }
  process.exit(1);
}

process.stdout.write(
  `Sub-agent standards validation passed: ${claudeWrapperFiles.length} Claude wrappers, ${wrapperFiles.length} Cursor wrappers, ${codexAdapterFiles.length} Codex adapters, and ${templateFiles.length} template files are compliant.\n`,
);
