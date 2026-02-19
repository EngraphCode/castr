# Normalized Fixtures

Castr-normalized OpenAPI specs for byte-for-byte idempotency testing.

## Purpose

These fixtures are created by processing arbitrary specs through Castr once.
Re-processing these specs should produce **identical output**.

## Files

Each fixture directory contains:

| File               | Description                                                      |
| ------------------ | ---------------------------------------------------------------- |
| `input.yaml`       | Symlink to original arbitrary fixture                            |
| `normalized.json`  | First pass: input → IR → OpenAPI                                 |
| `reprocessed.json` | Second pass: normalized → IR → OpenAPI (should match normalized) |
| `ir.json`          | IR from first pass (for debugging)                               |
| `ir2.json`         | IR from second pass (for debugging)                              |

## How to Regenerate

```bash
npx tsx scripts/generate-normalized-fixtures.ts
```
