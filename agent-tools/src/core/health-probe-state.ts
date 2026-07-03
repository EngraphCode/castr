import { countPracticeBoxFiles } from './health-probe-shared.js';
import { evaluateContinuityContractFreshness } from './health-probe-continuity-state.js';
import {
  evaluateHookPolicySpineCoherence,
  evaluatePracticeBoxState,
} from './health-probe-hook-state.js';
import type { HealthCheckResult } from './health-probe-types.js';

export function evaluateStateChecks(repoRoot: string, now: Date): readonly HealthCheckResult[] {
  const practiceBoxFileCount = countPracticeBoxFiles(repoRoot);

  return [
    evaluateHookPolicySpineCoherence(repoRoot),
    evaluatePracticeBoxState(practiceBoxFileCount),
    evaluateContinuityContractFreshness(repoRoot, now),
  ];
}
