/**
 * Semantic Outcome Runner — mutant-bite proof.
 *
 * Proves the artifact-agnostic semantic-outcome runner
 * (`../utils/semantic-outcome-runner.ts`) actually detects broken
 * parse/write/reparse/equality oracles, using trivial injected fakes (not
 * OpenAPI or any other product artifact kind — see the module doc for why).
 * This file IS the mutant-bite ritual: each `it` seeds one named mutant at
 * the fake pipeline and proves `runSemanticOutcome`/`expectSemanticOutcome`
 * catches it.
 */

import { describe, expect, it } from 'vitest';

import {
  expectSemanticOutcome,
  runAllSemanticOutcomes,
  runSemanticOutcome,
  type SemanticCase,
} from '../utils/semantic-outcome-runner.js';

interface FakeIR {
  readonly value: string;
}

/**
 * A correct, minimal fake pipeline: `write` stamps a `W:` marker so a
 * bypassed/echoing writer (source fed straight through as output) is
 * observably not a valid written artifact, and `reparse`/`targetOracle`
 * require that marker — modelling the real system's boundary revalidation
 * (writer output must be re-validated, not trusted).
 */
function correctCase(
  name: string,
  source: string,
  separatingSource: string,
): SemanticCase<string, FakeIR, string, string> {
  return {
    name,
    source,
    separatingSource,
    parse: (s) => ({ value: s }),
    write: (ir) => `W:${ir.value}`,
    reparse: (output) => {
      if (!output.startsWith('W:')) {
        throw new Error(`reparse: not a valid written artifact: ${JSON.stringify(output)}`);
      }
      return { value: output.slice(2) };
    },
    equalIR: (a, b) => a.value === b.value,
    sourceOracle: (s) => s.toUpperCase(),
    targetOracle: (output) => {
      if (!output.startsWith('W:')) {
        throw new Error(`targetOracle: not a valid written artifact: ${JSON.stringify(output)}`);
      }
      return output.slice(2).toUpperCase();
    },
    equalOracle: (a, b) => a === b,
  };
}

describe('semantic-outcome-runner: happy path (positive control)', () => {
  it('proves full preservation for a genuinely correct pipeline', () => {
    const proof = runSemanticOutcome(correctCase('happy-path', 'alpha', 'beta'));

    expect(proof.outcome).toEqual({
      case: 'happy-path',
      roundTripEqual: true,
      oraclesAgree: true,
      nonVacuous: true,
    });
    // Pins the real values too, so a runner that accidentally wired
    // `separatingSource` into the main channel (rather than only the
    // non-vacuity precheck) cannot pass this case by coincidence.
    expect(proof.artifacts.ir).toEqual({ value: 'alpha' });
    expect(proof.artifacts.output).toBe('W:alpha');
    expect(() => expectSemanticOutcome(proof)).not.toThrow();
  });
});

