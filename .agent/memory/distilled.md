# Distilled Learnings

High-signal learnings from the napkin belong here once they have proved worth keeping for future sessions.

- When a vendor OpenAPI type disagrees with the published spec and the observed parser/upgrade runtime shape, correct the mismatch at `shared/openapi-types.ts`. Do not propagate the vendor mismatch deeper into IR or public surfaces for convenience.
- Treat schema-level `examples` as raw data. Never reinterpret object-shaped example payloads as OpenAPI Example Objects merely because they contain a `value` property; that is lossy and violates IR honesty.
- If the same external type family is used both for tolerant raw input and validated canonical documents, split those roles explicitly (`OpenAPIInputDocument` vs `OpenAPIDocument`) instead of weakening the canonical model.
- Do not collapse semantically distinct upstream surfaces into the nearest legacy bucket for convenience. Preserve them losslessly and give them an explicit repo/public name (`querystring` -> `QueryString` / `queryString`).
- When a plan is complete but still matters as a closure record, move it out of `.agent/plans/active/` into `.agent/plans/current/complete/` and link it from the active parent plan and session prompt instead of leaving completed work in the active entrypoint.
- When a slice closes, update every live handoff surface in the same pass (`.agent/README.md`, the active parent plan, the roadmap, and the session-continuation prompt) and anchor the next slice to a concrete proof base when possible. Otherwise stale “next” language and duplicate proof scaffolding drift back in.
