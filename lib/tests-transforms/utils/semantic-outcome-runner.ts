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
 *
 * A case is not required to be pure. Every callback receives its own
 * independent clone, taken directly from whichever value this module still
 * trusts as ground truth, immediately before that one call — no clone is
 * ever reused across two calls, and `source`/`separatingSource` are never
 * passed by reference to anything. A mutating callback therefore cannot
 * corrupt the case object (making a second run of the same case produce a
 * different result), taint a comparison this function still needs to make
 * afterward, or leak into a different callback's supposedly independent
 * view of "the same" value — mirroring the OpenAPI-specific precedent this
 * module was extracted from (`loadOpenApiDocument(structuredClone(...))` in
 * PR #11).
 *
 * Cloning defaults to `structuredClone`, which is unsafe for branded
 * class-instance values (for example this repo's own `CastrSchema`/
 * `CastrSchemaProperties` IR): it silently drops the prototype and any
 * brand, producing a plain object whose methods are gone. A case whose
 * `TSource`/`TIR`/`TOutput`/`TOracle` is such a type must supply the
 * matching `cloneSource`/`cloneIR`/`cloneOutput`/`cloneOracle` override so
 * the mutation-safety guarantee above holds for real, non-plain-data
 * artifacts too.
 */

/**
 * Deep snapshot of `value` for diagnostic formatting that never invokes any
 * user-defined function, method, getter, or hook — not `toJSON`, not
 * `toString`, not `Symbol.toPrimitive`, not an accessor property's `get`.
 * Six rounds of review on this module (each finding a narrower residual
 * gap in the previous round's fix) converged on the same lesson: any
 * formatter that calls into caller-supplied code, even only on a fallback
 * path, is one more pathological artifact away from either crashing or
 * corrupting the very artifact it was asked to describe. This walker reads
 * every own property strictly through `Object.getOwnPropertyDescriptor`:
 * a data property's `.value` is read directly (a plain property read,
 * never a function call) and recursed into; an accessor property (one
 * with a `get`/`set`) is represented as the placeholder string `'<getter>'`
 * without ever calling `.get`; a function-valued data property is omitted
 * entirely, matching how `JSON.stringify` would have dropped it anyway.
 * There is no code path here that runs anything the artifact itself
 * defines, so nothing it defines — mutating or throwing — can run during
 * diagnostic formatting. A value already seen higher in the same recursion
 * (a circular reference) is replaced with a placeholder rather than
 * returned as the original live reference, so a cycle can never
 * reintroduce an unsanitised alias back into the snapshot.
 */
function toSafeDiagnosticValue(value: unknown, seen = new WeakSet<object>()): unknown {
  if (typeof value === 'function') {
    return undefined;
  }
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (seen.has(value)) {
    return '<circular>';
  }
  seen.add(value);
  if (Array.isArray(value)) {
    return value
      .filter((item) => typeof item !== 'function')
      .map((item) => toSafeDiagnosticValue(item, seen));
  }
  return Object.fromEntries(
    Object.keys(value).flatMap((key) => {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (descriptor === undefined) {
        return [];
      }
      if (descriptor.get !== undefined || descriptor.set !== undefined) {
        return [[key, '<getter>']];
      }
      if (typeof descriptor.value === 'function') {
        return [];
      }
      return [[key, toSafeDiagnosticValue(descriptor.value, seen)]];
    }),
  );
}

/**
 * Format an arbitrary value for a failure message without risking a second,
 * unrelated crash, and without formatting the caller's own retained
 * reference. Runs on {@link toSafeDiagnosticValue}'s snapshot, never on
 * `value` itself, so nothing the artifact defines can run as a side effect
 * of merely describing it. `Object.keys`/`Object.getOwnPropertyDescriptor`
 * only invoke trap code for a `Proxy`-backed artifact (never for a plain
 * object or class instance), so the snapshot step keeps its own guard for
 * that residual case, falling back to a fixed placeholder — never to the
 * live `value` — rather than propagating an uncaught error. `JSON.stringify`
 * throws on `bigint` values, which the replacer intercepts, and would
 * throw on a circular reference, which the snapshot has already broken;
 * its own guard is defence in depth for whatever this reasoning missed.
 */
function describeForDiagnostics(value: unknown): string {
  let safeValue: unknown;
  try {
    safeValue = toSafeDiagnosticValue(value);
  } catch {
    return '<value could not be formatted for diagnostics>';
  }
  try {
    return JSON.stringify(safeValue, (_key, v) => (typeof v === 'bigint' ? `${v}n` : v));
  } catch {
    return '<value could not be formatted for diagnostics>';
  }
}

/**
 * One semantic-outcome case: a source value plus the parse/write/reparse
 * functions and equality/oracle functions to run it through. All I/O and
 * comparison logic is injected — this module never imports a concrete
 * parser or writer.
 *
 * @example Registering a trivial numeric round-trip case
 * ```typescript
 * const numericCase: SemanticCase<string, number, string, string> = {
 *   name: 'numeric-round-trip',
 *   source: '42',
 *   separatingSource: '7',
 *   parse: (s) => Number.parseInt(s, 10),
 *   write: (n) => String(n),
 *   reparse: (s) => Number.parseInt(s, 10),
 *   equalIR: (a, b) => a === b,
 *   sourceOracle: (s) => s,
 *   targetOracle: (s) => s,
 *   equalOracle: (a, b) => a === b,
 * };
 * ```
 *
 * @see {@link runSemanticOutcome} to run a single case
 * @see {@link runAllSemanticOutcomes} to run a registry of cases
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
  /**
   * Overrides the default `structuredClone` used to isolate `source`/
   * `separatingSource` before each callback call. Supply this when `TSource`
   * is a branded class instance or otherwise not `structuredClone`-safe.
   */
  readonly cloneSource?: (source: TSource) => TSource;
  /**
   * Overrides the default `structuredClone` used to isolate IR values before
   * each callback call. Supply this when `TIR` is a branded class instance
   * (for example `CastrSchema`) — `structuredClone` would silently strip its
   * prototype and brand, breaking any method the case's `write`/`equalIR`
   * calls on it.
   *
   * @example Preserving a branded IR class across clones
   * ```typescript
   * cloneIR: (ir) => new BrandedIR(ir.value),
   * ```
   */
  readonly cloneIR?: (ir: TIR) => TIR;
  /**
   * Overrides the default `structuredClone` used to isolate written-output
   * values before each callback call. Supply this when `TOutput` is a
   * branded class instance or otherwise not `structuredClone`-safe.
   */
  readonly cloneOutput?: (output: TOutput) => TOutput;
  /**
   * Overrides the default `structuredClone` used to isolate oracle values
   * before each callback call. Supply this when `TOracle` is a branded class
   * instance or otherwise not `structuredClone`-safe.
   */
  readonly cloneOracle?: (oracle: TOracle) => TOracle;
}

