# Transform Test Fixtures (Sample Input)

This directory contains fixtures for transform testing with sample input (Session 2.6).

## Directory Structure

| Directory     | Purpose                                                      |
| ------------- | ------------------------------------------------------------ |
| `normalized/` | Castr-normalized specs for byte-for-byte idempotency testing |
| `arbitrary/`  | Real-world specs for semantic equivalence testing            |
| `edge-cases/` | Stress test fixtures for specific edge cases                 |

## Usage

Normalized fixtures are created by processing arbitrary specs through Castr once.
Arbitrary fixtures are a mix of symlinks to `lib/examples/openapi/` specs and committed real-world JSON fixtures stored directly in `arbitrary/`.
Edge-case fixtures are minimal, focused tests for specific scenarios.

## See Also

- [roadmap.md](../../../.agent/plans/roadmap.md)
- [ADR-027: Transform Validation with Sample Input](../../../docs/architectural_decision_records/ADR-027-round-trip-validation.md)
