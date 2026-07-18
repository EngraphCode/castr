/**
 * Class-aware compliance checks for sub-agent templates and their Codex
 * adapters.
 *
 * The sub-agent estate has two classes. A reviewer template must reference the
 * full reading-discipline component (which mandates reading the repository's
 * engineering doctrine — `AGENT.md`, `principles.md`). A lean worker template
 * must instead reference the worker-reading-discipline component: a worker
 * carries a decision-complete brief and must NOT load that doctrine, which would
 * defeat the minimum-context purpose that makes it lean.
 *
 * All logic is I/O-free — callers supply content as strings.
 */

import type { AgentClass } from '../../agent-adapter-generate/agent-projection.js';

/** The two sub-agent classes the estate recognises. */
export type SubagentClass = AgentClass;

/** Reading-discipline component required of reviewer-class templates. */
export const REVIEWER_READING_DISCIPLINE_COMPONENT =
  '.agent/sub-agents/components/behaviours/reading-discipline.md';

/** Lean reading-discipline component required of worker-class templates. */
export const WORKER_READING_DISCIPLINE_COMPONENT =
  '.agent/sub-agents/components/behaviours/worker-reading-discipline.md';

/** The sole canonical template an adapter references, with any ambiguous extras. */
export interface SoleTemplatePath {
  readonly templatePath: string | undefined;
  readonly extras: readonly string[];
}

/**
 * Select the SOLE canonical template from an adapter's referenced paths. An
 * adapter that references more than one template is ambiguous: because
 * canonical paths arrive sorted, a silent `find` would pick a class
 * lexicographically rather than intentionally, and that class would then govern
 * every referenced template. The extras are surfaced so callers fail loudly —
 * the validator as an issue, the generator as a thrown error.
 */
export function soleTemplatePath(
  canonicalPaths: readonly string[],
  templateDir: string,
): SoleTemplatePath {
  const matches = canonicalPaths.filter((path) => path.startsWith(`${templateDir}/`));
  return { templatePath: matches[0], extras: matches.slice(1) };
}

/** The reading-discipline component a template of the given class must reference. */
export function requiredReadingDisciplineComponent(agentClass: SubagentClass): string {
  return agentClass === 'worker'
    ? WORKER_READING_DISCIPLINE_COMPONENT
    : REVIEWER_READING_DISCIPLINE_COMPONENT;
}

/**
 * Issues for a template that does not reference the reading-discipline component
 * its class requires. A reviewer must reference the full discipline; a worker
 * must reference the lean one (and must not carry the full one, which would load
 * the doctrine a worker is designed to omit).
 */
export function getReadingDisciplineIssues(
  templateFile: string,
  content: string,
  agentClass: SubagentClass,
): string[] {
  const issues: string[] = [];
  const component = requiredReadingDisciplineComponent(agentClass);
  if (!content.includes(`Read and apply \`${component}\`.`)) {
    const label = agentClass === 'worker' ? 'worker-reading-discipline' : 'reading-discipline';
    issues.push(`${templateFile}: missing ${label} component reference (${component})`);
  }
  // A worker must not ALSO reference the full reviewer reading-discipline: that
  // component mandates reading the engineering doctrine (`AGENT.md`,
  // `principles.md`), defeating the minimum-context leanness that defines the
  // worker class. The reviewer path is not a substring of the worker path (the
  // `worker-` prefix differs), so this presence check is unambiguous.
  if (
    agentClass === 'worker' &&
    content.includes(`Read and apply \`${REVIEWER_READING_DISCIPLINE_COMPONENT}\`.`)
  ) {
    issues.push(
      `${templateFile}: worker template must not reference the reviewer reading-discipline (${REVIEWER_READING_DISCIPLINE_COMPONENT}) — it loads the doctrine a worker is designed to omit`,
    );
  }
  return issues;
}
