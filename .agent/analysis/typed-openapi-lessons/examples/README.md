# Code Examples Directory

This directory contains Level 3 documentation: **concrete implementation examples** referenced throughout the domain documents.

---

## 📁 Structure

Examples are numbered according to the section they support:

```
examples/
├── 01-box-pattern.ts                    # Architecture: Box pattern
├── 02-box-transformations.ts            # Architecture: AST transformations
├── 03-box-types.ts                      # Architecture: Box type system
├── 04-ast-architecture.ts               # Architecture: Full AST implementation
├── 05-factory-pattern.ts                # Architecture: Factory basics
├── 06-zod-factory.ts                    # Architecture: Complete Zod factory
├── 07-multi-runtime.ts                  # Architecture: Multi-runtime support
├── 08-composition.ts                    # Architecture: Functional composition
├── 09-performance-benchmark.ts          # Performance: Benchmarking
├── 10-types-only-template.hbs           # Performance: Type-only template
├── 11-hybrid-mode.ts                    # Performance: Types + Zod hybrid
├── 12-smart-file-strategy.ts            # Performance: File strategy logic
├── 13-lazy-schema-resolution.ts         # Performance: Lazy loading
├── 14-selective-validation.ts           # Performance: On-demand validation
├── 15-performance-monitoring.ts         # Performance: Metrics tracking
├── 16-headless-client.ts                # API Design: Headless pattern
├── 17-fetcher-implementations.ts        # API Design: Various fetchers
├── 18-enhanced-headless-client.ts       # API Design: Full headless client
├── 19-discriminated-unions.ts           # API Design: Union errors
├── 20-configurable-status-codes.ts      # API Design: Status code config
├── 21-generic-request.ts                # API Design: Generic request method
├── 22-tanstack-integration.ts           # API Design: React Query
├── 23-tanstack-generation.ts            # API Design: Generate RQ hooks
├── 24-type-testing.ts                   # Testing: tstyche examples
├── 25-tstyche-setup.md                  # Testing: Setup guide
├── 26-msw-integration-tests.ts          # Testing: MSW integration
├── 27-msw-setup.md                      # Testing: MSW setup
├── 28-snapshot-testing.ts               # Testing: Snapshot tests
├── 29-property-testing.ts               # Testing: Property-based tests
├── 30-modular-exports.ts                # Tooling: Export structure
├── 31-config-file-support.ts            # Tooling: Config files
├── 32-watch-mode.ts                     # Tooling: Watch mode
├── 33-cli-feedback.ts                   # Tooling: Progress reporting
├── 34-plugin-architecture.ts            # Tooling: Plugin system
├── 35-spec-coverage.md                  # Standards: Coverage documentation
├── 36-version-tracking.ts               # Standards: Version metadata
├── 37-feature-flags.ts                  # Standards: Feature flags
├── 38-changelog-template.md             # Standards: Changelog format
├── 39-bundle-analysis.ts                # Deployment: Bundle reporting
├── 40-tree-shaking.ts                   # Deployment: Tree-shaking
├── 41-code-splitting.ts                 # Deployment: Code splitting
├── 42-type-safe-strings.ts              # Code Quality: String building
├── 43-zod-builder.ts                    # Code Quality: Builder pattern
├── 44-error-classes.ts                  # Code Quality: Error types
└── 45-debug-mode.ts                     # Code Quality: Debug logging
```

---

## 🎯 How to Use These Examples

### Level 1: Executive Summary

Start with [../00-EXECUTIVE-SUMMARY.md](../00-EXECUTIVE-SUMMARY.md) for the big picture.

### Level 2: Domain Deep-Dives

Read domain documents for concepts and patterns:

- [01-ARCHITECTURE.md](../01-ARCHITECTURE.md)
- [02-PERFORMANCE.md](../02-PERFORMANCE.md)
- [03-API-DESIGN.md](../03-API-DESIGN.md)
- [04-TESTING.md](../04-TESTING.md)
- [05-TOOLING.md](../05-TOOLING.md)
- [06-STANDARDS.md](../06-STANDARDS.md)
- [07-DEPLOYMENT.md](../07-DEPLOYMENT.md)
- [08-CODE-QUALITY.md](../08-CODE-QUALITY.md)

### Level 3: Code Examples (This Directory)

When implementing a feature:

1. Read the relevant domain document
2. Find the referenced example number
3. Open the example file
4. Adapt the code to your needs

---

## 📝 Example Format

Each example follows this structure:

```typescript
/**
 * Example N: Feature Name
 *
 * Domain: [Architecture|Performance|API Design|Testing|Tooling|Standards|Deployment|Code Quality]
 * Referenced in: [Domain document section]
 *
 * Description: Brief description of what this example demonstrates
 *
 * Key concepts:
 * - Concept 1
 * - Concept 2
 * - Concept 3
 */

// === BEFORE (if applicable) ===
// Show the problem or old approach

// === AFTER ===
// Show the solution or new approach

// === USAGE ===
// Show how to use the code

// === TESTS ===
// Show how to test the code

// === NOTES ===
// Additional context, gotchas, references
```

---

## 🔨 Implementation Status

Examples are organized by:

- ✅ **Complete** - Full working implementation
- 🚧 **Stub** - Placeholder with outline
- 📝 **Reference** - Points to typed-openapi source

**Current status**: 📝 Stubs (ready for implementation)

To implement an example:

1. Review the domain document section
2. Study typed-openapi's implementation (if applicable)
3. Write the complete example
4. Test the example
5. Update status to ✅

---

## 🤝 Contributing Examples

When adding new examples:

1. **Number sequentially** within each domain
2. **Follow the format** above
3. **Make it runnable** (or clearly mark as pseudocode)
4. **Add tests** when applicable
5. **Link from domain doc** using `[examples/NN-name.ts](./examples/NN-name.ts)`

---

## 📚 External References

Some examples reference:

- [typed-openapi source](https://github.com/astahmer/typed-openapi)
- [openapi-zod-client current implementation](../../lib/src/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
- [Zod documentation](https://zod.dev/)
- External libraries (MSW, tstyche, etc.)

---

## 🎓 Learning Path

### For Quick Wins (Examples 30-45)

Focus on tooling, standards, and code quality examples that can be implemented quickly.

### For Architecture Changes (Examples 01-08)

Study these carefully as they represent significant architectural patterns.

### For Performance (Examples 09-15)

Start with type-only mode and lazy resolution for quick performance wins.

### For Testing (Examples 24-29)

Set up type testing and MSW integration for better quality assurance.

---

## ⚠️ Note

These examples are **illustrative**. Some may need adaptation for:

- Your specific use case
- Current openapi-zod-client architecture
- Breaking changes vs backward compatibility
- Performance vs simplicity trade-offs

Always consider the context and trade-offs before implementing.

---

**Ready to implement?** Pick an example, study the pattern, adapt it to your needs, and test thoroughly!
