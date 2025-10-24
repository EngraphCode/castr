# Handlebars Evaluation

**Date:** October 24, 2025  
**Current Version:** handlebars@4.7.8  
**Status:** Analysis Complete  
**Recommendation:** **EVALUATE ALTERNATIVES** ⚠️ (consider template literals in Phase 3)

---

## Executive Summary

**Package:** `handlebars` v4.7.8  
**Purpose:** Template engine for code generation  
**Last Updated:** **August 1, 2023** (2+ years ago) ⚠️  
**Maintenance Status:** **STALE** (no updates in 2+ years)  
**Current Usage:** 5 template files (201 lines), 3 custom helpers  
**Alternative:** Template literals (native JavaScript)  
**Recommendation:** **KEEP for Phase 2**, **EVALUATE replacement in Phase 3**

---

## Maintenance Status

### Release History

| Version             | Date         | Status       | Age              |
| ------------------- | ------------ | ------------ | ---------------- |
| **4.7.8** (current) | Aug 1, 2023  | **STALE**    | **2+ years ago** |
| 4.7.7               | Feb 15, 2021 | Old          | 4+ years ago     |
| 4.7.6               | Apr 3, 2020  | Old          | 5+ years ago     |
| 4.7.0               | Jan 10, 2020 | Major update | 5+ years ago     |
| 4.0.0               | Sep 1, 2015  | Major        | 10+ years ago    |
| 3.0.0               | Feb 10, 2015 | Legacy       | 10+ years ago    |

**Observations:**

- ⚠️ **Last release: August 1, 2023** (2+ years ago)
- ⚠️ **No maintenance activity** in 2+ years
- ⚠️ **Security concerns** - no recent security patches
- ⚠️ **Created: 2011** - Predates ES6 template literals (2015)
- ⚠️ **v4 branch** - Been on v4.x since 2015 (10 years!)

**Status:** 🟡 **MAINTENANCE MODE / STALE** (concerning for long-term use)

**Weekly Downloads:** ~10 million (still widely used but declining)

---

## Usage Analysis

### Complete Usage Inventory

**Total Files Using Handlebars:** 3 production files + 5 templates

| File                              | Type       | Usage                            |
| --------------------------------- | ---------- | -------------------------------- |
| `getHandlebars.ts`                | Production | Helper registration & setup      |
| `generateZodClientFromOpenAPI.ts` | Production | Template compilation & rendering |
| `index.ts`                        | Production | Export getHandlebars             |
| `templates/default.hbs`           | Template   | 87 lines - main template         |
| `templates/grouped.hbs`           | Template   | 83 lines - grouped strategy      |
| `templates/grouped-common.hbs`    | Template   | 14 lines - grouped common        |
| `templates/schemas-only.hbs`      | Template   | 13 lines - schemas only          |
| `templates/grouped-index.hbs`     | Template   | 4 lines - grouped index          |

**Total Template Lines:** 201 lines

### Detailed Usage

#### 1. getHandlebars.ts (Helper Registration)

**Custom Helpers (3):**

```typescript
// Helper 1: String equality conditional
instance.registerHelper("ifeq", function (a: string, b: string, options: HelperOptions) {
    if (a === b) {
        return options.fn(this); // If branch
    }
    return options.inverse(this); // Else branch
});

// Helper 2: Check if object is non-empty
instance.registerHelper("ifNotEmptyObj", function (obj: Record<string, unknown>, options: HelperOptions) {
    if (typeof obj === "object" && Object.keys(obj).length > 0) {
        return options.fn(this);
    }
    return options.inverse(this);
});

// Helper 3: Convert to camelCase
instance.registerHelper("toCamelCase", function (input: string) {
    const words = input.split(/[\s_-]/);
    return words
        .map((word, index) => {
            if (index === 0) return word.toLowerCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join("");
});
```

**Analysis:**

- 3 custom helpers (simple logic)
- 4 `@ts-expect-error` comments (type safety issues)
- All helpers are simple and could be functions

#### 2. generateZodClientFromOpenAPI.ts (Template Usage)

```typescript
const source = await fs.readFile(templatePath, "utf8");
const hbs = handlebars ?? getHandlebars();
const template = hbs.compile(source);
const output = template(data);
```

**Process:**