describe('semantic-outcome-runner: mutant-bite ritual', () => {
  it('catches a wrong-parser mutant (parse loses information from its input)', () => {
    const base = correctCase('wrong-parser', 'alpha', 'beta');
    // Lossy, not constant: truncating to the first character still yields a
    // *different* IR for `source` vs `separatingSource` ('a' vs 'b'), so the
    // non-vacuity precheck stays satisfied and cannot mask this mutant —
    // isolating oraclesAgree as the one assertion that fails.
    const mutant: typeof base = { ...base, parse: (s) => ({ value: s.slice(0, 1) }) };

    const proof = runSemanticOutcome(mutant);

    // IR self-equality alone cannot see this — write → reparse round-trips
    // the (already-lossy) IR with itself just fine. The independent target
    // oracle (computed from the written output, which only ever saw the
    // truncated IR) is what catches it: it disagrees with the source oracle
    // (computed from the untouched, full source).
    expect(proof.outcome.roundTripEqual).toBe(true);
    expect(proof.outcome.nonVacuous).toBe(true);
    expect(proof.outcome.oraclesAgree).toBe(false);
    expect(() => expectSemanticOutcome(proof)).toThrow(/target oracle .*must agree/);
  });

  it('catches a wrong-writer mutant (write collapses every IR to the same output)', () => {
    const base = correctCase('wrong-writer', 'alpha', 'beta');
    const mutant: typeof base = { ...base, write: () => 'W:FIXED_OUTPUT' };

    const proof = runSemanticOutcome(mutant);

    // A writer that ignores its IR also collapses the separating pair's two
    // distinct IRs to the same output, so the target-oracle discrimination
    // leg of the non-vacuity check fires — a legitimate catch, not a
    // coincidence: an unconditionally-constant writer IS an input-collapsing
    // pipeline, exactly the failure mode nonVacuous is defined to catch.
    expect(proof.outcome.roundTripEqual).toBe(false);
    expect(proof.outcome.oraclesAgree).toBe(false);
    expect(proof.outcome.nonVacuous).toBe(false);
    expect(() => expectSemanticOutcome(proof)).toThrow();
  });

  it('catches a bypassed-writer mutant (echoes the source straight through as output)', () => {
    const base = correctCase('bypassed-writer', 'alpha', 'beta');
    // Skips the real writer transformation entirely — feeds the source
    // straight through, unmarked, as if it were written output.
    const mutant: typeof base = { ...base, write: () => 'alpha' };

    // The unmarked artifact fails the boundary re-validation `reparse`
    // performs (real writer output is never trusted unvalidated) — a hard
    // failure, not a silently-passing proof.
    expect(() => runSemanticOutcome(mutant)).toThrow(/not a valid written artifact/);
  });

  it('catches an absent-artifact mutant (write declares but never produces an artifact)', () => {
    const base = correctCase('absent-artifact', 'alpha', 'beta');
    const mutant: typeof base = {
      ...base,
      write: () => {
        throw new Error('artifact not produced');
      },
    };

    // A declared-but-unproduced artifact is a hard failure, never a skip and
    // never a silently vacuous pass.
    expect(() => runSemanticOutcome(mutant)).toThrow('artifact not produced');
  });

  it('catches a vacuous IR-equality mutant (equalIR always reports equal)', () => {
    const base = correctCase('vacuous-ir-equal', 'alpha', 'beta');
    const mutant: typeof base = { ...base, equalIR: () => true };

    const proof = runSemanticOutcome(mutant);

    // The separating-pair precheck recomputes discrimination itself — it
    // does not trust a case's self-reported non-vacuity.
    expect(proof.outcome.nonVacuous).toBe(false);
    expect(() => expectSemanticOutcome(proof)).toThrow(/discriminate/i);
  });

  it('catches a vacuous oracle-equality mutant (equalOracle always reports equal)', () => {
    const base = correctCase('vacuous-oracle-equal', 'alpha', 'beta');
    const mutant: typeof base = { ...base, equalOracle: () => true };

    const proof = runSemanticOutcome(mutant);

    // A vacuous equalOracle would make oraclesAgree lie (always true) —
    // exactly why non-vacuity is checked independently of oraclesAgree,
    // rather than trusting oraclesAgree alone.
    expect(proof.outcome.oraclesAgree).toBe(true);
    expect(proof.outcome.nonVacuous).toBe(false);
    expect(() => expectSemanticOutcome(proof)).toThrow(/discriminate/i);
  });

  it('rejects an empty case registry rather than vacuously passing', () => {
    expect(() => runAllSemanticOutcomes([])).toThrow(/no cases registered/i);
  });

  it('runs every registered case and returns proofs in registration order', () => {
    const proofs = runAllSemanticOutcomes([
      correctCase('first', 'alpha', 'beta'),
      correctCase('second', 'gamma', 'delta'),
    ]);

    expect(proofs).toHaveLength(2);
    expect(proofs.map((proof) => proof.outcome.case)).toEqual(['first', 'second']);
    for (const proof of proofs) {
      expect(() => expectSemanticOutcome(proof)).not.toThrow();
    }
  });
});
