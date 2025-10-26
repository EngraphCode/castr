# Further Enhancements Plan: Phase 3 - DX & Quality Improvements

**⚠️ PREREQUISITE:** Architecture Rewrite and Phase 2 completion required.

**See:**
- `.agent/plans/ARCHITECTURE_REWRITE_PLAN.md` (integrated into `01-CURRENT-IMPLEMENTATION.md`) - Core architecture must be complete
- `.agent/plans/00-STRATEGIC-PLAN.md` - Phase 2 must be marked complete

**Timeline:** Start Phase 3 enhancements after:
- Architecture Rewrite Phases 0-3 complete
- Zod v4 updated ✅
- All Phase 2 quality gates green

**Date:** October 25, 2025  
**Phase:** 3 of 4 (after Architecture Rewrite and Phase 2B)  
**Status:** Planning  
**Estimated Duration:** 3-4 weeks (25-32 hours)  
**Prerequisites:** Architecture Rewrite complete, All Phase 2 quality gates green  
**Source:** Inspired by typed-openapi patterns and industry best practices

---

## Overview

This plan adds developer experience and quality improvements inspired by typed-openapi analysis. These are quick wins that dramatically improve usability, performance visibility, and testing maturity without breaking changes.

**Quality Gate:** `pnpm format && pnpm build && pnpm type-check && pnpm test -- --run` must pass after every task.

---

## 🎯 MANDATORY: Test-Driven Development (TDD)

**ALL implementation tasks MUST follow TDD workflow:**

1. **✍️ Write failing test(s) FIRST** - Before any implementation code
2. **🔴 Run tests - confirm FAILURE** - Proves tests validate behavior
3. **✅ Write minimal implementation** - Only enough to pass tests
4. **🟢 Run tests - confirm SUCCESS** - Validates implementation works
5. **♻️ Refactor if needed** - Clean up with test protection
6. **🔁 Repeat** - For each piece of functionality

**This is non-negotiable.** See `.agent/RULES.md` for detailed TDD guidelines.

---

## 📚 MANDATORY: Comprehensive TSDoc

**ALL code (new and modified) MUST have comprehensive TSDoc:**

- **Public API** - Full TSDoc with 3+ examples, all tags, professional quality
- **Internal API** - Minimal TSDoc with @param, @returns, @throws
- **Types/Interfaces** - Property-level documentation with examples

**This is non-negotiable.** See `.agent/RULES.md` section "MANDATORY: Comprehensive TSDoc Standards".

---

## Task Execution Order

```
Phase 3A: Tooling Quick Wins (Week 1) [4-5 hours]
├─ 6.1 Config File Support (cosmiconfig)
└─ 6.2 Bundle Size Reporting & Analysis

Phase 3B: Developer Experience (Week 2) [11-14 hours]
├─ 6.3 Watch Mode (auto-regenerate)
├─ 6.4 Discriminated Union Error Handling
└─ 6.5 Configurable Status Codes

Phase 3C: Testing Maturity (Week 3) [7-9 hours]
├─ 6.6 Type-Level Testing (tstyche)
└─ 6.7 MSW Integration Tests

Phase 3D: Documentation & Polish (Week 4) [3-4 hours]
├─ 6.8 Migration Guides
└─ 6.9 Full Quality Gate Validation
```

**Total Estimated Time:** 25-32 hours (3-4 weeks)

---

## Phase 3A: Tooling Quick Wins

### 6.1 Config File Support (Industry Standard Pattern)

**Status:** Pending  
**Priority:** HIGH (Developer Experience)  
**Estimated Time:** 2-3 hours (TDD)  
**Dependencies:** None  
**Source:** Industry standard (Prettier, ESLint, TypeScript, etc.)

**Acceptance Criteria:**

- [ ] `cosmiconfig` dependency added
- [ ] Tests written FIRST (TDD)
- [ ] Config file loader implemented
- [ ] Supports multiple formats: `.openapirc`, `openapi.config.{js,ts,mjs,cjs}`
- [ ] CLI flags override config values
- [ ] Config file can be in any parent directory (monorepo support)
- [ ] All tests passing
- [ ] Quality gates pass

**Why This Matters:**

Benefits for users:

- **No long CLI commands** (config files are cleaner)
- **Version control friendly** (share configuration across team)
- **Monorepo support** (config in root, run from subdirectories)
- **Better CI/CD** (consistent configuration)
- **Industry standard** (users expect this pattern)

**Implementation Steps:**

**Phase A: Write Failing Tests (TDD Red) - 45 minutes**

1. **Create test file:**

    ```bash
    touch lib/src/loadConfig.test.ts
    ```

