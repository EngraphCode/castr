/**
 * Shared type definitions.
 *
 * The runtime guard for this type lives in `type-guards.ts` (`isRecord`).
 */

// eslint-disable-next-line @typescript-eslint/no-restricted-types -- JC: Sometimes we really do need to deal with unknown records at incoming system boundaries
export type UnknownRecord = Record<string, unknown>;
