# 09: Implementation Roadmap

**A practical guide to applying lessons from typed-openapi**

---

## 📋 Overview

This roadmap provides a phased approach to implementing insights from typed-openapi while maintaining openapi-zod-client's core strengths.

**Guiding Principles**:

- ✅ Keep comprehensive OpenAPI spec support
- ✅ Maintain Zod-first focus and deep integration
- ✅ Add flexibility without sacrificing usability
- ✅ Incremental improvements, no big bang rewrites
- ✅ Backward compatibility where possible

---

## 🎯 Phase 1: Quick Wins (1-2 weeks)

**Goal**: High-impact, low-effort improvements that don't require architectural changes

### 1.1 Type-Only Output Mode (3 days)

**What**: Add `--output-mode types` flag for pure TypeScript types

**Why**: 0 KB bundle, instant IDE suggestions, huge performance win

**Implementation**:

1. Create `types-only.hbs` template
2. Add `--output-mode` CLI option
3. Update generation logic to skip Zod when types-only
4. Add tests for type-only output

**Example**: [10-types-only-template.hbs](./examples/10-types-only-template.hbs)

**Success metrics**:

- Type-only mode generates 0-dependency code
- IDE autocomplete <50ms for large APIs
- Users report faster builds

### 1.2 Config File Support (2 days)

**What**: Support `openapi-zod-client.config.ts` files

**Why**: Better DX, version control, easier for teams

**Implementation**:

1. Add cosmiconfig dependency
2. Create `loadConfig()` function
3. Merge CLI flags with config file
4. Add `defineConfig()` helper for type safety
5. Document config file format

**Example**: [31-config-file-support.ts](./examples/31-config-file-support.ts)

**Success metrics**:

- Config files work in monorepos
- CLI flags override config values
- Type-safe config via defineConfig()

### 1.3 Bundle Size Reporting (2 days)

**What**: Show bundle size impact with `--analyze` flag

**Why**: Users need visibility into bundle impact

**Implementation**:

1. Calculate generated code size
2. Look up dependency sizes (can use bundlephobia API)
3. Display formatted table
4. Show optimization suggestions

**Example**: [39-bundle-analysis.ts](./examples/39-bundle-analysis.ts)

**Success metrics**:

- Accurate size reporting
- Actionable optimization tips
- Users make informed decisions

### 1.4 Better Error Messages (3 days)

**What**: Add context, suggestions, and location to errors

**Why**: Faster debugging, better DX

**Implementation**:

1. Create custom error classes
2. Add context to all thrown errors
3. Include suggestions and docs links
4. Add --debug flag for verbose output

**Example**: [44-error-classes.ts](./examples/44-error-classes.ts)

**Success metrics**:

- Errors include actionable suggestions
- Users can self-serve troubleshooting
- Fewer support issues

### 1.5 Tree-Shaking Optimization (2 days)

**What**: Ensure generated code is optimized for tree-shaking

**Why**: Smaller bundles for users

**Implementation**:

1. Audit current output for tree-shaking issues
2. Fix any computed keys or side effects
3. Add `sideEffects: false` to package.json
4. Document best practices

**Example**: [40-tree-shaking.ts](./examples/40-tree-shaking.ts)

**Success metrics**:

- Generated code passes tree-shaking tests
- Users report smaller bundles
- No side effects in generated code

**Phase 1 Deliverables**:

- [ ] Type-only mode working
- [ ] Config file support
- [ ] Bundle analysis command
- [ ] Improved error messages
- [ ] Tree-shaking verified
- [ ] Documentation updated
- [ ] Tests passing

---

## 🚀 Phase 2: Developer Experience (2-4 weeks)

**Goal**: Enhance API and error handling without breaking changes

### 2.1 Discriminated Union Error Handling (1 week)

**What**: Add union-style error responses with status codes

**Why**: Type-safe error handling

**Implementation**:

1. Generate discriminated union types
2. Add `withResponse` option to client methods
3. Generate helper functions
4. Update templates

**Example**: [19-discriminated-unions.ts](./examples/19-discriminated-unions.ts)

**Success metrics**:

- Errors are discriminated by status code
- TypeScript narrows error types correctly
- Switch statements are exhaustive

### 2.2 Configurable Status Codes (3 days)

**What**: Allow customizing success/error status codes

**Why**: Different APIs have different conventions

**Implementation**:

1. Add CLI options: `--success-status-codes`, `--error-status-codes`
2. Update `isMainResponseStatus` and `isErrorStatus` logic
3. Support ranges (e.g., "200-299")
4. Add to config file

**Example**: [20-configurable-status-codes.ts](./examples/20-configurable-status-codes.ts)

**Success metrics**:

- Custom status codes work correctly
- Range syntax supported
- Config file integration works

### 2.3 Watch Mode (2 days)

**What**: Auto-regenerate on OpenAPI spec changes

**Why**: Better development workflow

**Implementation**:

1. Add chokidar dependency
2. Implement --watch flag
3. Add debouncing for rapid changes
4. Show clear feedback on regeneration

**Example**: [32-watch-mode.ts](./examples/32-watch-mode.ts)