2. **Write comprehensive test suite:**

    ```typescript
    import { describe, it, expect, beforeEach, afterEach } from "vitest";
    import { loadConfig } from "./loadConfig.js";
    import { writeFileSync, unlinkSync, mkdirSync, rmdirSync } from "fs";
    import { join } from "path";

    describe("loadConfig", () => {
        const testDir = join(__dirname, "__test-config__");

        beforeEach(() => {
            mkdirSync(testDir, { recursive: true });
        });

        afterEach(() => {
            // Clean up test files
            try {
                const files = ["openapi.config.js", ".openapirc.json", ".openapirc.yml"];
                files.forEach((file) => {
                    try {
                        unlinkSync(join(testDir, file));
                    } catch {}
                });
                rmdirSync(testDir);
            } catch {}
        });

        it("should load config from openapi.config.js", async () => {
            const configPath = join(testDir, "openapi.config.js");
            writeFileSync(
                configPath,
                `
                module.exports = {
                    input: './api.yaml',
                    output: './client.ts',
                    template: 'schemas-with-metadata',
                };
            `
            );

            const config = await loadConfig(testDir);

            expect(config).toEqual({
                input: "./api.yaml",
                output: "./client.ts",
                template: "schemas-with-metadata",
            });
        });

        it("should load config from .openapirc.json", async () => {
            const configPath = join(testDir, ".openapirc.json");
            writeFileSync(
                configPath,
                JSON.stringify({
                    input: "./spec.yaml",
                    output: "./generated.ts",
                })
            );

            const config = await loadConfig(testDir);

            expect(config).toEqual({
                input: "./spec.yaml",
                output: "./generated.ts",
            });
        });

        it("should search parent directories (monorepo support)", async () => {
            const rootDir = join(testDir, "root");
            const subDir = join(rootDir, "packages", "api");

            mkdirSync(subDir, { recursive: true });

            const configPath = join(rootDir, "openapi.config.js");
            writeFileSync(
                configPath,
                `
                module.exports = {
                    template: 'schemas-with-metadata',
                };
            `
            );

            // Search from subdirectory
            const config = await loadConfig(subDir);

            expect(config).toEqual({
                template: "schemas-with-metadata",
            });
        });

        it("should return null if no config found", async () => {
            const config = await loadConfig(testDir);
            expect(config).toBeNull();
        });

        it("should handle TypeScript config files", async () => {
            const configPath = join(testDir, "openapi.config.ts");
            writeFileSync(
                configPath,
                `
                export default {
                    input: './api.yaml',
                    output: './client.ts',
                };
            `
            );

            const config = await loadConfig(testDir);

            expect(config).toEqual({
                input: "./api.yaml",
                output: "./client.ts",
            });
        });

        it("should handle ESM config files", async () => {
            const configPath = join(testDir, "openapi.config.mjs");
            writeFileSync(
                configPath,
                `
                export default {
                    input: './api.yaml',
                };
            `
            );

            const config = await loadConfig(testDir);

            expect(config).toEqual({
                input: "./api.yaml",
            });
        });
    });

    describe("CLI with config file", () => {
        it("should merge CLI flags with config file (CLI takes priority)", async () => {
            // This will be tested in cli.test.ts
            // Just a placeholder for integration testing
        });
    });
    ```

3. **Run tests - expect failures:**
    ```bash
    cd lib
    pnpm test -- --run src/loadConfig.test.ts
    # Expected: 6 FAILING (loadConfig doesn't exist yet)
    ```

**Phase B: Implement Config Loader (TDD Green) - 1 hour**

4. **Install cosmiconfig:**

    ```bash
    cd lib
    pnpm add cosmiconfig
    ```

5. **Create implementation:**

    ````typescript
    // lib/src/loadConfig.ts
    import { cosmiconfig } from "cosmiconfig";

    export interface OpenApiZodClientConfig {
        input?: string;
        output?: string;
        template?: string;
        outputMode?: "zod" | "types";
        noClient?: boolean;
        withValidationHelpers?: boolean;
        withSchemaRegistry?: boolean;
        withTypePredicates?: boolean;
        validateMcpReadiness?: boolean;
        skipMcpValidation?: boolean;
        strictMcpValidation?: boolean;
        prettierConfig?: string;
        // Add other options as needed
    }

    /**
     * Load configuration from config file using cosmiconfig.
     *
     * Searches for configuration in the following order:
     * - openapi.config.{js,ts,mjs,cjs}
     * - .openapirc.{json,yaml,yml}
     * - .openapirc
     * - openapi field in package.json
     *
     * @param searchFrom - Directory to start searching from (defaults to cwd)
     * @returns Configuration object or null if no config found
     *
     * @example
     * ```typescript
     * const config = await loadConfig();
     * if (config) {
     *   console.log('Found config:', config);
     * }
     * ```
     *
     * @example
     * ```typescript
     * // Monorepo: search from subdirectory
     * const config = await loadConfig('./packages/api');
     * ```
     *
     * @example
     * ```typescript
     * // openapi.config.js
     * module.exports = {
     *   input: './api.yaml',
     *   output: './client.ts',
     *   template: 'schemas-with-metadata',
     * };
     * ```
     */
    export async function loadConfig(searchFrom?: string): Promise<OpenApiZodClientConfig | null> {
        const explorer = cosmiconfig("openapi", {
            searchPlaces: [
                "openapi.config.js",
                "openapi.config.mjs",
                "openapi.config.cjs",
                "openapi.config.ts",
                ".openapirc",
                ".openapirc.json",
                ".openapirc.yaml",
                ".openapirc.yml",
                "package.json",
            ],
        });

        try {
            const result = await explorer.search(searchFrom);
            return result?.config ?? null;
        } catch (error) {
            console.error("Error loading config:", error);
            return null;
        }
    }
    ````