/**
 * Machine-readable, JSON-serialisable per-case outcome. Every flag is
 * recomputed from the artifacts on every run, never recorded from a claim.
 *
 * @example
 * ```typescript
 * const { outcome } = runSemanticOutcome(numericCase);
 * // { case: 'numeric-round-trip', roundTripEqual: true, oraclesAgree: true, nonVacuous: true }
 * ```
 *
 * @see {@link SemanticProof} — the containing shape this is part of
 * @see {@link expectSemanticOutcome} — asserts these flags are all `true`
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

/**
 * The intermediate artifacts a run produced, retained for structural diffing
 * on failure.
 *
 * @see {@link SemanticProof} — the containing shape returned by {@link runSemanticOutcome}
 */
export interface SemanticArtifacts<TIR, TOutput, TOracle> {
  readonly ir: TIR;
  readonly output: TOutput;
  readonly reparsedIR: TIR;
  readonly sourceOracleValue: TOracle;
  readonly targetOracleValue: TOracle;
}

/**
 * A complete semantic-outcome proof: the machine-readable outcome plus the
 * artifacts it was recomputed from.
 *
 * @example
 * ```typescript
 * const proof = runSemanticOutcome(numericCase);
 * proof.outcome; // { case: 'numeric-round-trip', roundTripEqual: true, oraclesAgree: true, nonVacuous: true }
 * ```
 *
 * @see {@link runSemanticOutcome} — produces this shape
 * @see {@link expectSemanticOutcome} — asserts on this shape
 */
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
 * @example
 * ```typescript
 * const proof = runSemanticOutcome(numericCase);
 * expectSemanticOutcome(proof);
 * ```
 *
 * @param semanticCase - The case to run
 * @returns The recomputed outcome plus the round-trip artifacts
 * @see {@link SemanticCase} for the case shape and a full worked example
 * @see {@link runAllSemanticOutcomes} to run a registry of cases
 * @see {@link expectSemanticOutcome} to assert on the result
 */
