/**
 * The outcome a standalone repository validator's pure helpers hand to its shell: the exit
 * code and the lines to print. Shared by every validator that separates its rules from its IO
 * (corpus provenance, machine-local paths, specification approval); lifted when the third
 * copy was about to be written (`consolidate-at-second-consumer`).
 *
 * @packageDocumentation
 */

/** Exit 0: the check holds. Exit 1: it does not. Exit 2: the input cannot be read. */
export interface ValidatorOutcome {
  readonly exitCode: 0 | 1 | 2;
  readonly stdout: readonly string[];
  readonly stderr: readonly string[];
}
