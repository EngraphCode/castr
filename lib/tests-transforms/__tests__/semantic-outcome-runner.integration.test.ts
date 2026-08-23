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
 * A correct, minimal fake pipeline: `write` stamps a `W:` marker, and
 * `reparse`/`targetOracle` strip it. Every function here is a straight,
 * branch-free mapping — no conditional logic, no string interpolation of
 * inputs — per `test-immediate-fails.md` item 12 (integration fakes are
 * simple fakes; detection logic belongs in the runner under test, not in
 * test-authored scaffolding). A malformed artifact therefore surfaces as
 * garbled data the runner's own `roundTripEqual`/`oraclesAgree` checks
 * catch, not as a fake-thrown validation error.
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
    reparse: (output) => ({ value: output.slice(2) }),
    equalIR: (a, b) => a.value === b.value,
    sourceOracle: (s) => s.toUpperCase(),
    targetOracle: (output) => output.slice(2).toUpperCase(),
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

  it('catches a bypassed-writer mutant (echoes its own IR straight through as output, unmarked)', () => {
    const base = correctCase('bypassed-writer', 'alpha', 'beta');
    // Skips the real writer transformation entirely — feeds the IR's own
    // value straight through, unmarked, as if it were written output.
    // Genuinely input-dependent (unlike a constant like the wrong-writer
    // mutant below), so it produces a DIFFERENT failure signature: the
    // separating pair's outputs stay distinguishable, so nonVacuous stays
    // true — only roundTripEqual/oraclesAgree catch it, via the runner's
    // own unconditional `reparse`/`targetOracle` slicing decoding the
    // unmarked value into garbled data.
    const mutant: typeof base = { ...base, write: (ir) => ir.value };

    const proof = runSemanticOutcome(mutant);

    expect(proof.outcome.roundTripEqual).toBe(false);
    expect(proof.outcome.oraclesAgree).toBe(false);
    expect(proof.outcome.nonVacuous).toBe(true);
    expect(() => expectSemanticOutcome(proof)).toThrow();
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

  it('catches a vacuous-witness mutant (separatingSource is not actually separating)', () => {
    // Every comparator here is correct and unmutated — the flaw is in the
    // CASE DATA, not the comparator: separatingSource equals source, so it
    // cannot witness anything distinct. Distinct from the vacuous-comparator
    // mutants above (equalIR/equalOracle always reporting equal): this
    // proves the runner also catches an author picking a non-separating
    // pair, per the report's "vacuous-witness" mutant category.
    const vacuousWitnessCase = correctCase('vacuous-witness', 'alpha', 'alpha');

    const proof = runSemanticOutcome(vacuousWitnessCase);

    expect(proof.outcome.roundTripEqual).toBe(true);
    expect(proof.outcome.oraclesAgree).toBe(true);
    expect(proof.outcome.nonVacuous).toBe(false);
    expect(() => expectSemanticOutcome(proof)).toThrow(/discriminate/i);
  });

  it('rejects an empty case registry rather than vacuously passing', () => {
    expect(() => runAllSemanticOutcomes([])).toThrow(/no cases registered/i);
  });

  it('computes every result from pristine values, and stays repeatable, even when every callback mutates its arguments in place', () => {
    interface MutableSource {
      value: string;
    }
    interface MutableIR {
      value: string;
    }
    interface MutableOutput {
      value: string;
    }
    interface MutableOracle {
      value: string;
    }

    // `parse` retains its own alias to every IR it returns — modelling a
    // memoising parser's internal cache — captured via closure rather than
    // a stateful cache structure, which would itself be non-trivial fake
    // logic. The alias must stay pristine after the run: `write` receiving
    // the raw `ir` reference instead of a clone would let it mutate this
    // retained alias too, so a later run of the same case (in a real
    // memoising parser, returning the same cached object again) would
    // observe already-mutated data.
    const retainedIRs: MutableIR[] = [];

    // Every one of the seven callbacks mutates its own arguments in place
    // after reading them — the bug this proves absent, for each: an oracle
    // or a downstream callback observing the mutation instead of the real
    // value, a comparison this function still needs to make afterward
    // seeing damaged data, a second run of the same case seeing corrupted
    // case-owned fields, a memoising parse's own retained alias seeing a
    // writer's mutation, or — for equalIR/equalOracle specifically — a
    // LATER call to the same comparator seeing a value an EARLIER call
    // already mutated (both are invoked more than once, on values also
    // returned in `artifacts`).
    const mutatingCase: SemanticCase<MutableSource, MutableIR, MutableOutput, MutableOracle> = {
      name: 'mutation-safety',
      source: { value: 'alpha' },
      separatingSource: { value: 'beta' },
      sourceOracle: (s) => {
        const upper = s.value.toUpperCase();
        s.value = 'MUTATED';
        return { value: upper };
      },
      parse: (s) => {
        const original = s.value;
        s.value = 'MUTATED';
        const ir = { value: original };
        retainedIRs.push(ir);
        return ir;
      },
      write: (ir) => {
        const written = { value: `W:${ir.value}` };
        ir.value = 'MUTATED';
        return written;
      },
      targetOracle: (o) => {
        const upper = o.value.slice(2).toUpperCase();
        o.value = 'MUTATED';
        return { value: upper };
      },
      reparse: (o) => {
        const result = { value: o.value.slice(2) };
        o.value = 'MUTATED';
        return result;
      },
      equalIR: (a, b) => {
        const result = a.value === b.value;
        a.value = 'MUTATED';
        b.value = 'MUTATED';
        return result;
      },
      equalOracle: (a, b) => {
        const result = a.value === b.value;
        a.value = 'MUTATED';
        b.value = 'MUTATED';
        return result;
      },
    };

    const proof = runSemanticOutcome(mutatingCase);

    // These only read the real values if every callback ran on its own
    // independent clone, at every call — against the pre-fix code at least
    // one of these would read 'MUTATED' instead, and expectSemanticOutcome
    // would throw on a false roundTripEqual/oraclesAgree corrupted by an
    // earlier equalIR/equalOracle call reusing the same reference.
    expect(proof.artifacts.sourceOracleValue).toEqual({ value: 'ALPHA' });
    expect(proof.artifacts.targetOracleValue).toEqual({ value: 'ALPHA' });
    expect(proof.artifacts.ir).toEqual({ value: 'alpha' });
    expect(proof.artifacts.output).toEqual({ value: 'W:alpha' });
    expect(() => expectSemanticOutcome(proof)).not.toThrow();

    // parse's own retained aliases (modelling a memoising parser's cache)
    // must also stay pristine — write only ever receives a clone of what
    // parse returned, never the object parse itself is still holding onto.
    expect(retainedIRs).toEqual([{ value: 'alpha' }, { value: 'beta' }]);

    // The case's own held fields must be untouched — every callback only
    // ever receives a clone — so a second run of the SAME case object
    // reproduces the identical outcome, not a run-count-dependent one.
    expect(mutatingCase.source).toEqual({ value: 'alpha' });
    expect(mutatingCase.separatingSource).toEqual({ value: 'beta' });
    expect(runSemanticOutcome(mutatingCase).outcome).toEqual(proof.outcome);
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