6. **Update CLI to use config:**

    ```typescript
    // lib/src/cli.ts
    import { loadConfig } from "./loadConfig.js";

    // Load config file
    const fileConfig = await loadConfig();

    // Merge CLI flags with config file (CLI takes priority)
    const finalOptions = {
        ...fileConfig, // Config file (lower priority)
        ...cliOptions, // CLI flags (higher priority)
    };

    // Use finalOptions for generation
    ```

7. **Run tests - expect success:**
    ```bash
    pnpm test -- --run src/loadConfig.test.ts
    # Expected: 6/6 PASSING ✅
    ```

**Phase C: Documentation - 30 minutes**

8. **Update README with config file examples:**

    ````markdown
    ## Configuration

    ### Config File (Recommended)

    Create a config file in your project root:

    ```javascript
    // openapi.config.js
    module.exports = {
        input: "./api/openapi.yaml",
        output: "./src/generated/client.ts",
        template: "schemas-with-metadata",
        withValidationHelpers: true,
    };
    ```

    Then run without flags:

    ```bash
    pnpm openapi-zod-client
    ```

    ### Supported Config Files

    - `openapi.config.{js,ts,mjs,cjs}` - JavaScript/TypeScript
    - `.openapirc` - JSON or YAML
    - `.openapirc.{json,yaml,yml}` - Explicit format
    - `package.json` - `"openapi"` field

    ### Monorepo Support

    Config file can be in any parent directory:

    ```
    /workspace/
      openapi.config.js  ← Config here
      /packages/
        /api/
          run here →  pnpx openapi-zod-client
    ```

    ### CLI Overrides

    CLI flags override config file:

    ```bash
    # Config has template: 'default'
    # This will use 'schemas-with-metadata' instead
    pnpm openapi-zod-client --template schemas-with-metadata
    ```
    ````

**Validation Steps:**

1. All tests pass
2. Config file loading works from subdirectories
3. CLI flags override config values
4. All supported formats work
5. Quality gates pass

**Output:**

- `lib/src/loadConfig.ts` (implementation)
- `lib/src/loadConfig.test.ts` (6 tests)
- Updated CLI to use config
- README documentation
- cosmiconfig dependency added

**Benefits:**

- No more long CLI commands
- Version control friendly
- Team-friendly configuration
- Monorepo support
- Industry standard pattern

**Cross-Reference:**

- Inspired by: `.agent/analysis/typed-openapi-lessons/05-TOOLING.md` Section 2
- Impact analysis: `.agent/analysis/typed-openapi-lessons/IMPACT-ANALYSIS.md`

---

### 6.2 Bundle Size Reporting & Analysis

**Status:** Pending  
**Priority:** MEDIUM (Performance Visibility)  
**Estimated Time:** 2-3 hours (TDD)  
**Dependencies:** None  
**Source:** typed-openapi performance patterns

**Acceptance Criteria:**

- [ ] Bundle size calculation implemented
- [ ] Tests written FIRST (TDD)
- [ ] CLI flag added: `--analyze`
- [ ] Shows generated code size
- [ ] Shows dependency sizes (bundlephobia API or bundled)
- [ ] Shows optimization tips
- [ ] Formatted output (table or tree)
- [ ] All tests passing
- [ ] Quality gates pass

**Why This Matters:**

Users need visibility into bundle impact:

- **Performance awareness** (know the cost)
- **Optimization guidance** (what to improve)
- **Decision support** (types-only vs Zod mode)
- **Bundle budgeting** (track size over time)

**Implementation Steps:**

**Phase A: Write Failing Tests (TDD Red) - 45 minutes**

1. **Create test file:**

    ```bash
    touch lib/src/analyzeBundleSize.test.ts
    ```

