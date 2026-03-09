import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const root = process.cwd();

const expectedAgents = [
  'code-reviewer',
  'test-reviewer',
  'type-reviewer',
  'openapi-expert',
  'zod-expert',
  'json-schema-expert',
];

const requiredFiles = [
  '.agent/sub-agents/README.md',
  '.agent/sub-agents/components/behaviours/subagent-identity.md',
  '.agent/sub-agents/components/behaviours/reading-discipline.md',
  '.agent/sub-agents/components/principles/dry-yagni.md',
  '.agent/rules/invoke-reviewers.md',
  '.codex/README.md',
  '.codex/config.toml',
];

const staleDocChecks = [
  {
    file: '.agent/directives/AGENT.md',
    banned: [
      'The full reviewer/sub-agent system is not yet fully installed',
      'planned infrastructure until the canonical layer is installed',
    ],
  },
  {
    file: '.agent/practice-context/outgoing/platform-adapter-reference.md',
    banned: [
      '| OpenAI Codex          | (via skills)          | (via skills)          | `.agents/skills/*/SKILL.md` |',
      'Codex does not currently have a subagent system equivalent',
      'Reviewers can be invoked as commands that load',
      '| Agent/Reviewer | `.claude/agents/{name}.md`      | `.cursor/agents/{name}.md`      | `.gemini/commands/review-{name}.toml` | (via skills)                        |',
    ],
  },
  {
    file: '.agent/practice-context/outgoing/reviewer-system-guide.md',
    banned: [
      '└─→ (future platforms)   └─→ .agents/skills/ (Codex)',
      '**Codex** — Uses SKILL.md format or is invoked via the Agent tool',
    ],
  },
  {
    file: '.agent/practice-context/outgoing/castr-practice-integration-notes.md',
    banned: ['- full reviewer/sub-agent roster installation'],
  },
];

const errors = [];
const requiredTemplateSnippets = [
  'Read and apply `.agent/sub-agents/components/behaviours/reading-discipline.md`.',
  'Read and apply `.agent/sub-agents/components/behaviours/subagent-identity.md`.',
  'Read and apply `.agent/sub-agents/components/principles/dry-yagni.md`.',
];

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

for (const relativePath of requiredFiles) {
  ensure(fileExists(relativePath), `Missing required file: ${relativePath}`);
}

for (const agent of expectedAgents) {
  const templatePath = `.agent/sub-agents/templates/${agent}.md`;
  ensure(fileExists(templatePath), `Missing canonical template: ${templatePath}`);

  if (fileExists(templatePath)) {
    const template = read(templatePath);

    for (const snippet of requiredTemplateSnippets) {
      ensure(template.includes(snippet), `Template missing required shared-component reference: ${templatePath} -> ${snippet}`);
    }

    ensure(template.includes(`Name: ${agent}`), `Template identity block must declare the agent name: ${templatePath}`);
  }
}

ensure(!fileExists('.codex/skills'), 'Legacy Codex skills directory must not exist: .codex/skills');

for (const agent of expectedAgents) {
  ensure(
    !fileExists(`.agents/skills/${agent}/SKILL.md`),
    `Reviewer/domain expert must not be installed as a skill: .agents/skills/${agent}/SKILL.md`,
  );
}

if (fileExists('.codex/config.toml')) {
  const config = read('.codex/config.toml');
  ensure(
    /\[features\][\s\S]*?multi_agent\s*=\s*true/m.test(config),
    'Missing `[features]` with `multi_agent = true` in .codex/config.toml',
  );

  const registeredAgents = [
    ...config.matchAll(/\[agents\.(?:"([^"]+)"|([A-Za-z0-9_-]+))\]/g),
  ].map((match) => match[1] ?? match[2]);

  for (const agent of expectedAgents) {
    ensure(
      registeredAgents.includes(agent),
      `Missing agent registration in .codex/config.toml: ${agent}`,
    );

    const blockPattern = new RegExp(
      `\\[agents\\.(?:"${agent}"|${agent.replace(/-/g, '\\-')})\\][\\s\\S]*?config_file\\s*=\\s*"([^"]+)"`,
      'm',
    );
    const blockMatch = config.match(blockPattern);

    ensure(!!blockMatch, `Missing config_file for agent in .codex/config.toml: ${agent}`);

    if (blockMatch) {
      const configFile = blockMatch[1];
      ensure(fileExists(configFile), `Missing Codex agent adapter file: ${configFile}`);

      if (fileExists(configFile)) {
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
          adapter.includes(`.agent/sub-agents/templates/${agent}.md`),
          `Codex adapter must point at canonical template: ${configFile}`,
        );
        ensure(
          adapter.includes('This file is a thin Codex adapter.'),
          `Codex adapter must declare itself as a thin adapter: ${configFile}`,
        );
      }
    }
  }

  ensure(
    registeredAgents.length === expectedAgents.length,
    `Unexpected number of registered agents in .codex/config.toml: expected ${expectedAgents.length}, found ${registeredAgents.length}`,
  );
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

if (fileExists('.codex/agents')) {
  const entries = readdirSync(repoPath('.codex/agents')).filter((entry) => entry.endsWith('.toml'));
  for (const entry of entries) {
    const fullPath = repoPath(path.join('.codex/agents', entry));
    ensure(statSync(fullPath).isFile(), `Codex agent adapter is not a file: .codex/agents/${entry}`);
  }
}

if (errors.length > 0) {
  console.error('Portability validation failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Portability validation passed.');
