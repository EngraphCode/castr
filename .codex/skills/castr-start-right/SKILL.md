---
name: castr-start-right
description: Bootstrap or re-bootstrap work in this castr repo by following the repo's start-right session prompt and its referenced foundation directives. Use at the start of a new Codex session, after a context switch, or whenever you need to re-commit to "solve the right problem at the right layer", TDD/type discipline, and the repo's quality gates.
---

# Castr Start Right

## Do This First

1. Read and follow `@.agent/prompts/start-right.prompt.md`.
2. If you have not read them in this session, read the directives referenced by that prompt:
   `@.agent/directives/RULES.md`, `@.agent/directives/testing-strategy.md`,
   `@.agent/directives/requirements.md`, `@.agent/directives/DEFINITION_OF_DONE.md`.
3. Before proposing code changes, ask the user to confirm:
   - What impact are we trying to create for the user?
   - Are we solving the right problem, at the right layer?
   - What assumptions should we validate first?

## Execution Rules (Don't Drift)

- Treat the IR/generator as the source of truth: when analyzing generated output, find and analyze the generator as well.
- After each piece of work, run the full quality gates one gate at a time, in the repo-defined order, and only analyze failures after all gates have completed.
