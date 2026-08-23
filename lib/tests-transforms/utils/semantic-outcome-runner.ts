/**
 * Artifact-agnostic semantic-outcome runner.
 *
 * Extracted from PR #11's OpenAPI-specific fidelity harness
 * (`fix/remediation-la-harness-test-truth`) per the proof-programme report's
 * disposition for that branch: preserve its outcome-record and non-vacuity
 * concepts, but replace the OpenAPI/`CastrDocument`-specific runner with
 * injected cases and independent source/target semantic oracles. This module
 * binds to no product profile or artifact kind — later lanes (Tranche 01
 * onward) register `SemanticCase`s against a real parser/writer pair rather
 * than creating another runner.
 *
 * Two independent truth channels, both required:
 *
 * 1. **Round-trip IR equality** (`parse → write → reparse`, compared with
 *    `equalIR`) — certifies writer/reparse fidelity relative to the IR the
 *    parser itself produced. It cannot see parser-side loss: a `parse` that
 *    ignores its input and always returns the same fixed IR still round-trips
 *    with itself.
 * 2. **Independent source/target oracle agreement** (`sourceOracle`/
 *    `targetOracle`, compared with `equalOracle`) — each oracle observes
 *    meaning directly from the source or the written output, bypassing
 *    `parse`/`write` entirely, so it catches exactly the parser-side loss
 *    channel 1 cannot.
 *
 * Non-vacuity is structural, not opt-in: every case supplies a
 * `separatingSource` — an input the case author asserts is semantically
 * distinct from `source`. The runner recomputes discrimination against it
 * on all three comparisons that matter (`equalIR`, `sourceOracle` under
 * `equalOracle`, AND `targetOracle` under `equalOracle`) rather than
 * trusting a self-reported "this case is non-vacuous" flag. The target-oracle
 * leg matters as much as the source leg: without it, a constant `targetOracle`
 * that ignores its argument would make `oraclesAgree` vacuously agree with
 * whatever `sourceOracle` says, silently defeating channel 2. A `false`
 * result also catches a `parse`/`write` that collapses distinct inputs to
 * the same value — not only a literally-constant comparator — since both
 * failure modes look identical from the outside: two different sources
 * produced indistinguishable results somewhere in the pipeline.
 */

import { expect } from 'vitest';

/**
 * One semantic-outcome case: a source value plus the parse/write/reparse
 * functions and equality/oracle functions to run it through. All I/O and
 * comparison logic is injected — this module never imports a concrete
 * parser or writer.
 */
export interface SemanticCase<TSource, TIR, TOutput, TOracle> {
  /** Case name, carried into the outcome record and failure messages. */
  readonly name: string;
  /** The source value to parse. */
  readonly source: TSource;
  /**
   * A second source value the case author asserts is semantically distinct
   * from `source`. Used only for the non-vacuity precheck — never asserted
   * to round-trip itself.
   */
  readonly separatingSource: TSource;
  /** Produces the IR from a source value. */
  readonly parse: (source: TSource) => TIR;
  /** Produces a written artifact from the IR. */
  readonly write: (ir: TIR) => TOutput;
  /**
   * Rebuilds the IR from a written artifact. Real implementations should
   * validate the artifact at this boundary (never trust writer output
   * unvalidated) so a malformed or bypassed artifact fails loudly here
   * rather than silently producing a wrong IR.
   */
  readonly reparse: (output: TOutput) => TIR;
  /** Structural equality over IR values. */
  readonly equalIR: (a: TIR, b: TIR) => boolean;
  /** Independent oracle computed directly from the source (never via `parse`). */
  readonly sourceOracle: (source: TSource) => TOracle;
  /** Independent oracle computed directly from the written output (never via `reparse`). */
  readonly targetOracle: (output: TOutput) => TOracle;
  /** Equality over oracle values. */
  readonly equalOracle: (a: TOracle, b: TOracle) => boolean;
}

/**
 * Machine-readable, JSON-serialisable per-case outcome. Every flag is
 * recomputed from the artifacts on every run, never recorded from a claim.
 */
export interface SemanticOutcome {
  readonly case: string;
  /** Whether `parse → write → reparse` preserved the IR under `equalIR`. */
  readonly roundTripEqual: boolean;
  /** Whether the independent source and target oracles agree. */
  readonly oraclesAgree: boolean;
  /**
   * Whether `equalIR`, and `equalOracle` on both the source and target
   * legs, all demonstrably discriminate the declared separating pair.
   * `false` means a comparator is vacuous (e.g. `() => true`) or the
   * pipeline itself collapses distinct sources to indistinguishable
   * results — either way, `roundTripEqual` and `oraclesAgree` cannot be
   * trusted.
   */
  readonly nonVacuous: boolean;
}