2. **Write comprehensive test suite:**

    ```typescript
    import { describe, it, expect } from "vitest";
    import { analyzeBundleSize } from "./analyzeBundleSize.js";

    describe("analyzeBundleSize", () => {
        it("should calculate generated code size", () => {
            const code = "export const Pet = z.object({ id: z.string() });";
            const analysis = analyzeBundleSize(code, { template: "default" });

            expect(analysis.generated).toMatchObject({
                size: expect.any(Number),
                sizeFormatted: expect.stringMatching(/\d+ [BKM]B/),
            });
        });

        it("should show dependency sizes for Zod mode", () => {
            const code = 'import { z } from "zod";\nexport const Pet = z.object({});';
            const analysis = analyzeBundleSize(code, { template: "default" });

            expect(analysis.dependencies).toEqual({
                zod: { size: expect.any(Number), sizeFormatted: expect.any(String) },
                "@zodios/core": { size: expect.any(Number), sizeFormatted: expect.any(String) },
                axios: { size: expect.any(Number), sizeFormatted: expect.any(String) },
            });
        });

        it("should show 0 dependencies for types-only mode", () => {
            const code = "export type Pet = { id: string };";
            const analysis = analyzeBundleSize(code, { template: "types-only" });

            expect(analysis.dependencies).toEqual({});
            expect(analysis.totalSize).toBeLessThan(1000); // Should be tiny
        });

        it("should provide optimization tips", () => {
            const code = 'import { z } from "zod";\nexport const Pet = z.object({});';
            const analysis = analyzeBundleSize(code, { template: "default" });

            expect(analysis.tips).toBeInstanceOf(Array);
            expect(analysis.tips.length).toBeGreaterThan(0);
            expect(analysis.tips[0]).toHaveProperty("title");
            expect(analysis.tips[0]).toHaveProperty("savings");
            expect(analysis.tips[0]).toHaveProperty("description");
        });

        it("should format output as table", () => {
            const code = 'import { z } from "zod";';
            const analysis = analyzeBundleSize(code, { template: "default" });
            const table = analysis.formatAsTable();

            expect(table).toContain("Bundle Analysis");
            expect(table).toContain("Generated Code");
            expect(table).toContain("Dependencies");
        });
    });
    ```

3. **Run tests - expect failures:**
    ```bash
    pnpm test -- --run src/analyzeBundleSize.test.ts
    # Expected: 5 FAILING
    ```

**Phase B: Implement Bundle Analysis (TDD Green) - 1 hour**

