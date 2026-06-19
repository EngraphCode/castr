import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const TEMPLATE_DIR = '.agent/sub-agents/templates';
const ADAPTER_DIR = '.codex/agents';

const requiredFiles = [
  '.agent/sub-agents/README.md',
  '.agent/sub-agents/components/behaviours/subagent-identity.md',
  '.agent/sub-agents/components/behaviours/reading-discipline.md',
  '.agent/sub-agents/components/principles/dry-yagni.md',
  '.agent/rules/invoke-reviewers.md',
  '.codex/README.md',
  '.codex/config.toml',
];

const requiredTemplateSnippets = [
  'Read and apply `.agent/sub-agents/components/behaviours/reading-discipline.md`.',
  'Read and apply `.agent/sub-agents/components/behaviours/subagent-identity.md`.',
  'Read and apply `.agent/sub-agents/components/principles/dry-yagni.md`.',
];

const staleDocChecks = [
  {
    file: '.agent/directives/AGENT.md',
    banned: [
      'The full reviewer/sub-agent system is not yet fully installed',
      'planned infrastructure until the canonical layer is installed',
    ],
  },
  // The three `.agent/practice-context/outgoing/*.md` stale-doc checks were removed:
  // `.agent/practice-context/` was retired in Phase 1b (docs archived). A check that
  // requires retired content is itself stale — the correct fix is to remove the check,
  // NOT to re-track archived files just to turn the gate green.
];

const errors = [];

function repoPath(relativePath) {
  return path.join(root, relativePath);
}

function fileExists(relativePath) {
  return existsSync(repoPath(relativePath));
}

function read(relativePath) {
  return readFileSync(repoPath(relativePath), 'utf8');
}

function addError(message) {
  errors.push(message);
}

function ensure(condition, message) {
  if (!condition) {
    addError(message);
  }
}

function listToml(relDir) {
  return fileExists(relDir)
    ? readdirSync(repoPath(relDir))
        .filter((entry) => entry.endsWith('.toml'))
        .toSorted((a, b) => a.localeCompare(b))
    : [];
}

function listTemplateNames() {
  return fileExists(TEMPLATE_DIR)
    ? readdirSync(repoPath(TEMPLATE_DIR))
        .filter((entry) => entry.endsWith('.md'))
        .map((entry) => entry.slice(0, -'.md'.length))
        .toSorted((a, b) => a.localeCompare(b))
    : [];
}

for (const relativePath of requiredFiles) {
  ensure(fileExists(relativePath), `Missing required file: ${relativePath}`);
}

// --- Canonical templates (recomputed from disk, no hardcoded roster) -------
// Each template must compose the shared components and declare its own identity.
// The roster is whatever is on disk; adding a reviewer never requires editing a
// frozen list here (a hand-maintained expected-count is a drift detector that
// itself drifts — see the substrate-consumer magic-number removal, 2026-06-18).
const templateNames = listTemplateNames();
ensure(templateNames.length > 0, `No canonical templates found under ${TEMPLATE_DIR}`);

for (const name of templateNames) {
  const templatePath = `${TEMPLATE_DIR}/${name}.md`;
  const template = read(templatePath);

  for (const snippet of requiredTemplateSnippets) {
    ensure(
      template.includes(snippet),
      `Template missing required shared-component reference: ${templatePath} -> ${snippet}`,
    );
  }

  ensure(
    template.includes(`Name: ${name}`),
    `Template identity block must declare the agent name: ${templatePath}`,
  );

  ensure(
    !fileExists(`.agents/skills/${name}/SKILL.md`),
    `Reviewer/domain expert must not be installed as a skill: .agents/skills/${name}/SKILL.md`,
  );
}

ensure(!fileExists('.codex/skills'), 'Legacy Codex skills directory must not exist: .codex/skills');

// --- Codex adapter ↔ registration bijection (recomputed from disk) ----------
if (fileExists('.codex/config.toml')) {
  const config = read('.codex/config.toml');
  ensure(
    /\[features\][\s\S]*?multi_agent\s*=\s*true/m.test(config),
    'Missing `[features]` with `multi_agent = true` in .codex/config.toml',
  );

  // Parse every registration block as { name, configFile } from the config itself.
  const registrations = [
    ...config.matchAll(
      /\[agents\.(?:"([^"]+)"|([A-Za-z0-9_-]+))\][\s\S]*?config_file\s*=\s*"([^"]+)"/g,
    ),
  ].map((match) => ({ name: match[1] ?? match[2], configFile: match[3] }));

  ensure(registrations.length > 0, 'No agent registrations found in .codex/config.toml');

  const registeredConfigFiles = new Set(registrations.map((entry) => entry.configFile));
  const adapterFiles = listToml(ADAPTER_DIR);

  for (const { name, configFile } of registrations) {
    ensure(
      name === path.basename(configFile, '.toml'),
      `Registration name must match its adapter filename: "${name}" -> ${configFile}`,
    );

    ensure(fileExists(configFile), `Missing Codex agent adapter file: ${configFile}`);
    if (!fileExists(configFile)) {
      continue;
    }

    const adapter = read(configFile);
    ensure(
      /model_reasoning_effort\s*=\s*"high"/.test(adapter),
      `Codex adapter must use high reasoning effort: ${configFile}`,
    );
    ensure(
      /sandbox_mode\s*=\s*"read-only"/.test(adapter),
      `Codex adapter must use read-only sandbox: ${configFile}`,
    );
    ensure(
      /approval_policy\s*=\s*"never"/.test(adapter),
      `Codex adapter must set approval_policy = "never": ${configFile}`,
    );
    ensure(
      adapter.includes('This file is a thin Codex adapter.'),
      `Codex adapter must declare itself as a thin adapter: ${configFile}`,
    );
    // An adapter loads SOME canonical template. Persona adapters
    // (e.g. architecture-expert-barney) load a shared template (architecture-expert),
    // so the reference need not match the adapter's own name.
    ensure(
      templateNames.some((templateName) => adapter.includes(`${TEMPLATE_DIR}/${templateName}.md`)),
      `Codex adapter must point at a canonical template under ${TEMPLATE_DIR}: ${configFile}`,
    );
  }

  // Every adapter file on disk must be registered (no orphan adapters).
  for (const entry of adapterFiles) {
    const relativePath = `${ADAPTER_DIR}/${entry}`;
    ensure(
      registeredConfigFiles.has(relativePath),
      `Codex adapter not registered in .codex/config.toml: ${relativePath}`,
    );
  }
}

for (const check of staleDocChecks) {
  if (!fileExists(check.file)) {
    addError(`Missing documentation file checked by portability validator: ${check.file}`);
    continue;
  }

  const content = read(check.file);

  for (const bannedSnippet of check.banned) {
    ensure(
      !content.includes(bannedSnippet),
      `Stale Codex-model wording remains in ${check.file}: ${bannedSnippet}`,
    );
  }
}

if (fileExists(ADAPTER_DIR)) {
  const entries = readdirSync(repoPath(ADAPTER_DIR)).filter((entry) => entry.endsWith('.toml'));
  for (const entry of entries) {
    const fullPath = repoPath(path.join(ADAPTER_DIR, entry));
    ensure(
      statSync(fullPath).isFile(),
      `Codex agent adapter is not a file: ${ADAPTER_DIR}/${entry}`,
    );
  }
}

if (errors.length > 0) {
  console.error('Portability validation failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log(
  `Portability validation passed (${listTemplateNames().length} templates, ${listToml(ADAPTER_DIR).length} Codex adapters).`,
);