/** The intermediate artifacts a run produced, retained for structural diffing on failure. */
export interface SemanticArtifacts<TIR, TOutput, TOracle> {
  readonly ir: TIR;
  readonly output: TOutput;
  readonly reparsedIR: TIR;
  readonly sourceOracleValue: TOracle;
  readonly targetOracleValue: TOracle;
}

/** A complete semantic-outcome proof: the machine-readable outcome plus the artifacts it was recomputed from. */
export interface SemanticProof<TIR, TOutput, TOracle> {
  readonly outcome: SemanticOutcome;
  readonly artifacts: SemanticArtifacts<TIR, TOutput, TOracle>;
}

/**
 * Run one semantic-outcome case.
 *
 * Parse, write, reparse, or oracle failures propagate as errors — fail-fast,
 * never a skipped or silently-passing case.
 *
 * @param semanticCase - The case to run
 * @returns The recomputed outcome plus the round-trip artifacts
 */
export function runSemanticOutcome<TSource, TIR, TOutput, TOracle>(
  semanticCase: SemanticCase<TSource, TIR, TOutput, TOracle>,
): SemanticProof<TIR, TOutput, TOracle> {
  const ir = semanticCase.parse(semanticCase.source);
  const output = semanticCase.write(ir);
  const reparsedIR = semanticCase.reparse(output);

  const sourceOracleValue = semanticCase.sourceOracle(semanticCase.source);
  const targetOracleValue = semanticCase.targetOracle(output);

  const separatingIR = semanticCase.parse(semanticCase.separatingSource);
  const separatingOutput = semanticCase.write(separatingIR);
  const separatingSourceOracleValue = semanticCase.sourceOracle(semanticCase.separatingSource);
  const separatingTargetOracleValue = semanticCase.targetOracle(separatingOutput);

  const irDiscriminates = !semanticCase.equalIR(ir, separatingIR);
  const sourceOracleDiscriminates = !semanticCase.equalOracle(
    sourceOracleValue,
    separatingSourceOracleValue,
  );
  const targetOracleDiscriminates = !semanticCase.equalOracle(
    targetOracleValue,
    separatingTargetOracleValue,
  );

  return {
    outcome: {
      case: semanticCase.name,
      roundTripEqual: semanticCase.equalIR(ir, reparsedIR),
      oraclesAgree: semanticCase.equalOracle(sourceOracleValue, targetOracleValue),
      nonVacuous: irDiscriminates && sourceOracleDiscriminates && targetOracleDiscriminates,
    },
    artifacts: { ir, output, reparsedIR, sourceOracleValue, targetOracleValue },
  };
}

/**
 * Run every case in a registry.
 *
 * @param cases - Cases to run
 * @throws If `cases` is empty — an empty registry proves nothing, so it is a
 * hard failure rather than a vacuous green run
 */
export function runAllSemanticOutcomes<TSource, TIR, TOutput, TOracle>(
  cases: readonly SemanticCase<TSource, TIR, TOutput, TOracle>[],
): readonly SemanticProof<TIR, TOutput, TOracle>[] {
  if (cases.length === 0) {
    throw new Error(
      'runAllSemanticOutcomes: no cases registered — an empty case registry proves nothing',
    );
  }
  return cases.map((semanticCase) => runSemanticOutcome(semanticCase));
}

/**
 * Assert that a semantic-outcome proof shows full preservation.
 *
 * Every check gates on the outcome record's own booleans — computed by the
 * case's injected `equalIR`/`equalOracle`, never by vitest's own structural
 * equality — so a case with an intentionally non-structural comparator (for
 * example one that is whitespace- or key-order-insensitive) is judged by its
 * own declared notion of equality, not a stricter one this module imposes.
 * Artifacts appear only inside failure messages, for a diff on failure.
 *
 * Checks non-vacuity first (a vacuous or input-collapsing pipeline makes
 * every other flag meaningless), then oracle agreement, then round-trip
 * equality.
 *
 * @param proof - The proof returned by {@link runSemanticOutcome}
 */
export function expectSemanticOutcome<TIR, TOutput, TOracle>(
  proof: SemanticProof<TIR, TOutput, TOracle>,
): void {
  const { outcome, artifacts } = proof;

  expect(
    outcome.nonVacuous,
    `${outcome.case}: equalIR, and equalOracle on both the source and target legs, must all discriminate the declared separating pair — a vacuous comparator or an input-collapsing pipeline proves nothing`,
  ).toBe(true);

  expect(
    outcome.oraclesAgree,
    `${outcome.case}: the target oracle (${JSON.stringify(artifacts.targetOracleValue)}) must agree with the source oracle (${JSON.stringify(artifacts.sourceOracleValue)}) under equalOracle — parser or writer fidelity loss`,
  ).toBe(true);

  expect(
    outcome.roundTripEqual,
    `${outcome.case}: parse → write → reparse (${JSON.stringify(artifacts.reparsedIR)}) must preserve the IR (${JSON.stringify(artifacts.ir)}) under equalIR`,
  ).toBe(true);
}
