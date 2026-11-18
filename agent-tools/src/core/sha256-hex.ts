/**
 * The one definition of a SHA-256 digest written as text, shared by the validators that
 * recompute a pinned hash (corpus provenance, specification approval). Lifted when the second
 * validator arrived (`consolidate-at-second-consumer`).
 *
 * @packageDocumentation
 */

import { z } from 'zod';

const SHA256_BYTES = 32;

/**
 * True when `value` is a SHA-256 digest as `sha256sum` and Node's `digest('hex')` write it:
 * 64 lower-case hexadecimal characters. Decoding and re-encoding is the grammar check; Node's
 * hex decoder stops at the first character that is not hexadecimal, so anything else changes
 * either the length or the round trip.
 */
export function isSha256Hex(value: string): boolean {
  const decoded = Buffer.from(value, 'hex');
  return decoded.length === SHA256_BYTES && decoded.toString('hex') === value;
}

/** A Zod schema for a SHA-256 digest written as text. */
export const sha256HexSchema = z.string().refine(isSha256Hex, {
  message: 'not a SHA-256 digest of 64 lower-case hexadecimal characters',
});
