/** Platform-specific Cricket bindings; ordinary reviewers retain their default contract. */
export interface CricketRoleContract {
  readonly name: string;
  readonly templatePath: string;
  readonly effort: string;
  readonly claudeModel: string;
  readonly codexModel: string | null;
}

/** The deliberately asymmetric panel specified by the canonical Cricket skill. */
export const CRICKET_ROLES: readonly CricketRoleContract[] = [
  {
    name: 'cricket-judgement-low',
    templatePath: '.agent/sub-agents/templates/cricket-judgement.md',
    effort: 'low',
    claudeModel: 'fable',
    codexModel: 'gpt-5.6-sol',
  },
  {
    name: 'cricket-judgement-medium',
    templatePath: '.agent/sub-agents/templates/cricket-judgement.md',
    effort: 'medium',
    claudeModel: 'opus',
    codexModel: 'gpt-5.6-terra',
  },
  {
    name: 'cricket-judgement-high',
    templatePath: '.agent/sub-agents/templates/cricket-judgement.md',
    effort: 'high',
    claudeModel: 'sonnet',
    codexModel: null,
  },
  {
    name: 'cricket-procedure-xhigh',
    templatePath: '.agent/sub-agents/templates/cricket-procedure.md',
    effort: 'xhigh',
    claudeModel: 'haiku',
    codexModel: 'gpt-5.6-luna',
  },
];

/**
 * Resolve an exact stable role name; similarly named reviewers get no exemption.
 * @param name - Candidate registered reviewer name.
 * @returns The explicit Cricket contract, or undefined for an ordinary reviewer.
 */
export function cricketRole(name: string): CricketRoleContract | undefined {
  return CRICKET_ROLES.find((role) => role.name === name);
}

/**
 * Expand any installed Cricket member to the complete cross-platform quartet.
 * @param names - Existing reviewer names, including ordinary reviewers.
 * @returns Unique, sorted names; callers filter with {@link supportsReviewer}
 * before comparing a platform's supported estate. Empty input stays empty.
 */
export function completeReviewerNames(names: readonly string[]): string[] {
  const cricketInstalled = names.some((name) => cricketRole(name) !== undefined);
  return [
    ...new Set([...names, ...(cricketInstalled ? CRICKET_ROLES.map((role) => role.name) : [])]),
  ].toSorted((a, b) => a.localeCompare(b));
}

/**
 * Determine whether a named reviewer belongs on the requested platform.
 * @param name - Stable reviewer name; ordinary reviewers are supported everywhere.
 * @param platform - Harness whose roster is being projected or validated.
 * @returns False only for Codex's deliberately unsupported high-judgement seat.
 */
export function supportsReviewer(name: string, platform: 'codex' | 'claude' | 'cursor'): boolean {
  return platform !== 'codex' || cricketRole(name)?.codexModel !== null;
}