1. Read `.hbs` template file
2. Get/create Handlebars instance
3. Compile template
4. Execute with data context
5. Get string output

#### 3. Template Features Used

**Example from default.hbs:**

```handlebars
{{! Variables }}
import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";

{{! Conditionals }}
{{#if imports}}
{{#each imports}}
import { {{{@key}}} } from "./{{{this}}}"
{{/each}}
{{/if}}

{{! Each loops with @key and @root }}
{{#each schemas}}
const {{@key}}{{#if (lookup ../emittedType @key)}}: z.ZodType<{{@key}}>{{/if}} = {{{this}}};
{{/each}}

{{! Custom helper }}
{{#ifeq status "default" }}
status: "default",
{{else}}
status: {{status}},
{{/ifeq}}

{{! Nested conditionals }}
{{#if @root.options.withAlias}}
{{#if alias}}
alias: "{{alias}}",
{{/if}}
{{/if}}
```

**Features Used:**

- Variables: `{{variable}}`, `{{{unescaped}}}`
- Conditionals: `{{#if}}`, `{{else}}`
- Loops: `{{#each}}`
- Built-ins: `@key`, `@root`, `lookup`
- Custom helpers: `ifeq`, `ifNotEmptyObj`, `toCamelCase`

---

## Why Handlebars Exists (Historical Context)

**Created:** 2011 (14 years ago!)  
**Context at Creation:**

- No ES6 template literals (came in 2015)
- No template string interpolation
- String concatenation was the only option
- Handlebars provided clean template syntax

**Modern Context (2025):**

- ES6 template literals (10 years old)
- Tagged template literals
- Native string interpolation
- Better IDE support for native features
- No external dependency needed

---

## Alternative: Template Literals

### Current Approach (Handlebars)

**Pros:**

- ✅ Familiar syntax (mustache-style)
- ✅ Clean separation of templates
- ✅ Logic-less templates (debatable)
- ✅ Already working
- ✅ Users can provide custom templates

**Cons:**

- ❌ Stale dependency (2+ years)
- ❌ Security concerns (no updates)
- ❌ Type safety issues (4 `@ts-expect-error`)
- ❌ External dependency (~500KB)
- ❌ Slower than native strings
- ❌ Additional learning curve
- ❌ Compilation overhead

### Alternative: Template Literals

**Pros:**

- ✅ Native JavaScript (no dependency)
- ✅ Better performance (no compilation)
- ✅ Full TypeScript support (no `@ts-expect-error`)
- ✅ Better IDE support
- ✅ Easier debugging
- ✅ Smaller bundle size
- ✅ Modern, maintained (language feature)

**Cons:**

- ❌ More verbose (needs helper functions)
- ❌ Mixing logic with templates
- ❌ Users need to provide functions instead of `.hbs` files
- ❌ Migration effort required
- ❌ No direct template file support

---

## Comparison: Handlebars vs Template Literals

### Example Translation

**Current (Handlebars):**

```handlebars
{{#if imports}}
    {{#each imports}}
        import {
        {{{@key}}}
        } from "./{{{this}}}"
    {{/each}}
{{/if}}
```

**Alternative (Template Literals):**

```typescript
const renderImports = (imports: Record<string, string>) => {
    if (!imports || Object.keys(imports).length === 0) return "";

    return Object.entries(imports)
        .map(([key, value]) => `import { ${key} } from "./${value}"`)
        .join("\n");
};

// Usage:
`${renderImports(data.imports)}`;
```

### Complexity Comparison

| Feature          | Handlebars              | Template Literals                   | Winner               |
| ---------------- | ----------------------- | ----------------------------------- | -------------------- |
| Simple variables | `{{name}}`              | `${name}`                           | Tie                  |
| Conditionals     | `{{#if}}...{{/if}}`     | `${condition ? '...' : ''}`         | Handlebars (cleaner) |
| Loops            | `{{#each}}...{{/each}}` | `${items.map(i => ...).join('\n')}` | Handlebars (cleaner) |
| Performance      | Slower (compile)        | ✅ Faster (native)                  | Template Literals    |
| Type Safety      | ❌ Poor                 | ✅ Excellent                        | Template Literals    |
| Bundle Size      | ❌ ~500KB               | ✅ 0KB                              | Template Literals    |
| Maintenance      | ❌ Stale                | ✅ Language                         | Template Literals    |
| Learning Curve   | Medium                  | ✅ Low (JS)                         | Template Literals    |
| IDE Support      | ❌ Limited              | ✅ Full                             | Template Literals    |
| Debugging        | ❌ Harder               | ✅ Easier                           | Template Literals    |
| Separation       | ✅ Clean files          | ❌ Mixed                            | Handlebars           |