export function runSemanticOutcome<TSource, TIR, TOutput, TOracle>(
  semanticCase: SemanticCase<TSource, TIR, TOutput, TOracle>,
): SemanticProof<TIR, TOutput, TOracle> {
  // Every case-supplied callback receives its own independent clone —
  // `structuredClone` by default, or the case's own `cloneSource`/`cloneIR`/
  // `cloneOutput`/`cloneOracle` override for values that don't survive
  // `structuredClone` (branded class instances) — taken directly from the
  // value this function still trusts as ground truth, immediately before
  // that one call. No clone is ever reused across two calls, and
  // `semanticCase.source`/`separatingSource` are never passed by reference
  // to anything. A callback that mutates its argument in place — a lossy
  // parse/write/reparse/oracle — therefore cannot: (a) corrupt the case
  // object, making a second run of the same case produce a different
  // result; (b) taint a comparison this function still needs to make
  // afterward (the pristine round-trip baseline, the returned artifacts);
  // or (c) leak into a DIFFERENT callback's supposedly independent view of
  // "the same" value (e.g. a mutating `sourceOracle` corrupting what
  // `parse` sees next, or a mutating `targetOracle` corrupting what
  // `reparse` sees next).
  const cloneSource: (source: TSource) => TSource = semanticCase.cloneSource ?? structuredClone;
  const cloneIR: (ir: TIR) => TIR = semanticCase.cloneIR ?? structuredClone;
  const cloneOutput: (output: TOutput) => TOutput = semanticCase.cloneOutput ?? structuredClone;
  const cloneOracle: (oracle: TOracle) => TOracle = semanticCase.cloneOracle ?? structuredClone;

  // `sourceOracle`/`targetOracle` are each called twice below (main and
  // separating channel). An oracle that returns a reused mutable reference
  // — a stateful implementation that updates and returns the same object
  // each call, analogous to a memoising `parse` — would otherwise let the
  // second call silently corrupt the first call's already-returned value
  // before anything downstream clones it. Snapshotting with `cloneOracle`
  // immediately on return closes that gap, matching `pristineIR`/
  // `pristineOutput`'s immediate-snapshot pattern below.
  const sourceOracleValue = cloneOracle(
    semanticCase.sourceOracle(cloneSource(semanticCase.source)),
  );
  const separatingSourceOracleValue = cloneOracle(
    semanticCase.sourceOracle(cloneSource(semanticCase.separatingSource)),
  );

  const ir = semanticCase.parse(cloneSource(semanticCase.source));
  const pristineIR = cloneIR(ir);
  // `write` receives a clone of `ir`, not `ir` itself: a memoising `parse`
  // may retain its own alias to the object it returned, and a mutating
  // `write` must not be able to corrupt that retained reference — a second
  // run of the same case could then observe a memoised, already-mutated IR.
  const output = semanticCase.write(cloneIR(ir));
  const pristineOutput = cloneOutput(output);
  const targetOracleValue = cloneOracle(semanticCase.targetOracle(cloneOutput(output)));
  // Snapshotted immediately, before the separating channel's `parse` call
  // below: a parser/reparser sharing one memoising implementation (a
  // realistic pattern, since `reparse` inverts `parse`) could return the
  // same retained object for both, and that separating `parse` call would
  // otherwise silently overwrite what `reparsedIR` still points to before
  // `roundTripEqual` and `artifacts.reparsedIR` ever read it.
  const reparsedIR = cloneIR(semanticCase.reparse(cloneOutput(output)));

  const separatingIR = semanticCase.parse(cloneSource(semanticCase.separatingSource));
  const pristineSeparatingIR = cloneIR(separatingIR);
  const separatingOutput = semanticCase.write(cloneIR(separatingIR));
  const separatingTargetOracleValue = cloneOracle(
    semanticCase.targetOracle(cloneOutput(separatingOutput)),
  );

  // `pristineIR`/`sourceOracleValue`/`targetOracleValue` are each compared
  // more than once below, and are also returned in `artifacts` — so
  // `equalIR`/`equalOracle` receive a fresh clone at EVERY call, not the
  // shared reference. Without this, a comparator that mutates its
  // arguments while comparing (e.g. sorting an array in place before
  // structural comparison — a realistic equality implementation, not a
  // contrived one) would leak between calls and corrupt the artifact.
  const irDiscriminates = !semanticCase.equalIR(cloneIR(pristineIR), cloneIR(pristineSeparatingIR));
  const sourceOracleDiscriminates = !semanticCase.equalOracle(
    cloneOracle(sourceOracleValue),
    cloneOracle(separatingSourceOracleValue),
  );
  const targetOracleDiscriminates = !semanticCase.equalOracle(
    cloneOracle(targetOracleValue),
    cloneOracle(separatingTargetOracleValue),
  );

  return {
    outcome: {
      case: semanticCase.name,
      roundTripEqual: semanticCase.equalIR(cloneIR(pristineIR), cloneIR(reparsedIR)),
      oraclesAgree: semanticCase.equalOracle(
        cloneOracle(sourceOracleValue),
        cloneOracle(targetOracleValue),
      ),
      nonVacuous: irDiscriminates && sourceOracleDiscriminates && targetOracleDiscriminates,
    },
    artifacts: {
      ir: pristineIR,
      output: pristineOutput,
      reparsedIR,
      sourceOracleValue,
      targetOracleValue,
    },
  };
}

