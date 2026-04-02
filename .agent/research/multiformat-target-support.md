# Multi-Format Target Support

**Status:** Parked research note — not an active plan
**Created:** 2026-04-02
**Source:** Relocated from `.agent/plans/active/` during documentation consolidation so `active/` only contains real execution plans.

---

## Question

If the input is OpenAPI 3.1 / 3.2 and the desired output is a bundle of Zod, TypeScript, and JSON Schema for MCP support, how should Castr preserve metadata such as `example` / `examples` that Zod does not natively carry?

## Current Working Conclusion

- Do not route authoritative metadata through a Zod-only round-trip when the IR or JSON Schema can carry it directly.
- If multi-format bundle output is pursued, the IR should remain the canonical carrier and each output format should receive only the semantics it can express honestly.
- Zod metadata is a plausible auxiliary emission seam for examples, but it should not become the sole preservation strategy without a decision-complete plan and proof coverage.
- This topic is parked research, not part of the current OAS 3.2 execution slice.

## Where Follow-Up Belongs

- If this becomes implementation work, promote it into a decision-complete plan under `.agent/plans/active/` or `.agent/plans/future/`.
- If the next step is still investigation, keep it under `.agent/research/` rather than in `active/`.

## Likely Related Surfaces

- [ADR-034-writer-separation.md](../../docs/architectural_decision_records/ADR-034-writer-separation.md)
- [roadmap.md](../plans/roadmap.md)
- [MCP_INTEGRATION_GUIDE.md](../../docs/MCP_INTEGRATION_GUIDE.md)