**Verdict:** **Mixed** - Handlebars is cleaner for complex templates, but template literals are faster, more modern, and have better tooling.

---

## Migration Complexity

### Effort Estimate

**To replace Handlebars with template literals:**

1. **Convert templates** (5 files, 201 lines)
    - Estimated: 4-8 hours
    - Create function per template
    - Convert Handlebars syntax to template literals
    - Extract helper functions

2. **Create helper library**
    - Estimated: 2-3 hours
    - Conditional helpers
    - Loop helpers
    - String transformation helpers

3. **Update API**
    - Estimated: 1-2 hours
    - Change `templatePath` to accept function or string
    - Update documentation
    - Maintain backward compatibility?

4. **Testing**
    - Estimated: 2-4 hours
    - Update snapshot tests
    - Verify output identical
    - Test all template strategies

5. **Documentation**
    - Estimated: 1-2 hours
    - Update README
    - Add migration guide
    - Update examples

**Total Effort:** 10-19 hours (1.5-2.5 weeks)

### Breaking Changes

**If we replace Handlebars:**

- ✅ **Generated code unchanged** (users not affected)
- ⚠️ **Custom templates break** (users providing `.hbs` files)
- ⚠️ **Breaking change** if users use `getHandlebars`
- ⚠️ **API changes** if we remove handlebars parameter

**Mitigation:**

- Support both approaches (handlebars + template functions)
- Provide migration guide
- Deprecate handlebars option in v2, remove in v3

---

## Template Literal Implementation Example

### Helper Library

```typescript
// lib/src/templateHelpers.ts

export const conditional = (condition: boolean, thenBlock: string, elseBlock: string = "") => {
    return condition ? thenBlock : elseBlock;
};

export const each = <T>(items: T[] | Record<string, T>, fn: (item: T, key: string | number) => string): string => {
    if (Array.isArray(items)) {
        return items.map((item, index) => fn(item, index)).join("");
    }
    return Object.entries(items)
        .map(([key, value]) => fn(value, key))
        .join("");
};

export const ifeq = (a: unknown, b: unknown, thenBlock: string, elseBlock: string = "") => {
    return a === b ? thenBlock : elseBlock;
};

export const ifNotEmptyObj = (obj: Record<string, unknown>, thenBlock: string, elseBlock: string = "") => {
    return typeof obj === "object" && Object.keys(obj).length > 0 ? thenBlock : elseBlock;
};

export const toCamelCase = (input: string): string => {
    if (/^[a-z][a-zA-Z0-9]*$/.test(input)) return input;
    const words = input.split(/[\s_-]/);
    return words
        .map((word, index) => {
            if (index === 0) return word.toLowerCase();
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        })
        .join("");
};
```

### Default Template (Converted)

```typescript
// lib/src/templates/default.ts
import type { TemplateContext } from "../template-context.js";
import { conditional, each, ifeq, ifNotEmptyObj } from "../templateHelpers.js";

export const defaultTemplate = (data: TemplateContext): string =>
    `
import { makeApi, Zodios, type ZodiosOptions } from "@zodios/core";
import { z } from "zod";

${conditional(!!data.imports, each(data.imports, (path, name) => `import { ${name} } from "./${path}"`).join("\n"))}

${conditional(!!data.types, each(data.types, (type) => `${type};`).join("\n"))}

${each(
    data.schemas,
    (schema, name) => `const ${name}${data.emittedType[name] ? `: z.ZodType<${name}>` : ""} = ${schema};`
).join("\n")}

${ifNotEmptyObj(
    data.schemas,
    `
export const schemas = {
${each(data.schemas, (_schema, name) => `\t${name},`).join("\n")}
};
`
)}

