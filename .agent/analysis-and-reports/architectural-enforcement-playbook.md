# Architectural Enforcement Playbook

This playbook defines a comprehensive, battle-tested system designed to prevent architectural decay, spaghetti dependencies, and monolith "God folders" in medium-to-large-scale TypeScript projects.

Instead of relying on human vigilance, this model uses a combination of explicit physical constraints, static analysis tools, and AI agent guardrails to enforce a **Domain-Driven, Modulithic Architecture**.

---

## 1. The Core Philosophy: Maximize Signal

The defining principle of this setup is **Maximized Signal over Suppressed Noise**. When a project scales, developers (and AI agents) tend to bypass architectural rules for expediency. They write suppressions, ignore directories, or disable rules because "it's too hard to fix right now."
This playbook reverses that pattern. We remove the exceptions, expose the drift, and strictly enforce the boundaries before code is committed.

---

## 2. The Tech Stack & Responsibilities

The system requires an interconnected suite of 4 tools alongside custom AI agent constraints:

| Component / Tool                        | Responsibility                                                                     | Why it's Critical                                                                                                                                                 |
| :-------------------------------------- | :--------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Custom ESLint (`max-files-per-dir`)** | **The Driver:** Enforces physical modularization.                                  | Prevents "God Folders". Forces logical subdivision when a directory grows past ~10 source files.                                                                  |
| **`eslint-plugin-boundaries`**          | **The Director:** Enforces unidirectional data flow.                               | Prevents architectural cycles (e.g. Writers importing Parsers). It ensures the high-level layers of the application communicate in only one designated direction. |
| **`dependency-cruiser`**                | **The Guardrail:** Enforces strict domain dependencies and barrel file boundaries. | Once folders are split by the ESLint rule, this prevents them from importing each other's internals haphazardly.                                                  |
| **`knip`**                              | **The Optimizer:** Detects dead code, unused exports, and unlisted dependencies.   | Refactoring heavily leaves dead code behind. With strict barrel-file boundaries, `knip` proves internal functions are actually used.                              |
| **`madge`**                             | **The Assessor:** Visualizes graphs and warns on circular dependencies/orphans.    | Essential fallback visualization when dependency-cruiser rejects a circular dependency and you need to untangle it.                                               |

---

## 3. Implementation Playbook (Step-by-Step)

### Phase 1: Applying the "Pain Provider" (File Count Limits)

When introducing this to a new repo, start by turning on the physical constraints.

1. **Implement the Custom ESLint Rule:** Add the custom `no-max-files-per-dir` rule.
2. **Threshold Setting:** Set the limit low (e.g., `maxFiles: 12`).
3. **Crucial Caveats (The Exceptions that Prove the Rule):**
   - **Exclude Test Files:** Do NOT penalize testing. `*.test.ts`, `*.spec.ts`, and `__tests__` folders should be completely ignored by the rule to encourage exhaustive testing.
   - **Exclude Index Files:** `index.ts` is the architectural boundary (barrel), not domain logic. Exclude it from the count.
   - **Exclude Documentation:** `*.md` files don't count towards the logic threshold.

_Result:_ The project will immediately fail linting on its largest directories. The AI agent (or developer) is now forced to analyze the folder, identify the implicit domains within it, and extract them into sub-directories.

### Phase 2: Directing the Flow (`eslint-plugin-boundaries`)

Once directories are split, you must define how they are allowed to interact at a high level.

1. **Install and Configure `eslint-plugin-boundaries`:**
2. **Define the Elements (Layers):** Map file paths to semantic architectural layers (e.g., `shared`, `ir`, `parsers`, `writers`).
3. **Define the Flow:** Configure the `boundaries/element-types` rule to enforce unidirectional dependencies.
   - Example: `parsers` can import `ir`, but `ir` cannot import `parsers`.
   - Example: No domain can import `testing` utilities except other tests.
4. **The Caveat:** This plugin operates at the _layer_ level, not the _file_ level. It ensures the architectural diagram is respected, but it won't stop a `writer` from bypassing an `ir` barrel file. That is where Phase 3 comes in.

### Phase 3: Locking the Boundaries (Dependency-Cruiser)

Breaking up a large directory into three smaller directories is useless if they all intimately import each other's internals (e.g., `moduleA/internal.ts` importing `moduleB/helper.ts`). This just creates a scattered monolith.

