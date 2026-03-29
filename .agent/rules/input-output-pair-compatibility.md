# Input-Output Pair Compatibility

All quality and feature-support decisions MUST be evaluated through the **Input-Output Pair Compatibility Model** (see [principles.md § Input-Output Pair Compatibility Model](../directives/principles.md)).

## The Four Rules (summary)

1. ALL features valid in the input format MUST be parseable into the IR.
2. Feature support for a pair is defined by what the **output format** can represent — semantic preservation, not 1:1 mapping.
3. The IR MUST carry ALL features from ANY supported format — it is the superset.
4. Fail-fast is ONLY for genuinely impossible output mappings — never for unimplemented features.

## Reviewer Checkpoint

When reviewing any parser, writer, or IR change, verify:

- **Parser changes**: Does the parser accept all valid input for that format? If a valid input keyword is rejected, is there an architectural reason or is it an implementation gap?
- **Writer changes**: Does the writer preserve semantics for all IR features it encounters? If it throws on a keyword, is that keyword genuinely unrepresentable in the output format, or could it be expressed differently (e.g., via `.refine()`, union transforms, type narrowing)?
- **IR changes**: Does the IR addition serve the superset principle? No IR field should be designed around the limitations of a single output format.
- **Fail-fast guards**: Every fail-fast guard must justify _why_ the output format cannot express the semantics — not just that the mapping hasn't been built yet.