const endpoints = makeApi([
${each(
    data.endpoints,
    (endpoint) => `\t{
\t\tmethod: "${endpoint.method}",
\t\tpath: "${endpoint.path}",
${conditional(data.options?.withAlias && endpoint.alias, `\t\talias: "${endpoint.alias}",`)}
${conditional(!!endpoint.description, `\t\tdescription: \`${endpoint.description}\`,`)}
${conditional(!!endpoint.requestFormat, `\t\trequestFormat: "${endpoint.requestFormat}",`)}
${conditional(
    !!endpoint.parameters,
    `\t\tparameters: [
${each(
    endpoint.parameters,
    (param) => `\t\t\t{
\t\t\t\tname: "${param.name}",
${conditional(!!param.description, `\t\t\t\tdescription: \`${param.description}\`,`)}
${conditional(!!param.type, `\t\t\t\ttype: "${param.type}",`)}
\t\t\t\tschema: ${param.schema}
\t\t\t},`
).join("\n")}
\t\t],`
)}
\t\tresponse: ${endpoint.response},
${conditional(
    endpoint.errors.length > 0,
    `\t\terrors: [
${each(
    endpoint.errors,
    (error) => `\t\t\t{
${ifeq(error.status, "default", `\t\t\t\tstatus: "default",`, `\t\t\t\tstatus: ${error.status},`)}
${conditional(!!error.description, `\t\t\t\tdescription: \`${error.description}\`,`)}
\t\t\t\tschema: ${error.schema}
\t\t\t},`
).join("\n")}
\t\t]`
)}
\t},`
).join("\n")}
]);

export const ${data.options.apiClientName} = new Zodios(${data.options.baseUrl ? `"${data.options.baseUrl}", ` : ""}endpoints);

export function createApiClient(baseUrl: string, options?: ZodiosOptions) {
    return new Zodios(baseUrl, endpoints, options);
}
`.trim();
```

**Analysis:**

- ✅ Type-safe (no `@ts-expect-error`)
- ✅ Better IDE support
- ⚠️ More verbose
- ⚠️ Whitespace management harder

---

## Risk Assessment

### MEDIUM RISK ⚠️

**Risks:**

1. **Security** - No updates in 2+ years, potential vulnerabilities
2. **Maintenance** - Package appears abandoned or in deep maintenance
3. **Type Safety** - Requires `@ts-expect-error` workarounds
4. **Performance** - Compilation overhead vs native strings
5. **Bundle Size** - ~500KB dependency

**But:**

- ✅ Works correctly today
- ✅ No known critical bugs
- ✅ Widely used (10M downloads/week)
- ✅ Users can provide custom `.hbs` templates

### Mitigation Strategies

1. **Monitor** for security advisories
2. **Plan migration** to template literals in Phase 3
3. **Fork if needed** (last resort)
4. **Dual support** (handlebars + template functions)
5. **Document risk** for users

---

## Recommendation: KEEP (Phase 2), ts-morph Emitter (Phase 3/4) 🎯

### Phase 2 (Current): KEEP ✅

**Rationale:**

1. **Works today** - No immediate issues
2. **Not blocking** - Doesn't prevent extraction
3. **Low priority** - Phase 2 has higher priorities
4. **Users depend on it** - Custom template support
5. **Effort too high** - 10-19 hours for replacement

**Action:** ✅ Keep handlebars@4.7.8, no changes

### Phase 3/4: ts-morph EMITTER ARCHITECTURE (RECOMMENDED) 🚀

**Reference:** `.agent/reference/openapi-zod-client-emitter-migration.md`

A **third and superior option** exists beyond Handlebars vs Template Literals:

#### The Emitter Approach

Instead of string-based templates, use **AST-based code generation**:

```typescript
// Intermediate Representation
interface FileUnit {
    path: string;
    imports: ImportSpec[];
    declarations: Decl[]; // zodSchema | tsTypeAlias | tsInterface | const | client
}

// Emit with ts-morph
await emitFilesTsMorph(files, { runPrettier });
```

#### Why This Is Better

| Aspect         | Handlebars         | Template Literals | **ts-morph Emitter**    |
| -------------- | ------------------ | ----------------- | ----------------------- |
| Type Safety    | ❌ Poor            | ⚠️ String-based   | ✅ **AST-based**        |
| Refactoring    | ⚠️ Fragile         | ⚠️ Fragile        | ✅ **Structural**       |
| Custom outputs | ⚠️ `.hbs` files    | ❌ Fork repo      | ✅ **Plugin API**       |
| Extensibility  | ⚠️ Limited         | ❌ Rigid          | ✅ **Pluggable**        |
| IDE Support    | ❌ Limited         | ✅ Good           | ✅ **Excellent**        |
| Debugging      | ❌ Runtime strings | ⚠️ String errors  | ✅ **Type errors**      |
| Bundle Size    | ❌ ~500KB          | ✅ 0KB            | ⚠️ +ts-morph (~6MB dev) |
| Maintenance    | ❌ Stale           | ✅ Native         | ✅ **Active**           |

#### Key Benefits

1. **Type-Safe Generation**
    - Construct TypeScript AST nodes, not strings
    - Impossible to generate invalid syntax
    - Full TypeScript compiler guarantees

2. **Pluggable Architecture**
    - Current `.hbs` templates → Built-in strategy emitters
    - Custom templates → **Emitter plugins** (JS modules)
    - Users can extend without forking

3. **Clean Separation**
    - OpenAPI parsing → IR (`FileUnit[]`) → Emitter
    - Each strategy is a pure function: `IR → FileUnit[]`
    - Emitter is strategy-agnostic

4. **Better DX**
    - IDE autocomplete for IR structures
    - Type errors at compile time, not runtime
    - Easy to test (compare IR, not strings)

#### Implementation Path

1. **Introduce IR model** alongside Handlebars (4-6 hours)
    - `FileUnit`, `ImportSpec`, `Decl` types
    - Build IR from existing template context

2. **Implement emitter** for one strategy (8-12 hours)
    - Start with `default` template
    - Verify output matches (golden tests)
    - Use `ts-morph` for convenience

3. **Migrate remaining strategies** (6-8 hours)
    - `grouped`, `grouped-common`, `schemas-only`
    - Each strategy becomes a builder function

4. **Add plugin API** (4-6 hours)
    - `--template path/to/emitter-plugin.js`
    - Plugin exports: `function apply(ir, options): FileUnit[]`

5. **Deprecate Handlebars** (v3.0 breaking change)
    - Document migration path
    - Support both in v2.x

**Total Effort:** 22-32 hours (1-1.5 sprints)

#### When to Implement

- **Phase 3:** If users need custom template extensibility
- **Phase 4:** As architectural improvement for maintainability
- **Phase 5:** If generation complexity increases (MCP, additional outputs)

**Decision:** This is the **architecturally superior** long-term solution. Much better than either Handlebars or template literals for a code generation tool.

### Phase 3: EVALUATE Template Literals (LOWER PRIORITY) ⚠️

**Consider quick template literal migration if:**

1. Security vulnerability discovered (immediate fix needed)
2. Compatibility issues with newer Node.js
3. Can't justify ts-morph effort yet
4. Need quick win without architectural change

**Decision Criteria:**

| Factor                      | Keep Handlebars       | Migrate to Template Literals |
| --------------------------- | --------------------- | ---------------------------- |
| Security vuln found         | ❌                    | ✅ Migrate                   |
| Users need custom templates | ✅ Keep (with option) | ⚠️ Support both              |
| Performance critical        | ❌                    | ✅ Migrate                   |
| Type safety issues          | ❌                    | ✅ Migrate                   |
| Maintenance burden high     | ❌                    | ✅ Migrate                   |
| Just working fine           | ✅ Keep               | ❌ Don't migrate             |

### Phase 4: OPTIONAL ENHANCEMENT

**If migrating:**

1. Support **both** approaches
    - Keep handlebars for backward compat
    - Add template function option
    - Users choose preferred approach

2. Deprecation path
    - v2.0: Support both, recommend template functions
    - v3.0: Remove handlebars (breaking change)

3. Migration guide
    - Convert `.hbs` to functions
    - Helper library examples
    - Backward compat strategy

---

## Action Items

### Phase 2 (Current)

- [x] ✅ **Keep handlebars@4.7.8** (no changes)
- [x] ✅ **Evaluate ts-morph emitter** as superior alternative
- [ ] Document in README that handlebars is used
- [ ] Note maintenance status in docs

### Phase 3 (Evaluation)

- [ ] **Gather user feedback** on custom template needs
- [ ] **Assess generation complexity** (MCP, multiple outputs)
- [ ] **Decide on emitter investment** (22-32 hours)
- [ ] If needed urgently: Quick POC with template literals (2-4 hours)
- [ ] Document decision in `.agent/analysis/HANDLEBARS_MIGRATION_DECISION.md`

### Phase 4 (ts-morph Emitter - RECOMMENDED)

- [ ] **Introduce IR model** (`FileUnit`, `ImportSpec`, `Decl`)
- [ ] **Implement emitter** for `default` strategy with ts-morph
- [ ] **Migrate remaining strategies** (`grouped`, `schemas-only`, etc.)
- [ ] **Add plugin API** (`--template path/to/plugin.js`)
- [ ] **Golden test validation** (output equivalence)
- [ ] **Documentation** (plugin guide, migration notes)

### Phase 5 (Deprecation)

- [ ] **v2.x:** Support both Handlebars and emitter
- [ ] **v2.x:** Document migration path for users
- [ ] **v3.0:** Remove Handlebars (breaking change)
- [ ] **v3.0:** Plugin API as primary extensibility

---

## Decision Tree

```
Phase 3/4: Should we replace Handlebars?
    |
    ├─ Is there a security vulnerability?
    |   ├─ YES → Quick fix: Template literals OR ts-morph emitter
    |   └─ NO → Continue evaluation
    |
    ├─ Do users need better extensibility?
    |   ├─ YES → ts-morph emitter with plugin API (22-32h)
    |   └─ NO → Continue evaluation
    |
    ├─ Is generation complexity increasing?
    |   ├─ YES → ts-morph emitter (type-safe, maintainable)
    |   └─ NO → Continue evaluation
    |
    ├─ Do we need better type safety?
    |   ├─ YES → ts-morph emitter (best) > Template literals (ok)
    |   └─ NO → Continue evaluation
    |
    ├─ Can we invest 22-32 hours?
    |   ├─ YES → ts-morph emitter (long-term value)
    |   ├─ NO, but 10-19h ok → Template literals (quick fix)
    |   └─ NO time → KEEP Handlebars and monitor
    |
    └─ Is current approach working fine?
        ├─ YES → KEEP and re-evaluate later
        └─ NO → Choose migration path based on needs
```

---

## Success Criteria

**For Keeping Handlebars (Phase 2):**

- ✅ No security vulnerabilities
- ✅ Works with current Node.js
- ✅ Type issues acceptable
- ✅ Performance acceptable
- ✅ Users satisfied with `.hbs` templates
- ✅ Not blocking extraction

**For ts-morph Emitter (Phase 4 - RECOMMENDED):**

- ✅ IR model (`FileUnit`) designed and documented
- ✅ Emitter implementation with ts-morph
- ✅ All strategies migrated (default, grouped, schemas-only)
- ✅ Plugin API for custom templates
- ✅ Golden tests passing (output equivalence)
- ✅ Type safety: No `@ts-expect-error` needed
- ✅ Documentation complete (plugin guide, migration notes)
- ✅ Performance equal or better
- ✅ Dual support in v2.x (Handlebars + emitter)

**For Template Literals (Phase 3 - ALTERNATIVE):**

- ✅ Template function version implemented
- ✅ All tests passing
- ✅ Output identical to handlebars version
- ✅ Performance equal or better
- ✅ Type safety improved (no `@ts-expect-error`)
- ✅ Migration guide complete
- ✅ Backward compatibility maintained (dual support)

---

## Estimated Effort

| Scenario                                | Duration              |
| --------------------------------------- | --------------------- |
| **Keep (Phase 2)**                      | **0 hours** (no work) |
| POC template literals (Phase 3)         | 2-4 hours             |
| **Template literal replacement**        | **10-19 hours**       |
| **ts-morph emitter (RECOMMENDED)**      | **22-32 hours**       |
| - IR model design                       | 4-6 hours             |
| - Emitter implementation                | 8-12 hours            |
| - Strategy migration                    | 6-8 hours             |
| - Plugin API                            | 4-6 hours             |
| Dual support (Handlebars + new)         | +5-8 hours            |
| Documentation & migration guide         | 2-4 hours             |
| **Total (ts-morph with dual support)**  | **29-44 hours**       |
| **Total (template literals with dual)** | **17-31 hours**       |

---

## Related Tasks

- **Task 1.2-1.6:** ✅ COMPLETE - Other dependency evaluations
- **Phase 2:** KEEP handlebars (no changes)
- **Phase 3 (NEW):** Evaluate handlebars replacement
- **Phase 4 (OPTIONAL):** Migrate to template literals

---

## References

**Handlebars:**

- GitHub: https://github.com/handlebars-lang/handlebars.js
- Created: 2011 (14 years ago)
- Last commit: ~2023 (2+ years ago)
- NPM: ~10M downloads/week

**Template Literals:**

- ES6 Feature: 2015 (10 years old)
- Native to JavaScript
- Excellent IDE support
- No external dependency

**ts-morph:**

- GitHub: https://github.com/dsherret/ts-morph
- TypeScript AST manipulation library
- Built on TypeScript Compiler API
- Active maintenance, excellent documentation
- NPM: ~6M downloads/week

**Reference Document:**

- `.agent/reference/openapi-zod-client-emitter-migration.md`
- Complete migration guide for emitter architecture
- Includes IR model, emitter implementation, plugin API
- Shows example conversions and testing strategy

**Similar Projects Using Emitters:**

- `@typespec/compiler` - Uses TypeScript factory API for code generation
- `prisma` - Generates TypeScript clients with AST-based approach
- `graphql-code-generator` - Plugin architecture with programmatic generation
- Type-safe codegen is industry best practice for 2025

---

## Final Recommendation

**Phase 2:** ✅ **KEEP handlebars@4.7.8** (no changes)  
**Phase 3/4:** 🚀 **PLAN ts-morph emitter** (architecturally superior)  
**Phase 3 (Alt):** ⚠️ **EVALUATE template literals** (quick fix if needed)  
**Phase 4+:** 📋 **IMPLEMENT emitter** with plugin API (22-32 hours)

**Justification:**

1. **Not urgent** - Handlebars works today, no critical issues
2. **Phase 2 priorities** - Type assertions and dependency updates more important
3. **Better long-term solution exists** - ts-morph emitter is architecturally superior
4. **Skip template literals** - Avoid intermediate step, go straight to emitter
5. **Re-evaluate Phase 3/4** - Based on user needs and generation complexity

**Three Options Compared:**

| Criteria            | Handlebars (Keep) | Template Literals | **ts-morph Emitter** |
| ------------------- | ----------------- | ----------------- | -------------------- |
| **Phase 2 Ready**   | ✅ Yes            | ❌ No (10-19h)    | ❌ No (22-32h)       |
| **Type Safety**     | ❌ Poor           | ⚠️ Better         | ✅ **Best**          |
| **Extensibility**   | ⚠️ Limited        | ❌ Rigid          | ✅ **Plugin API**    |
| **Maintenance**     | ❌ Stale          | ✅ Native         | ✅ **Active**        |
| **Long-term Value** | ❌ Low            | ⚠️ Medium         | ✅ **High**          |
| **User Impact**     | ✅ None           | ⚠️ Breaking       | ✅ **Better UX**     |

**Recommended Path:**

1. **Phase 2:** Keep Handlebars (focus on blockers)
2. **Phase 3:** Evaluate user needs for custom templates
3. **Phase 4:** Implement ts-morph emitter with plugin API
4. **Phase 5:** Deprecate Handlebars (v3.0 breaking change)

**When to migrate to ts-morph emitter:**

- ✅ Users need better custom template extensibility
- ✅ Generation complexity increases (MCP, multiple outputs)
- ✅ Type safety becomes critical
- ✅ Ready to invest 22-32 hours for architectural improvement

**When to keep Handlebars (skip emitter):**

- ✅ No extensibility requests from users
- ✅ Generation stays simple (single output strategy)
- ✅ Migration effort not justified by benefits
- ✅ No issues arise

---

**Next Steps:**

1. ✅ **Task 1.7 COMPLETE** - Handlebars evaluation with ts-morph analysis
2. ⏳ **Phase 2** - Continue with planned tasks (keep handlebars, no changes)
3. ⏳ **Phase 3** - Evaluate user needs for custom templates & extensibility
4. ⏳ **Phase 4** - Plan ts-morph emitter implementation (22-32 hours)
5. ⏳ **Phase 5** - Implement emitter with plugin API, deprecate Handlebars (v3.0)
