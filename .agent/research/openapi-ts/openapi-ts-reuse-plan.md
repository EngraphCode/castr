# OpenAPI-TS Reuse Plan (Legal/Ethical Focus)

This document complements `.agent/research/openapi-ts/openapi-ts-comparison.md` and focuses on what to reuse from OpenAPI‑TS, and how to do it without legal or ethical risk.

## Executive Summary

- Reuse ideas and architecture patterns freely; re-implement in Castr for lowest risk.
- MIT-licensed OpenAPI‑TS code can be reused with attribution and inclusion of the license text.
- Fixture/spec files may include third‑party content; do not copy without verifying per‑file licensing.
- Prefer synthetic fixtures that reproduce edge cases rather than copying third‑party specs.

## What’s Most Valuable to Reuse (Low-Risk Targets)

### Architecture / Concepts (Re-implement)

- Plugin dependency graph + tagging system for optional outputs.
- Parser transforms/filters/patch hooks for resilience.
- Output scaffolding patterns for SDKs.

### UX Features (Re-implement)

- Input registry shorthand (Hey API/Scalar/ReadMe) – consider a Castr‑specific plugin.
- Watch mode for regenerating outputs on spec changes.

### Testing Strategy (Curate or Recreate)

- The spec fixture categories (2.0/3.0/3.1, invalid/edge cases, transforms).
- Snapshot‑driven regression tests for outputs.

## What Can Be Reused Under MIT

### Allowed (with attribution + license inclusion)

- OpenAPI‑TS source code, internal logic, or test code authored by the project.
- Documentation text from OpenAPI‑TS (if you want to repurpose it).

### Required Actions if Reusing MIT Code

- Include the MIT license text from `tmp/openapi-ts/LICENSE.md`.
- Add attribution in a `THIRD_PARTY_NOTICES.md` or equivalent.
- Keep any existing copyright headers.

## Caution Zones (Audit Required)

### Third‑Party Specs and Fixtures

Some spec fixtures are likely copied from upstream APIs (e.g., OpenAI, Zoom). These may be under separate licenses/terms.

**Do not copy these** until you verify:

- The original license allows redistribution.
- The license terms are compatible with Castr’s distribution.

Examples to audit:

- `tmp/openapi-ts/specs/3.1.x/openai.yaml`
- `tmp/openapi-ts/specs/3.1.x/zoom-video-sdk.json`

### Snapshots Generated from Third‑Party Specs

Even if snapshots were produced by OpenAPI‑TS, they may embed third‑party content. Treat them as third‑party data.

## Recommended Approach (Minimal Risk)

1. **Re-implement, don’t copy code** for core features.
2. **Create synthetic fixtures** for all edge cases you want to test.
3. **Audit any fixture** before reuse if it appears to be a real public API spec.
4. **If you must reuse** OpenAPI‑TS code:
   - Add `THIRD_PARTY_NOTICES.md` with MIT attribution.
   - Keep a clear provenance record.

## Concrete Next Steps

### Step 1: Provenance Audit

Create a list of fixtures in `tmp/openapi-ts/specs/**` and classify:

- `first-party`: authored by OpenAPI‑TS (safe to reuse under MIT)
- `third-party`: copied from external providers (audit required)
- `unknown`: assume third-party until verified

### Step 2: Synthetic Fixture Plan

For each fixture category, create minimal synthetic equivalents:

- `nullable` / `type: ["null", ...]`
- `discriminator` and `allOf/oneOf/anyOf`
- `external $ref` + bundling
- `webhooks`, `callbacks`, `links`, `headers`, `examples`, `pathItems`
- `readOnly/writeOnly` transforms
- `invalid` spec violations (for fail-fast tests)

### Step 3: Optional MIT Code Reuse

If you decide to reuse any OpenAPI‑TS code, add:

- `docs/THIRD_PARTY_NOTICES.md` with the MIT license text.
- A short note in `README.md` citing the reuse.

## Notes

- This guidance is a technical and practical risk assessment; it is not legal advice.
- When in doubt, re‑implement or create synthetic fixtures.