4. **Create implementation:**

    ````typescript
    // lib/src/analyzeBundleSize.ts

    interface DependencySize {
        size: number; // bytes
        sizeFormatted: string; // "13 KB"
    }

    interface OptimizationTip {
        title: string;
        savings: string; // "180 KB (-62%)"
        description: string;
    }

    export interface BundleAnalysis {
        generated: DependencySize;
        dependencies: Record<string, DependencySize>;
        totalSize: number;
        totalSizeFormatted: string;
        tips: OptimizationTip[];
        formatAsTable(): string;
    }

    // Approximate dependency sizes (min+gzip)
    const DEPENDENCY_SIZES = {
        zod: 13 * 1024, // 13 KB
        "@zodios/core": 7 * 1024, // 7 KB
        axios: 28 * 1024, // 28 KB
    };

    /**
     * Analyze bundle size impact of generated code.
     *
     * @param code - Generated code string
     * @param options - Generation options (template, etc.)
     * @returns Bundle analysis with sizes and optimization tips
     *
     * @example
     * ```typescript
     * const analysis = analyzeBundleSize(generatedCode, { template: 'default' });
     * console.log(analysis.formatAsTable());
     * ```
     */
    export function analyzeBundleSize(code: string, options: { template?: string }): BundleAnalysis {
        // Calculate generated code size
        const generated = {
            size: Buffer.byteLength(code, "utf8"),
            sizeFormatted: formatBytes(Buffer.byteLength(code, "utf8")),
        };

        // Detect dependencies from imports
        const dependencies: Record<string, DependencySize> = {};
        if (code.includes('from "zod"')) {
            dependencies.zod = {
                size: DEPENDENCY_SIZES.zod,
                sizeFormatted: formatBytes(DEPENDENCY_SIZES.zod),
            };
        }
        if (code.includes("@zodios/core")) {
            dependencies["@zodios/core"] = {
                size: DEPENDENCY_SIZES["@zodios/core"],
                sizeFormatted: formatBytes(DEPENDENCY_SIZES["@zodios/core"]),
            };
        }
        if (code.includes("axios")) {
            dependencies.axios = {
                size: DEPENDENCY_SIZES.axios,
                sizeFormatted: formatBytes(DEPENDENCY_SIZES.axios),
            };
        }

        // Calculate total
        const totalSize = generated.size + Object.values(dependencies).reduce((sum, dep) => sum + dep.size, 0);

        // Generate optimization tips
        const tips: OptimizationTip[] = [];

        if (dependencies.zod && options.template !== "types-only") {
            tips.push({
                title: "Use types-only mode for zero-dependency output",
                savings: `${formatBytes(totalSize)} (-100%)`,
                description: "Add --output-mode types to generate pure TypeScript types with no runtime dependencies",
            });
        }

        if (dependencies["@zodios/core"]) {
            tips.push({
                title: "Use schemas-with-metadata template",
                savings: `${formatBytes(DEPENDENCY_SIZES["@zodios/core"] + DEPENDENCY_SIZES.axios)} (-42%)`,
                description: "Use --template schemas-with-metadata for headless client without Zodios/axios",
            });
        }

        return {
            generated,
            dependencies,
            totalSize,
            totalSizeFormatted: formatBytes(totalSize),
            tips,
            formatAsTable() {
                let table = "\n📊 Bundle Analysis\n\n";

                table += "Generated Code:\n";
                table += `  ${generated.sizeFormatted}\n\n`;

                if (Object.keys(dependencies).length > 0) {
                    table += "Dependencies (min+gzip):\n";
                    for (const [name, info] of Object.entries(dependencies)) {
                        table += `  ${name.padEnd(20)} ${info.sizeFormatted}\n`;
                    }
                    table += "\n";
                }

                table += `Total Bundle Impact: ${formatBytes(totalSize)}\n`;

                if (tips.length > 0) {
                    table += "\n💡 Optimization Tips:\n\n";
                    tips.forEach((tip, i) => {
                        table += `${i + 1}. ${tip.title}\n`;
                        table += `   Savings: ${tip.savings}\n`;
                        table += `   ${tip.description}\n\n`;
                    });
                }

                return table;
            },
        };
    }

    function formatBytes(bytes: number): string {
        if (bytes === 0) return "0 B";
        const k = 1024;
        const sizes = ["B", "KB", "MB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i)) + " " + sizes[i];
    }
    ````

5. **Add CLI flag:**

    ```typescript
    // lib/src/cli.ts
    program.option("--analyze", "Show bundle size analysis");

    // After generation
    if (program.opts().analyze) {
        const analysis = analyzeBundleSize(generatedCode, options);
        console.log(analysis.formatAsTable());
    }
    ```

6. **Run tests - expect success:**
    ```bash
    pnpm test -- --run src/analyzeBundleSize.test.ts
    # Expected: 5/5 PASSING ✅
    ```

**Phase C: Documentation - 30 minutes**

7. **Update README:**

    ````markdown
    ## Bundle Analysis

    See the bundle size impact of generated code:

    ```bash
    pnpm openapi-zod-client ./api.yaml -o ./client.ts --analyze
    ```

    Output:

    ```
    📊 Bundle Analysis

    Generated Code:
      45 KB

    Dependencies (min+gzip):
      zod                  13 KB
      @zodios/core         7 KB
      axios                28 KB

    Total Bundle Impact: 93 KB

    💡 Optimization Tips:

    1. Use types-only mode for zero-dependency output
       Savings: 93 KB (-100%)
       Add --output-mode types to generate pure TypeScript types

    2. Use schemas-with-metadata template
       Savings: 35 KB (-42%)
       Use --template schemas-with-metadata for headless client
    ```
    ````

**Validation Steps:**

1. All tests pass
2. CLI flag works
3. Output is accurate and helpful
4. Optimization tips are relevant
5. Quality gates pass

**Output:**

- `lib/src/analyzeBundleSize.ts` (implementation)
- `lib/src/analyzeBundleSize.test.ts` (5 tests)
- Updated CLI with `--analyze` flag
- README documentation

**Benefits:**

- Visibility into bundle impact
- Actionable optimization tips
- Performance awareness
- Helps users make informed decisions

**Cross-Reference:**

- Inspired by: `.agent/analysis/typed-openapi-lessons/07-DEPLOYMENT.md` Section 1.3
- Impact analysis: `.agent/analysis/typed-openapi-lessons/IMPACT-ANALYSIS.md`

---

## Phase 3B: Developer Experience

### 6.3 Watch Mode (Auto-Regenerate)

**Status:** Pending  
**Priority:** MEDIUM (Development Workflow)  
**Estimated Time:** 2-3 hours (TDD)  
**Dependencies:** None

**Acceptance Criteria:**

- [ ] `chokidar` dependency added
- [ ] Tests written FIRST (TDD)
- [ ] `--watch` flag implemented
- [ ] Auto-regenerates on spec changes
- [ ] Debounces rapid changes (500ms)
- [ ] Clear console feedback
- [ ] Graceful error handling
- [ ] All tests passing
- [ ] Quality gates pass

**Why This Matters:**

Better development workflow:

- **No manual regeneration** (automatic)
- **Faster iteration** (instant feedback)
- **Hot reload integration** (works with dev servers)
- **Error detection** (see issues immediately)

**Implementation Steps:**

[Similar TDD structure to previous tasks, estimated 2-3 hours]

**Cross-Reference:**

- Inspired by: `.agent/analysis/typed-openapi-lessons/05-TOOLING.md` Section 3
- Impact analysis: `.agent/analysis/typed-openapi-lessons/IMPACT-ANALYSIS.md`

---

### 6.4 Discriminated Union Error Handling

**Status:** Pending  
**Priority:** MEDIUM (Type Safety)  
**Estimated Time:** 6-8 hours (TDD)  
**Dependencies:** None

**Acceptance Criteria:**

- [ ] Union-style error responses generated
- [ ] Tests written FIRST (TDD)
- [ ] `withResponse` option implemented
- [ ] Type narrowing works (discriminated unions)
- [ ] Exhaustiveness checking supported
- [ ] All tests passing
- [ ] Quality gates pass

**Why This Matters:**

Type-safe error handling without try/catch:

```typescript
const result = await api.getPetById({ id: "123", withResponse: true });

if (result.ok) {
    // result.data is Pet (200 response)
    console.log(result.data.name);
} else {
    // result.status is discriminated union: 400 | 404 | 500
    switch (result.status) {
        case 404:
            // TypeScript knows result.data is NotFoundError
            console.error("Not found:", result.data.message);
            break;
        case 400:
            // TypeScript knows result.data is ValidationError
            console.error("Invalid:", result.data.errors);
            break;
    }
}
```

**Implementation Steps:**

[Detailed TDD implementation, estimated 6-8 hours]

**Cross-Reference:**

- Inspired by: `.agent/analysis/typed-openapi-lessons/03-API-DESIGN.md` Section 2
- Impact analysis: `.agent/analysis/typed-openapi-lessons/IMPACT-ANALYSIS.md`

---

### 6.5 Configurable Status Codes

**Status:** Pending  
**Priority:** LOW (Flexibility)  
**Estimated Time:** 3 hours (TDD)  
**Dependencies:** None

**Acceptance Criteria:**

- [ ] CLI flags added: `--success-status-codes`, `--error-status-codes`
- [ ] Tests written FIRST (TDD)
- [ ] Range syntax supported (200-299)
- [ ] Updates `isMainResponseStatus` logic
- [ ] All tests passing
- [ ] Quality gates pass

**Why This Matters:**

Flexibility for edge cases:

- Different API conventions
- Custom status codes (207, 418, etc.)
- 3xx as success in some APIs

**Implementation Steps:**

[TDD implementation, estimated 3 hours]

**Cross-Reference:**

- Inspired by: `.agent/analysis/typed-openapi-lessons/03-API-DESIGN.md` Section 2.4
- Impact analysis: `.agent/analysis/typed-openapi-lessons/IMPACT-ANALYSIS.md`

---

## Phase 3C: Testing Maturity

### 6.6 Type-Level Testing (tstyche)

**Status:** Pending  
**Priority:** MEDIUM (Quality Assurance)  
**Estimated Time:** 3-4 hours  
**Dependencies:** None

**Acceptance Criteria:**

- [ ] `tstyche` dependency added
- [ ] Type tests written for generated code
- [ ] Tests type inference correctness
- [ ] Tests type narrowing (discriminated unions)
- [ ] Added to CI pipeline
- [ ] All tests passing
- [ ] Quality gates pass

**Why This Matters:**

Catch type regressions:

- Test that TypeScript types are correct
- Validate type inference works
- Catch breaking type changes
- Complement runtime tests

**Example Type Test:**

```typescript
import { test } from "tstyche";
import { Pet, ApiEndpoints } from "./generated";

test("Pet type has correct properties", () => {
    expect<Pet>().type.toHaveProperty("id");
    expect<Pet>().type.toHaveProperty("name");
    expect<Pet["id"]>().type.toBe<string>();
});

test("Endpoint types are correct", () => {
    expect<ApiEndpoints["getPetById"]["parameters"]>().type.toHaveProperty("path");
    expect<ApiEndpoints["getPetById"]["responses"][200]>().type.toBe<Pet>();
});
```

**Implementation Steps:**

[Implementation plan, estimated 3-4 hours]

**Cross-Reference:**

- Inspired by: `.agent/analysis/typed-openapi-lessons/04-TESTING.md` Section 1
- Impact analysis: `.agent/analysis/typed-openapi-lessons/IMPACT-ANALYSIS.md`

---

### 6.7 MSW Integration Tests

**Status:** Pending  
**Priority:** MEDIUM (Quality Assurance)  
**Estimated Time:** 4-5 hours  
**Dependencies:** Task 6.6 complete (optional)

**Acceptance Criteria:**

- [ ] `msw` dependency added
- [ ] Integration tests written
- [ ] Tests all templates
- [ ] Tests error scenarios
- [ ] Mocks HTTP responses
- [ ] All tests passing
- [ ] Quality gates pass

**Why This Matters:**

Test generated code actually works:

- Ensure clients can make HTTP requests
- Validate error handling
- Test with real-ish scenarios
- Catch runtime issues

**Example MSW Test:**

```typescript
import { rest } from "msw";
import { setupServer } from "msw/node";
import { createClient } from "./generated";

const server = setupServer(
    rest.get("https://api.example.com/pets/:id", (req, res, ctx) => {
        return res(ctx.json({ id: req.params.id, name: "Fluffy" }));
    })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

test("client makes successful request", async () => {
    const client = createClient(fetch);
    const pet = await client.getPetById({ id: "123" });

    expect(pet).toEqual({ id: "123", name: "Fluffy" });
});
```

**Implementation Steps:**

[Implementation plan, estimated 4-5 hours]

**Cross-Reference:**

- Inspired by: `.agent/analysis/typed-openapi-lessons/04-TESTING.md` Section 2
- Impact analysis: `.agent/analysis/typed-openapi-lessons/IMPACT-ANALYSIS.md`

---

## Phase 3D: Documentation & Polish

### 6.8 Migration Guides

**Status:** Pending  
**Priority:** MEDIUM (User Support)  
**Estimated Time:** 2-3 hours  
**Dependencies:** All features complete

**Acceptance Criteria:**

- [ ] Migration guide: default → schemas-with-metadata
- [ ] Migration guide: schemas-only → types-only
- [ ] Migration guide: v1 → v2 (if applicable)
- [ ] Code examples for each migration
- [ ] Common pitfalls documented
- [ ] All examples tested

**Why This Matters:**

Help users adopt new features:

- Smooth transition path
- Reduce support burden
- Encourage feature adoption
- Build trust

**Implementation Steps:**

[Documentation plan, estimated 2-3 hours]

---

### 6.9 Full Quality Gate Validation

**Status:** Pending  
**Priority:** CRITICAL  
**Estimated Time:** 1-2 hours  
**Dependencies:** All tasks complete

**Acceptance Criteria:**

- [ ] All quality gates pass
- [ ] All tests pass (including new ones)
- [ ] No new lint errors
- [ ] Documentation complete
- [ ] Examples working
- [ ] Ready for release

**Validation Steps:**

```bash
pnpm format
pnpm build
pnpm type-check
pnpm test -- --run
pnpm lint
```

**Output:**

- Phase 3 complete summary
- All features documented
- All tests passing
- Ready for Phase 4 or release

---

## Summary

### Total Estimated Time

- **Phase 3A (Tooling):** 4-5 hours
- **Phase 3B (DX):** 11-14 hours
- **Phase 3C (Testing):** 7-9 hours
- **Phase 3D (Polish):** 3-4 hours
- **Total:** 25-32 hours (3-4 weeks)

### Deliverables

1. **Tooling Improvements:**
    - Config file support (cosmiconfig)
    - Bundle size analysis
    - Watch mode

2. **Developer Experience:**
    - Discriminated union errors
    - Configurable status codes

3. **Testing Maturity:**
    - Type-level testing (tstyche)
    - MSW integration tests

4. **Documentation:**
    - Migration guides
    - Updated README
    - Examples

5. **OpenAPI Multi-Version Support (Phase 3E - Post-ts-morph):**
    - Full OAS 3.0, 3.1, and 3.2 support
    - Auto-detection with user override
    - Version-specific schema generation
    - ~85 new tests
    - Comprehensive documentation

### Benefits

**For All Users:**

- Industry-standard config files
- Performance visibility (bundle analysis)
- Better development workflow (watch mode)
- Type-safe error handling
- Comprehensive testing

**Impact:**

- 25-32 hours investment
- Massive DX improvements
- Professional polish
- Better testing coverage
- Easier adoption

---

## Next Steps

1. **Complete Phase 2 prerequisites:**
    - Type assertions eliminated
    - Dependencies updated

2. **Begin Phase 3A:**
    - Start with config file support (quick win)
    - Follow with bundle analysis
    - Both are 2-3 hours each

3. **Continue with Phase 3B and 3C:**
    - Pick tasks based on priority
    - Follow TDD strictly
    - Maintain quality gates

---

## Phase 3E: Multi-Version OpenAPI Support (After ts-morph Emitter)

### Overview

**Status:** Future Planning (Post-ts-morph)
**Priority:** HIGH (Stakeholder Requirement)
**Estimated Time:** 22-31 hours (~3-4 weeks)
**Prerequisites:**

- ✅ Phase 2 complete (dependencies updated, type safety achieved)
- ⏳ ts-morph emitter migration complete (Task 3.2+)
- 📋 Phase 2B complete (recommended - validates architecture)

**Rationale for Deferral:**

This work is intentionally deferred until after the ts-morph emitter migration because:

1. **AST-based generation makes version handling 45% faster** to implement
2. **String-based implementation would require full rewrite** after ts-morph
3. **CodeMeta elimination** (part of ts-morph migration) conflicts with current type system changes
4. **Foundation first:** MCP enhancements provide higher immediate value

### Current State (Post-Task 2.1)

- ✅ **Runtime:** Full OAS 3.0 & 3.1 support verified by comprehensive tests
- ⚠️ **Types:** Hard-coded to `openapi3-ts/oas30` for simplicity
- ⚠️ **User Control:** Cannot explicitly opt into 3.1-specific features
- ⏳ **OAS 3.2:** Spec schemas available, implementation pending ecosystem maturity

**Key Insight:** The codebase already handles all critical OAS 3.0 and 3.1 features at runtime, despite TypeScript type warnings. This is a pragmatic choice that works for 95% of real-world APIs.

### Proposed Implementation Strategy

**Approach:** User-configurable version with auto-detection (Option 3 from OAS_VERSION_STRATEGY.md)

**Key Features:**

1. **Auto-detection** from `openapi` field in spec (default)
2. **User override** via `--oas-version` CLI flag / `oasVersion` API option
3. **Type-safe generation** using conditional types based on version
4. **Template support** across all templates for all versions
5. **Parametrized testing** for version parity validation

**Architecture with ts-morph:**

```typescript
// Version detection and context
interface GenerationContext {
    oasVersion: "3.0" | "3.1" | "3.2";
    types: typeof oas30 | typeof oas31 | typeof oas32;
    sourceFile: ts.SourceFile;
}

// AST-based version-specific generation
function generateSchema(schema: SchemaObject, ctx: GenerationContext): ts.Node {
    // Conditional logic based on version
    // AST manipulation instead of string concatenation
    // Type-safe, refactor-friendly
}
```

### Major Tasks (High-Level)

**Task 3.E.1: Version Detection & Configuration (2-3 hours)**

- `detectOASVersion()` function
- CLI flag: `--oas-version <version>`
- API option: `oasVersion?: "3.0" | "3.1" | "3.2" | "auto"`
- Default: auto-detect from spec

**Task 3.E.2: Version-Aware Type Imports (3-4 hours)**

- Generation context includes OAS version
- Type imports adapt: `oas30` vs `oas31` vs `oas32`
- Schema processing respects version-specific features

**Task 3.E.3: Version-Specific Schema Generation (6-8 hours)**

- Exclusive bounds: boolean (3.0) vs numeric (3.1+)
- Nullable: `nullable: true` (3.0) vs `type: ["string", "null"]` (3.1+)
- Type arrays: OAS 3.1+ feature
- `const`, `if/then/else` keywords: OAS 3.1+ features

**Task 3.E.4: OAS 3.2 Support (4-6 hours, when available)**

- Pending `openapi3-ts` adding `oas32` namespace
- Monitor quarterly for ecosystem maturity
- Implementation ready when spec finalizes

**Task 3.E.5: Documentation & Migration Guide (3-4 hours)**

- README with version support details
- Feature comparison table (3.0 vs 3.1 vs 3.2)
- Migration guides between versions
- CLI examples and programmatic API docs

**Task 3.E.6: Testing (4-6 hours)**

- ~85 new tests (50 core + 20 version-specific + 15 parity)
- Parametrized tests for all versions
- Feature parity validation (same validation, different syntax)

### Key Version Differences to Handle

| Feature            | OAS 3.0               | OAS 3.1                                      | OAS 3.2     |
| ------------------ | --------------------- | -------------------------------------------- | ----------- |
| `exclusiveMinimum` | `boolean` + `minimum` | `number` (standalone)                        | `number`    |
| `exclusiveMaximum` | `boolean` + `maximum` | `number` (standalone)                        | `number`    |
| Null values        | `nullable: true`      | `type: "null"` or `type: ["string", "null"]` | Same as 3.1 |
| Type arrays        | ❌ Not standard       | ✅ `type: ["string", "number"]`              | ✅          |
| `const` keyword    | ❌                    | ✅ JSON Schema                               | ✅          |
| `if`/`then`/`else` | ❌                    | ✅ JSON Schema                               | ✅          |

### Why ts-morph Makes This 45% Faster

**With ts-morph (this plan):**

- AST nodes naturally support conditionals
- Type-safe version context propagates through generation
- No string concatenation or template manipulation
- Tests can snapshot AST structure per version
- Refactoring tools understand the code structure
- **Estimated:** 22-31 hours

**Without ts-morph (not recommended):**

- Complex union types everywhere (93 files)
- String-based version handling (fragile)
- High rework risk when migrating to ts-morph
- Test complexity exponentially higher
- **Estimated:** 40-60 hours + full rewrite later

### Success Criteria

**Technical:**

- ✅ All OAS versions supported (3.0, 3.1, 3.2)
- ✅ Auto-detection works correctly (95%+ of specs)
- ✅ Version-specific features implemented
- ✅ All ~85 new tests passing
- ✅ No regressions in existing tests

**User Experience:**

- ✅ Zero breaking changes for existing users
- ✅ Auto-detection "just works"
- ✅ Clear error messages for unsupported versions
- ✅ Documentation comprehensive and clear

**Quality:**

- ✅ Test coverage >95% for version-specific code
- ✅ No new lint errors
- ✅ Performance impact <5%

### Reference Documents

- **OAS Version Strategy:** `.agent/analysis/OAS_VERSION_STRATEGY.md` - Strategic options analysis
- **Runtime Verification:** `.agent/analysis/OAS_RUNTIME_SUPPORT_VERIFICATION.md` - Proof of current 3.0/3.1 support
- **Implementation Plan:** This section provides high-level overview; detailed tasks will be refined when ts-morph emitter is complete

### Next Steps (When Ready)

1. Complete Phase 2 core tasks (2.1-2.4, 3.1-3.3)
2. Complete ts-morph emitter migration (Task 3.2+)
3. Complete Phase 2B MCP Enhancements (recommended)
4. Revisit this section with detailed task breakdown
5. Begin implementation with TDD approach

**Note:** By the time we reach this phase, architecture and tooling will have evolved significantly. This high-level plan will be reviewed and refined based on learnings from ts-morph migration and MCP enhancements.

---

**This plan complements Phase 2 and Phase 2B. Execute after core work is complete.**
