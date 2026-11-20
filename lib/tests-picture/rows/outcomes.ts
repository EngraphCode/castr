/**
 * What a target does with one construct kind. The first five are the classes of the
 * specification's scope-and-fidelity table, with the fifth the owner decided on
 * 20 November 2026; `read` is the sixth outcome the owner decided the same day, for the
 * declarations a reader spends in reading.
 */
export type Outcome =
  | 'carried'
  | 'carried as structure'
  | 'carried by companion'
  | 'outside the target'
  | 'unexpressible'
  | 'read';

/**
 * The three things a consumer takes from Castr under SPEC-C-1.
 */
export interface Proposal {
  readonly zod: Outcome;
  /**
   * True where Zod has no constructor for the construct, so the Zod writer emits a check
   * function of Castr's own, marked as Castr's. Only ever true with `zod: 'carried'`.
   */
  readonly zodByCastrCheck: boolean;
  readonly typescript: Outcome;
  readonly endpoints: Outcome;
  readonly note: string;
}

/**
 * One letter per outcome, for writing proposals compactly:
 * C carried, X carried by a check Castr writes (Zod only), S carried as structure,
 * K carried by companion, O outside the target, U unexpressible, R read.
 */
export type Code = 'C' | 'X' | 'S' | 'K' | 'O' | 'U' | 'R';

const OUTCOME_OF_CODE: ReadonlyMap<Code, Outcome> = new Map([
  ['C', 'carried'],
  ['X', 'carried'],
  ['S', 'carried as structure'],
  ['K', 'carried by companion'],
  ['O', 'outside the target'],
  ['U', 'unexpressible'],
  ['R', 'read'],
]);

function outcomeOf(code: Code): Outcome {
  const outcome = OUTCOME_OF_CODE.get(code);
  if (outcome === undefined) {
    throw new TypeError(`no outcome for code ${code}`);
  }
  return outcome;
}

/**
 * A proposal written as three codes (Zod, TypeScript, endpoint definitions) and a note.
 */
export type Coded = readonly [zod: Code, typescript: Code, endpoints: Code, note: string];

/**
 * Expands a coded proposal. `X` is a Zod-only code: in another column it is refused.
 */
export function proposalOf([zod, typescript, endpoints, note]: Coded): Proposal {
  if (typescript === 'X' || endpoints === 'X') {
    throw new TypeError('a check Castr writes is a Zod outcome only');
  }
  return {
    zod: outcomeOf(zod),
    zodByCastrCheck: zod === 'X',
    typescript: outcomeOf(typescript),
    endpoints: outcomeOf(endpoints),
    note,
  };
}
