#!/usr/bin/env node

import path from 'node:path';

import { resolveRepoRoot } from '../../core/repo-root.js';
import { readCanonicalAgentFile } from '../../core/canonical-agent-reference.js';
import {
  listRequiredRepositorySources,
  readRequiredRepositorySource,
} from '../../core/required-repository-source.js';
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
  return listRequiredRepositorySources(repoRoot, relDir, extension);
}

const issues: string[] = [];

function addIssue(message: string): void {
  issues.push(message);
}

try {
  await readRequiredRepositorySource(repoRoot, IDENTITY_COMPONENT_PATH);
} catch (error) {
  addIssue(error instanceof Error ? error.message : String(error));
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
    const result = validateMarkdownWrapper(
      platform,
      file,
      await readRequiredRepositorySource(repoRoot, file),
    );
    for (const issue of result.issues) addIssue(issue);
    for (const templatePath of result.templatePaths) {
      referencedTemplates.add(templatePath);
      await validateCanonicalReference(file, templatePath);
    }
  }
}

await validateWrappers('claude', claudeWrapperFiles, claudeReferencedTemplates);
await validateWrappers('cursor', wrapperFiles, cursorReferencedTemplates);

let codexConfigText: string | null = null;
try {
  codexConfigText = await readRequiredRepositorySource(repoRoot, CODEX_CONFIG_PATH);
} catch (error) {
  addIssue(error instanceof Error ? error.message : String(error));
}
if (codexConfigText !== null) {
  const codexRegistrations = parseCodexRegistrations(codexConfigText);
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
}

for (const codexAdapterFile of codexAdapterFiles) {
  const content = await readRequiredRepositorySource(repoRoot, codexAdapterFile);
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
  let content: string;
  try {
    content = await readCanonicalAgentFile(repoRoot, templateFile);
  } catch (error) {
    addIssue(`${templateFile}: ${error instanceof Error ? error.message : String(error)}`);
    continue;
  }

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
