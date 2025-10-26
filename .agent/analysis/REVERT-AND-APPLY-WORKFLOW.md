# Revert and Apply Workflow

**Better approach:** Save → Revert → Apply Immediately → Add E2E Tests

---

## Step 1: Save Test Work to Branch

```bash
# Save just the test file (the valuable work)
git checkout -b save-component-access-tests
git reset --hard phase1-wip-investigation
git reset --soft phase0-complete-working
# This stages only the changes since phase0
git reset HEAD  # Unstage everything
git add lib/src/component-access.test.ts
git add .agent/analysis/DEREFERENCE-BREAKING-CHANGE-ANALYSIS.md
git add .agent/analysis/REVERT-IMPACT-ANALYSIS.md
git commit -m "save: component-access tests and analysis documents

Preserves:
- 402 lines of TDD tests for component access
- Analysis of what went wrong
- Insights about makeSchemaResolver issues

These tests document the behavior we want, even if the 
implementation approach was flawed."

git tag tests-to-preserve
```

## Step 2: Revert Working Tree to Known Good

```bash
git checkout feat/rewrite
git reset --hard phase0-complete-working

# Verify we're back to working state
cd lib
pnpm test -- --run
pnpm character
# Should see: 86/88 characterisation tests passing
cd ..
```

## Step 3: IMMEDIATELY Apply Saved Tests

```bash
# Cherry-pick just the test file
git checkout save-component-access-tests -- lib/src/component-access.test.ts
git checkout save-component-access-tests -- .agent/analysis/DEREFERENCE-BREAKING-CHANGE-ANALYSIS.md
git checkout save-component-access-tests -- .agent/analysis/REVERT-IMPACT-ANALYSIS.md

# Run the tests to see what breaks
cd lib
pnpm test -- --run component-access.test.ts
```

**Expected:** Tests will fail because `component-access.ts` doesn't exist yet.

## Step 4: Create Minimal Implementation to Pass Tests

This forces us to implement ONLY what the tests require, no more.

```typescript
// lib/src/component-access.ts
// Minimal implementation driven by the tests we just applied
// Use ComponentsObject types properly
// No internal dereferencing assumptions
```

## Step 5: Add E2E User Scenario Tests

Now add the missing piece - e2e tests for actual use cases:

```typescript
// lib/src/characterisation/programmatic-usage.char.test.ts
describe('E2E: Programmatic Usage', () => {
  it('should handle spec with internal refs (no dereferencing needed)', async () => {
    const spec = {
      openapi: '3.0.0',
      components: {
        schemas: {
          User: { type: 'object', properties: { name: { type: 'string' } } }
        }
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    schema: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: spec,
      disableWriteToFile: true,
    });
    
    // Should export named User schema
    expect(result).toContain('export const User');
    expect(result).toContain('z.object');
  });

  it('should handle spec after SwaggerParser.dereference()', async () => {
    const spec = {
      openapi: '3.0.0',
      components: {
        schemas: {
          User: { type: 'object', properties: { name: { type: 'string' } } }
        }
      },
      paths: {
        '/users': {
          get: {
            responses: {
              '200': {
                content: {
                  'application/json': {
                    // After dereference, this might still be a ref (good)
                    // or might be inlined (we need to handle both)
                    schema: { $ref: '#/components/schemas/User' }
                  }
                }
              }
            }
          }
        }
      }
    };
    
    const dereferenced = await SwaggerParser.dereference(spec);
    const result = await generateZodClientFromOpenAPI({
      openApiDoc: dereferenced,
      disableWriteToFile: true,
    });
    
    // Should still export named User schema
    expect(result).toContain('export const User');
  });
});
```

## Step 6: Eliminate makeSchemaResolver Properly

Now with both unit tests and e2e tests guiding us:
- Update files to use ComponentsObject properly
- Remove makeSchemaResolver
- Ensure all tests pass (unit + e2e + characterisation)

## Benefits of This Approach

1. ✅ Keep the 402 lines of good test work
2. ✅ Start from working foundation (86/88 tests passing)
3. ✅ Tests guide the implementation (pure TDD)
4. ✅ Add missing e2e tests for actual use cases
5. ✅ No "big bang" rewrite - incremental and safe

## Key Insight

The tests we wrote are probably GOOD - they test behavior we want.
The implementation was flawed, but the tests document correct expectations.

By applying tests immediately, we:
- Force ourselves to implement correctly to pass them
- Don't lose the test design work
- Can adjust tests if they're testing wrong behavior
- Build on working foundation, not broken one