1. **Mandate Barrel Files:** Every sub-domain MUST have an `index.ts` file acting as its public API.
2. **Configure `dependency-cruiser`:**
   - **Rule 1: No Circular Dependencies.** Hard blocker (`severity: 'error'`).
   - **Rule 2: Strict Barrels.** Sibling directories can ONLY import from a directory's `index.ts` file.
   - **Rule 3: Unidirectional Flow.** Define the hierarchy. (e.g., `src/writers` can import `src/ir`, but `src/ir` cannot import `src/writers`).
3. **Crucial Caveats (The Pitfalls We Discovered):**
   - **Regex Precision:** Ensure barrel exclusions explicitly match root boundaries (e.g., `^src/domain/index\.ts$`). `pathNot: 'index.ts'` is too broad and allows nested indices to act as fake barrels.
   - **No Test Loopholes:** Do not exclude `(*.test.ts)` files from dependency boundaries. A test in `parsers/` should be physically incapable of importing an internal helper from `writers/`. If a helper must be shared, it must be officially exported or moved to a shared testing domain.

_Result:_ The build will fail massively. 100+ violations will appear. This is the **Maximized Signal**. The AI agent must systematically route all internal cross-imports through their respective `index.ts` files, formally establishing the architectural contracts.

### Phase 4: The Cleanup (Knip & Madge)

After massive restructuring, the codebase will be littered with abandoned implementations and over-exported functions.

1. **Configure `knip`:**
   - Set strict entry points (`index.ts`, `cli/index.ts`, and test files).
   - Tell `knip` to run across the entire `src/` directory.
   - Because `dependency-cruiser` forced all inter-domain traffic through barrels, any function not exported by a barrel, and not used by a sibling inside the same folder, will correctly flag as **dead code**.
2. **Crucial Caveats:**
   - Ensure `knip.ts` correctly ignores monorepo/root dependencies if they are provided natively.
3. **Configure `madge`:**
   - Integrate `pnpm madge:circular` and `pnpm madge:orphans` into the pipeline. Use the `--warning` flag so it doesn't fail the build (since `dependency-cruiser` already handles hard failures), but rather provides actionable STDOUT visualization to the developer.

---

## 4. Agentic Guardrails (The AI Layer)

AI coding assistants are highly effective at implementation but naturally prone to architectural degradation if unguided. To make this playbook work autonomously, you must provide the agent with rigid, unavoidable system constraints.

### 1. The Directives (`.agent/directives/`)

You must instantiate explicit markdown directives that the agent reads automatically.

- **`RULES.md`**: Define the philosophy. State explicitly: _"Maximize signal. Do not disable linters. If a file is too large, use the 'Extract -> Test -> Compose' pattern to break it apart."_
- **`architectural-file-system-structure.md`**: Since the file size limit forces the agent to extract code, it needs to know _where_ to put it. This document defines the exact hierarchy of domains (e.g., `parsers`, `ir`, `writers`, `shared`) so the agent never guesses where a new utility belongs.

### 2. The Definition of Done (`DEFINITION_OF_DONE.md`)

The single most important agent mechanism is the synchronous Quality Gate.

- Create a `pnpm qg` (Quality Gate) script that runs ALL of the above checks simultaneously: `pnpm type-check && pnpm test && pnpm lint && pnpm depcruise && pnpm knip && pnpm madge`.
- Mandate in the `DEFINITION_OF_DONE.md` that the agent _must_ run `pnpm qg` and verify it exits with `0` before completing a task.
- Because the quality gate contains the ESLint file limit and the dependency-cruiser boundary checks, **the agent cannot cheat**. If it writes a 16th file into a directory, `pnpm qg` fails, and the agent must autonomously refactor its own work.

---

## Conclusion & Benefits

By following this playbook, you create an environment where the architecture actively fights its own decay.

- You eliminate the need for endless code-reviews arguing about where a file should go; the linters reject it if it breaks the graph.
- You eliminate 2000-line god-files; the linter forces the AI to create modular, composed functions.
- You achieve near 100% test coverage naturally, because small, isolated modules are trivially easy to unit test.
- And most importantly, you harness the AI agent's immense refactoring capability to maintain absolute architectural purity, rather than degrading it.