/**
 * Run every case in a registry.
 *
 * @example
 * ```typescript
 * const proofs = runAllSemanticOutcomes([caseA, caseB]);
 * for (const proof of proofs) expectSemanticOutcome(proof);
 * ```
 *
 * @param cases - Cases to run
 * @returns One proof per case, in registration order
 * @throws If `cases` is empty — an empty registry proves nothing, so it is a
 * hard failure rather than a vacuous green run
 * @see {@link runSemanticOutcome} — runs a single case
 * @see {@link SemanticCase} for the case shape
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
 * Artifacts appear only inside failure messages, for a diff on failure —
 * each message is built only once its check has actually failed, not
 * eagerly for every proof, so a passing proof's artifacts are never even
 * passed to the diagnostic formatter.
 *
 * Checks non-vacuity first (a vacuous or input-collapsing pipeline makes
 * every other flag meaningless), then oracle agreement, then round-trip
 * equality.
 *
 * @example
 * ```typescript
 * expectSemanticOutcome(runSemanticOutcome(numericCase));
 * ```
 *
 * @param proof - The proof returned by {@link runSemanticOutcome}
 * @throws If any of `nonVacuous`, `oraclesAgree`, or `roundTripEqual` is `false`
 * @see {@link runSemanticOutcome} — produces the proof this asserts on
 * @see {@link SemanticOutcome} — the fields this checks
 */
export function expectSemanticOutcome<TIR, TOutput, TOracle>(
  proof: SemanticProof<TIR, TOutput, TOracle>,
): void {
  const { outcome, artifacts } = proof;

  if (!outcome.nonVacuous) {
    throw new Error(
      `${outcome.case}: equalIR, and equalOracle on both the source and target legs, must all discriminate the declared separating pair — a vacuous comparator or an input-collapsing pipeline proves nothing`,
    );
  }

  if (!outcome.oraclesAgree) {
    throw new Error(
      `${outcome.case}: the target oracle (${describeForDiagnostics(artifacts.targetOracleValue)}) must agree with the source oracle (${describeForDiagnostics(artifacts.sourceOracleValue)}) under equalOracle — parser or writer fidelity loss`,
    );
  }

  if (!outcome.roundTripEqual) {
    throw new Error(
      `${outcome.case}: parse → write → reparse (${describeForDiagnostics(artifacts.reparsedIR)}) must preserve the IR (${describeForDiagnostics(artifacts.ir)}) under equalIR`,
    );
  }
}