**Success metrics**:

- Files regenerate on change
- Debouncing prevents excessive regeneration
- Clear feedback in terminal

### 2.4 Enhanced Headless Client (1 week)

**What**: Improve schemas-with-metadata template with typed methods

**Why**: More flexible than Zodios lock-in

**Implementation**:

1. Generate typed methods from endpoints
2. Add optional validation
3. Support custom fetchers
4. Document migration from Zodios

**Example**: [18-enhanced-headless-client.ts](./examples/18-enhanced-headless-client.ts)

**Success metrics**:

- Headless client is fully typed
- Works with fetch, axios, ky, etc.
- Validation is optional
- Migration guide exists

**Phase 2 Deliverables**:

- [ ] Discriminated unions working
- [ ] Configurable status codes
- [ ] Watch mode functional
- [ ] Enhanced headless client
- [ ] Migration guides written
- [ ] Examples updated
- [ ] Tests passing

---

## 🧪 Phase 3: Quality & Testing (2-3 weeks)

**Goal**: Improve confidence and documentation

### 3.1 Type-Level Testing (3 days)

**What**: Add tstyche for type testing

**Why**: Catch type regressions

**Implementation**:

1. Add tstyche dependency
2. Write type tests for generated code
3. Add to CI pipeline
4. Document type testing approach

**Example**: [24-type-testing.ts](./examples/24-type-testing.ts)

**Success metrics**:

- Type tests cover public APIs
- Type regressions caught in CI
- Type test documentation exists

### 3.2 MSW Integration Tests (4 days)

**What**: Test generated clients against mocked APIs

**Why**: Ensure generated code actually works

**Implementation**:

1. Add MSW dependency
2. Write integration tests
3. Test all templates
4. Test error scenarios

**Example**: [26-msw-integration-tests.ts](./examples/26-msw-integration-tests.ts)

**Success metrics**:

- Integration tests cover key flows
- Tests catch runtime issues
- All templates tested

### 3.3 Example Gallery (5 days)

**What**: Create comprehensive examples

**Why**: Easier onboarding, clearer documentation

**Implementation**:

1. Create examples/ directory
2. Write production-ready examples
3. Add to documentation
4. Include common patterns

**Example**: See [examples/README.md](./examples/README.md)

**Success metrics**:

- Examples cover common use cases
- Examples are copy-pasteable
- Users reference examples

### 3.4 Migration Guides (3 days)

**What**: Document migration paths

**Why**: Help users adopt new features

**Implementation**:

1. Zodios → headless migration
2. v1 → v2 migration
3. Common pitfalls and solutions
4. Version upgrade guides

**Success metrics**:

- Migration guides exist for each path
- Users successfully migrate
- Fewer migration-related issues

**Phase 3 Deliverables**:

- [ ] Type tests implemented
- [ ] MSW integration tests
- [ ] Example gallery complete
- [ ] Migration guides written
- [ ] Performance benchmarks
- [ ] Documentation updated
- [ ] CI/CD enhanced

---

## 🏗️ Phase 4: Architecture (Long-term, 2-3 months)

**Goal**: Future-proof architecture for extensibility

### 4.1 Abstract Representation Layer (3 weeks)

**What**: Introduce AST layer between parsing and generation

**Why**: Enables multi-runtime, transformations, testing

**Implementation**:

1. Design SchemaNode interface
2. Implement OpenAPI → AST parser
3. Keep existing generator as fallback
4. Add feature flag for testing
5. Migrate incrementally

**Example**: [04-ast-architecture.ts](./examples/04-ast-architecture.ts)

**Success metrics**:

- AST layer works in parallel with old code
- No performance regression
- Feature flag allows opt-in

### 4.2 Factory Pattern (2 weeks)

**What**: Refactor to use pluggable factories

**Why**: Easier to extend, cleaner architecture

**Implementation**:

1. Define SchemaFactory interface
2. Implement zodFactory
3. Refactor helpers to use factory
4. Add factory injection to context
5. Keep backward compatibility

**Example**: [06-zod-factory.ts](./examples/06-zod-factory.ts)

**Success metrics**:

- Factory pattern implemented
- Backward compatible
- Easier to add new runtimes

### 4.3 Multi-Runtime Support (4 weeks)

**What**: Support Valibot, ArkType, TypeBox, etc.

**Why**: Broader ecosystem appeal

**Implementation**:

1. Implement additional factories
2. Add --runtime CLI option
3. Update templates
4. Test all runtimes
5. Document differences

**Example**: [07-multi-runtime.ts](./examples/07-multi-runtime.ts)

**Success metrics**:

- Multiple runtimes supported
- Quality parity with Zod output
- Users adopt non-Zod runtimes

### 4.4 Plugin System (2 weeks)

**What**: Allow users to extend generation

**Why**: Community contributions, customization

**Implementation**:

1. Design plugin API
2. Implement plugin hooks
3. Create example plugins
4. Document plugin development

**Example**: [34-plugin-architecture.ts](./examples/34-plugin-architecture.ts)

**Success metrics**:

- Plugin API is stable
- Community plugins exist
- Documentation is clear

**Phase 4 Deliverables**:

- [ ] AST layer implemented
- [ ] Factory pattern adopted
- [ ] Multi-runtime support
- [ ] Plugin system working
- [ ] Performance maintained
- [ ] Documentation complete
- [ ] Community engagement

---

## 📊 Success Metrics

### Quantitative

| Metric                       | Current | Target (Phase 1) | Target (Phase 3) |
| ---------------------------- | ------- | ---------------- | ---------------- |
| **Bundle size (types-only)** | N/A     | 0 KB             | 0 KB             |
| **Bundle size (Zod)**        | 224 KB  | 224 KB           | 180 KB           |
| **IDE autocomplete**         | 120ms   | 50ms             | 15ms             |
| **Generation time**          | 2.5s    | 2.5s             | 1.8s             |
| **Test coverage**            | 75%     | 80%              | 90%              |
| **Type test coverage**       | 0%      | 50%              | 90%              |

### Qualitative

- [ ] Users report better DX
- [ ] Fewer GitHub issues about performance
- [ ] More adoption of new features
- [ ] Positive community feedback
- [ ] Easier onboarding for new users

---

## 🚧 Risk Mitigation

### Breaking Changes

**Risk**: New features break existing users

**Mitigation**:

- Feature flags for new behavior
- Deprecation warnings before removal
- Migration guides for all changes
- Semantic versioning strictly followed

### Performance Regression

**Risk**: New features slow down generation

**Mitigation**:

- Benchmark before/after each phase
- Performance tests in CI
- Opt-in for expensive features
- Profile and optimize hot paths

### Complexity Creep

**Risk**: Too many options confuse users

**Mitigation**:

- Sensible defaults for everything
- Progressive disclosure in docs
- Warn when using complex options
- Regular API review

---

## 🎓 Learning from typed-openapi

### What to Adopt

| Pattern                  | Why           | When    |
| ------------------------ | ------------- | ------- |
| **Type-first**           | Performance   | Phase 1 |
| **Headless client**      | Flexibility   | Phase 2 |
| **Discriminated unions** | Type safety   | Phase 2 |
| **Factory pattern**      | Extensibility | Phase 4 |
| **AST layer**            | Multi-runtime | Phase 4 |

### What to Keep from openapi-zod-client

| Feature                        | Why                   | Priority  |
| ------------------------------ | --------------------- | --------- |
| **Comprehensive spec support** | Our differentiator    | Always    |
| **Deep Zod integration**       | Our strength          | Always    |
| **Template flexibility**       | User customization    | Always    |
| **Zodios as default**          | Easy onboarding       | Phase 1-2 |
| **Rich validation**            | Security, correctness | Always    |

### What to Avoid

| Pattern                                | Why Not                                 |
| -------------------------------------- | --------------------------------------- |
| **Dropping Zodios entirely**           | Too breaking, users rely on it          |
| **Incomplete spec support**            | Our differentiator is comprehensiveness |
| **"Works for me" testing**             | Need proper test coverage               |
| **Breaking changes without migration** | Hurts adoption                          |

---

## 🔄 Iteration Plan

### Each Phase

1. **Plan** (1 week)
    - Review phase goals
    - Create detailed tickets
    - Assign priorities

2. **Implement** (Phase duration)
    - Follow implementation plan
    - Write tests alongside code
    - Document as you go

3. **Review** (3 days)
    - Code review
    - Documentation review
    - User feedback gathering

4. **Release** (2 days)
    - Changeset creation
    - Version bump
    - Release notes
    - Announcement

5. **Monitor** (2 weeks)
    - Watch for issues
    - Gather metrics
    - Collect feedback
    - Plan adjustments

---

## 📚 Resources

### Documentation to Create

- [ ] Config file reference
- [ ] Template guide
- [ ] Plugin development guide
- [ ] Performance optimization guide
- [ ] Migration guides
- [ ] Troubleshooting guide
- [ ] API reference

### Examples to Create

All 45 examples listed in [examples/README.md](./examples/README.md)

### Tests to Write

- [ ] Unit tests for new features
- [ ] Integration tests with MSW
- [ ] Type tests with tstyche
- [ ] Performance benchmarks
- [ ] E2E tests for CLI

---

## 🎯 Definition of Done

Each phase is complete when:

- ✅ All features implemented
- ✅ All tests passing (unit, integration, type)
- ✅ Documentation written
- ✅ Examples created
- ✅ Migration guides updated
- ✅ Performance benchmarks run
- ✅ Code reviewed
- ✅ Changelog updated
- ✅ Released and announced

---

## 🤝 Getting Started

### For Contributors

1. Read [00-EXECUTIVE-SUMMARY.md](./00-EXECUTIVE-SUMMARY.md)
2. Pick a phase that interests you
3. Read relevant domain documents
4. Check out referenced examples
5. Start with smallest task
6. Open PR with tests and docs

### For Maintainers

1. Review this roadmap
2. Adjust priorities based on user feedback
3. Create GitHub issues for each task
4. Use milestones for each phase
5. Track progress publicly
6. Celebrate completions!

---

**Ready to start?** Begin with Phase 1, Quick Wins! 🚀
