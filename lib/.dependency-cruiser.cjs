/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    /*
     * ============================================================================
     * ARCHITECTURAL DOMAIN BOUNDARIES (ADR-036)
     * ============================================================================
     *
     * These rules enforce strict domain-driven encapsulation using dependency-cruiser.
     * When a directory represents a "Bounded Context", it MUST expose a public API
     * via an `index.ts` barrel file. All internal implementation files inside that
     * directory are considered PRIVATE and cannot be imported by external domains.
     *
     * WHY THIS MATTERS (The Feedback Signal):
     * 1. THE INTENT IS MAXIMIZING SIGNAL: This tool exists to support architectural excellence and the best possible developer experience (human and AI) by revealing structural truths.
     * 2. Prevents "Leaky Abstractions" where internal types entangle the global graph.
     * 3. Eradicates massive "Out of Memory" (OOM) crashes in bundlers like tsup/rollup
     *    by keeping the type-graph shallow and narrow.
     * 4. Forces deliberate API design—if it's not explicitly exported from the barrel
     *    file, it's not meant for public consumption.
     *
     * HOW TO FIX A VIOLATION:
     * - Do NOT ignore the rule or modify this regex config to "hide" the problem. Hiding problems is actively harmful to the repository. The tool is acting in service of revealing architectural flaws.
     * - Export the needed symbol from the domain's root `index.ts` file if it should be public.
     * - If the symbol is truly internal, refactor the code so the external domain doesn't need it.
     * - If two domains deeply share internal logic, extract that logic to a common `shared/` layer.
     *
     * Note: The `pathNot: '(^|/)index\\.(ts|js)$'` regex below allows any internal file named `index.ts` to be imported.
     * While this technically allows bypassing the *root* barrel file by importing a *nested* barrel file,
     * it correctly flags direct imports of implementation files (e.g. `foo.ts`), which is the vast majority of leaky abstractions.
     * Future refinement should explicitly map exact domain roots to exact barrel files once the domains are fully stabilized.
     */
    {
      name: 'adr-036-encapsulate-ir',
      severity: 'error',
      comment:
        'The IR domain MUST only be accessed via its index.ts barrel files. Bypassing them couples consumers to internal schema/context structures, leading to OOMs.',
      from: { pathNot: '^src/schema-processing/ir/' },
      to: {
        path: '^src/schema-processing/ir/.+',
        pathNot: '^src/schema-processing/ir/index\\.(ts|js)$',
      },
    },
    {
      name: 'adr-036-encapsulate-parsers',
      severity: 'error',
      comment:
        'Parser implementations MUST only be accessed via their specific index.ts barrel files. Bypassing them couples consumers to specific recursive traversal logic.',
      from: { pathNot: '^src/schema-processing/parsers/' },
      to: {
        path: '^src/schema-processing/parsers/.+',
        pathNot: '^src/schema-processing/parsers/[^/]+/index\\.(ts|js)$',
      },
    },
    {
      name: 'adr-036-encapsulate-writers',
      severity: 'error',
      comment:
        'Writer core logic and generators MUST only be accessed via their index.ts barrel files.',
      from: { pathNot: '^src/schema-processing/writers/' },
      to: {
        path: '^src/schema-processing/writers/.+',
        pathNot: '^src/schema-processing/writers/[^/]+/index\\.(ts|js)$',
      },
    },
    {
      name: 'adr-036-encapsulate-context',
      severity: 'error',
      comment:
        'Template context generation logic MUST only be accessed via its index.ts barrel files.',
      from: { pathNot: '^src/schema-processing/context/' },
      to: {
        path: '^src/schema-processing/context/.+',
        pathNot: '^src/schema-processing/context/index\\.(ts|js)$',
      },
    },
    {
      name: 'adr-036-encapsulate-conversion',
      severity: 'error',
      comment: 'Conversion orchestrators MUST only be accessed via their index.ts barrel files.',
      from: { pathNot: '^src/schema-processing/conversion/' },
      to: {
        path: '^src/schema-processing/conversion/.+',
        pathNot: '^src/schema-processing/conversion/[^/]+/index\\.(ts|js)$',
      },
    },
    {
      name: 'no-circular',
      severity: 'error',
      comment:
        'This dependency is part of a circular relationship. You might want to revise your solution (i.e. use dependency inversion, or move the modules to a common place)',
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: 'no-orphans',
      comment:
        "This is an orphan module - it's likely not used (anymore?). Either use it or remove it.",
      severity: 'warn',
      from: {
        orphan: true,
        pathNot: ['(^|/)\\.[^/]+\\.(js|cjs|mjs|ts|json)$', '\\.d\\.ts$', '(^|/)tsconfig\\.json$'],
      },
      to: {},
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
    },
    reporterOptions: {
      dot: {
        collapsePattern: 'node_modules/[^/]+',
      },
      archi: {
        collapsePattern: '^(packages|src|lib|app|bin|test(s?)|spec(s?))/[^/]+',
      },
      text: {
        highlightFocused: true,
      },
    },
  },
};
