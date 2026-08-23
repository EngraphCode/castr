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

    // `sourceOracle`/`targetOracle` each retain and mutate-then-return the
    // SAME object on both their calls (main and separating channel) —
    // modelling a stateful/memoising oracle implementation, the minimal
    // shape that can prove this specific bug: two calls returning distinct
    // fresh objects could never alias-corrupt each other, so the defect
    // only shows up when a single retained object is genuinely reused.
    // The runner must snapshot each call's result immediately, before that
    // oracle's own next call mutates the object the first call already
    // handed back.
    const retainedSourceOracleValue: MutableOracle = { value: '' };
    const retainedTargetOracleValue: MutableOracle = { value: '' };

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
        retainedSourceOracleValue.value = s.value.toUpperCase();
        s.value = 'MUTATED';
        return retainedSourceOracleValue;
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
        retainedTargetOracleValue.value = o.value.slice(2).toUpperCase();
        o.value = 'MUTATED';
        return retainedTargetOracleValue;
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

  it('throws when a branded class-instance IR is cloned with the default structuredClone', () => {
    // Mirrors this repo's own CastrSchema/CastrSchemaProperties IR: a class
    // instance whose behaviour lives in a prototype method, not in an own
    // enumerable field. structuredClone drops the prototype (and any brand),
    // so a `write` that calls a method on its cloned IR argument throws —
    // exactly the failure a real castr parser/writer pair would hit if this
    // runner cloned its IR with the default and nothing else.
    class BrandedIR {
      constructor(readonly value: string) {}
      describe(): string {
        return `IR(${this.value})`;
      }
    }

    const brandedCaseNoCustomClone: SemanticCase<string, BrandedIR, string, string> = {
      name: 'branded-ir-no-custom-clone',
      source: 'alpha',
      separatingSource: 'beta',
      parse: (source) => new BrandedIR(source),
      write: (ir) => ir.describe(),
      reparse: (output) => new BrandedIR(output.slice(3, -1)),
      equalIR: (a, b) => a.value === b.value,
      sourceOracle: (source) => source,
      targetOracle: (output) => output.slice(3, -1),
      equalOracle: (a, b) => a === b,
    };

    expect(() => runSemanticOutcome(brandedCaseNoCustomClone)).toThrow(
      /describe is not a function/,
    );
  });

  it('supports a branded class-instance IR when the case supplies cloneIR', () => {
    class BrandedIR {
      constructor(readonly value: string) {}
      describe(): string {
        return `IR(${this.value})`;
      }
    }

    const brandedCase: SemanticCase<string, BrandedIR, string, string> = {
      name: 'branded-ir-with-custom-clone',
      source: 'alpha',
      separatingSource: 'beta',
      parse: (source) => new BrandedIR(source),
      write: (ir) => ir.describe(),
      reparse: (output) => new BrandedIR(output.slice(3, -1)),
      equalIR: (a, b) => a.value === b.value,
      sourceOracle: (source) => source,
      targetOracle: (output) => output.slice(3, -1),
      equalOracle: (a, b) => a === b,
      cloneIR: (ir) => new BrandedIR(ir.value),
    };

    const proof = runSemanticOutcome(brandedCase);

    expect(proof.artifacts.ir).toBeInstanceOf(BrandedIR);
    expect(proof.artifacts.ir.value).toBe('alpha');
    expect(() => expectSemanticOutcome(proof)).not.toThrow();
  });

  it('prevents the separating parse call from corrupting reparsedIR when parse and reparse share one retained object', () => {
    interface SharedIR {
      value: string;
    }

    // Models parse/reparse funnelling through one shared, memoising
    // internal routine that retains and mutates a single IR object rather
    // than allocating a fresh one per call — realistic since `reparse`
    // inverts `parse`, and a real implementation may share the same
    // underlying parser state for both. This is the minimal shape able to
    // prove the defect: two calls returning distinct fresh objects could
    // never alias-corrupt each other.
    const retained: SharedIR = { value: '' };
    const sharedParseLike = (text: string): SharedIR => {
      retained.value = text;
      return retained;
    };

    const sharedCase: SemanticCase<string, SharedIR, string, string> = {
      name: 'shared-parse-reparse',
      source: 'alpha',
      separatingSource: 'beta',
      parse: (source) => sharedParseLike(source),
      write: (ir) => `W:${ir.value}`,
      reparse: (output) => sharedParseLike(output.slice(2)),
      equalIR: (a, b) => a.value === b.value,
      sourceOracle: (source) => source,
      targetOracle: (output) => output.slice(2),
      equalOracle: (a, b) => a === b,
    };

    const proof = runSemanticOutcome(sharedCase);

    // Without an immediate snapshot, the separating channel's `parse` call
    // (which also funnels through `sharedParseLike`) would overwrite the
    // retained object AFTER `reparse` already returned it but BEFORE
    // `roundTripEqual`/`artifacts.reparsedIR` read it — a false-negative
    // round-trip failure for a genuinely correct pipeline.
    expect(proof.artifacts.reparsedIR).toEqual({ value: 'alpha' });
    expect(proof.outcome.roundTripEqual).toBe(true);
    expect(() => expectSemanticOutcome(proof)).not.toThrow();
  });

  it('does not throw from expectSemanticOutcome when an artifact fails both JSON.stringify and String() coercion', () => {
    interface PoisonedOracle {
      readonly value: string;
      toJSON(): never;
      toString(): never;
    }

    // expectSemanticOutcome's failure-message templates call
    // describeForDiagnostics unconditionally on every artifact, even for a
    // genuinely passing case — template-literal arguments are evaluated
    // before `expect(...)` itself runs. An artifact whose JSON.stringify
    // AND String() coercion both throw must not crash that formatting.
    const poisoned = (value: string): PoisonedOracle => ({
      value,
      toJSON(): never {
        throw new Error('toJSON fails');
      },
      toString(): never {
        throw new Error('toString fails');
      },
    });

    const poisonedCase: SemanticCase<string, string, string, PoisonedOracle> = {
      name: 'poisoned-diagnostics',
      source: 'alpha',
      separatingSource: 'beta',
      parse: (source) => source,
      write: (ir) => ir,
      reparse: (output) => output,
      equalIR: (a, b) => a === b,
      sourceOracle: (source) => poisoned(source),
      targetOracle: (output) => poisoned(output),
      equalOracle: (a, b) => a.value === b.value,
      // structuredClone cannot clone a value with function properties
      // (DataCloneError) — orthogonal to this test's actual point, so
      // reconstruct a fresh poisoned instance instead.
      cloneOracle: (oracle) => poisoned(oracle.value),
    };

    const proof = runSemanticOutcome(poisonedCase);

    expect(() => expectSemanticOutcome(proof)).not.toThrow();
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
