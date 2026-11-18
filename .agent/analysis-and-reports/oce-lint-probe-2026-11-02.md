# PROBE: OCE's lint rules over Castr's product code, 2 November 2026

The course's PROBE leg ([castr-course.md](../plans/active/castr-course.md)), the first step of
the owner's question of 1 November 2026, "run your analysis on the code as-is". A read-only
run: neither repository was changed. Like MEASURE, it reports what is there and decides
nothing (owner's decision card, 2 November 2026); it feeds the reflection after MEASURE and,
for code that travels, the RULES leg.

## What ran

- **Rules:** the Engraph Open Curriculum Ecosystem's `@oaknational/eslint-plugin-standards`
  (`packages/core/oak-eslint`), its `configs.strict` on every TypeScript file and its
  `testRules` on test files, as OCE's own library workspaces use them
  (`packages/core/result/eslint.config.ts`). OCE's `coreBoundaryRules` were left out: they
  encode OCE's package layout, which Castr does not share.
- **OCE:** commit `39131d62`; the package's built `dist` was newer than the last commit to
  its source. The OCE working tree held another session's uncommitted edits to the
  package's unit tests only, which do not reach `dist`. ESLint 10.8.1 from OCE's install.
- **Castr:** `lib/src` as at `SHA:851c7efe` (`main`), 436 files, 149 of them tests, with type
  information from `lib/tsconfig.lint.json`.
- **When:** 2026-11-02T13:40:19Z to 13:40:29Z.

The configuration file, `probe.eslint.config.mjs`, imports the package's `dist` by a path
built from `HOME` and sets `basePath` to Castr's `lib`:

```js
const standards = await import(
  pathToFileURL(path.join(oce, 'packages/core/oak-eslint/dist/index.js')).href
);
const { configs, defineConfigArray, createImportResolverSettings, ignores, testRules } = standards;
export default defineConfigArray(
  { basePath: castrLib, ignores: [...ignores, 'dist/**', 'coverage/**'] },
  ...[configs.strict].flat().map((c) => ({ ...c, basePath: castrLib })),
  {
    basePath: castrLib,
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: { projectService: false, project, tsconfigRootDir: castrLib },
    },
    settings: createImportResolverSettings({ project }),
  },
  {
    basePath: castrLib,
    files: ['**/*.test.ts', '**/*.spec.ts', '**/__tests__/**/*.ts'],
    rules: testRules,
  },
);
```

The command, from Castr's `lib`:

```bash
"$OCE/node_modules/.bin/eslint" --config probe.eslint.config.mjs --format json 'src/**/*.ts' > probe.json
```

Every count below is computed from `probe.json`, grouping messages by `ruleId` and by the
first directory under `lib/src`, with `*.test.ts` and `*.spec.ts` files counted as tests.

## Result

769 findings (766 errors, 3 warnings) from 39 rules, in 235 of the 436 files; no file failed
to parse.

| Area                      | Findings |
| ------------------------- | -------: |
| `schema-processing`       |      408 |
| `schema-processing` tests |      160 |
| `shared`                  |      102 |
| `shared` tests            |       24 |
| `characterisation` tests  |       14 |
| `characterisation`        |       13 |
| `validation`              |       12 |
| `rendering`               |        9 |
| `architecture` tests      |        8 |
| `endpoints`               |        8 |
| `validation` tests        |        5 |
| `cli`                     |        3 |
| `cli` tests               |        1 |
| `lib/src` root tests      |        1 |
| `rendering` tests         |        1 |

What the four largest rules ask for, in their own messages:

- `@oaknational/no-throw-statement` (206): "Throwing is banned: a thrown error is invisible
  to the type system. Return a Result<T, E>".
- `no-restricted-properties` (139): `Object.entries` (55), `Object.keys` (38),
  `Object.values` (23) and `Reflect.get` (18), `Reflect.set` (1),
  `Reflect.deleteProperty` (1), each to be replaced by OCE's type-safe helper; `vi.mock` (3)
  in tests.
- `@typescript-eslint/no-restricted-types` (81): `object` as a type (80) and `{}` (1).
- `@typescript-eslint/no-unsafe-assignment` (46), all in tests.

`@oaknational/no-eslint-disable` (4) reports Castr's existing suppression comments, and three
of Castr's suppression directives are unused (`sonarjs/no-floating-point-equality` twice,
`sonarjs/function-return-type` once).

## By rule

| Rule                                                | Hits | Areas (hits)                                                                                                                                                                                                                            |
| --------------------------------------------------- | ---: | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@oaknational/no-throw-statement`                   |  206 | `schema-processing` (112), `schema-processing` tests (45), `shared` (25), `characterisation` (6), `characterisation` tests (5), `shared` tests (5), `rendering` (3), `validation` tests (2), `validation` (2), `architecture` tests (1) |
| `no-restricted-properties`                          |  139 | `schema-processing` (105), `shared` (23), `shared` tests (3), `validation` (3), `endpoints` (2), `rendering` (2), `characterisation` (1)                                                                                                |
| `@typescript-eslint/no-restricted-types`            |   81 | `schema-processing` (43), `shared` (27), `rendering` (4), `validation` (4), `characterisation` (2), `endpoints` (1)                                                                                                                     |
| `@typescript-eslint/no-unsafe-assignment`           |   46 | `schema-processing` tests (33), `shared` tests (6), `architecture` tests (3), `characterisation` tests (3), `validation` tests (1)                                                                                                      |
| `max-lines`                                         |   44 | `schema-processing` (29), `shared` (6), `schema-processing` tests (5), `characterisation` tests (1), `endpoints` (1), `rendering` tests (1), `validation` (1)                                                                           |
| `@typescript-eslint/prefer-nullish-coalescing`      |   35 | `schema-processing` (28), `shared` (4), `schema-processing` tests (3)                                                                                                                                                                   |
| `unicorn/prefer-export-from`                        |   27 | `schema-processing` (22), `characterisation` (2), `cli` (2), `validation` (1)                                                                                                                                                           |
| `complexity`                                        |   24 | `schema-processing` tests (23), `architecture` tests (1)                                                                                                                                                                                |
| `unicorn/prefer-single-call`                        |   20 | `schema-processing` (20)                                                                                                                                                                                                                |
| `unicorn/prefer-code-point`                         |   17 | `schema-processing` (10), `shared` (7)                                                                                                                                                                                                  |
| `unicorn/consistent-function-scoping`               |   15 | `schema-processing` tests (12), `cli` tests (1), `schema-processing` (1), `shared` tests (1)                                                                                                                                            |
| `unicorn/prefer-includes`                           |   12 | `schema-processing` (12)                                                                                                                                                                                                                |
| `unicorn/prefer-string-replace-all`                 |   11 | `schema-processing` tests (11)                                                                                                                                                                                                          |
| `@typescript-eslint/no-redundant-type-constituents` |   10 | `schema-processing` (5), `endpoints` (4), `shared` (1)                                                                                                                                                                                  |
| `@oaknational/no-real-io-in-tests`                  |    9 | `characterisation` tests (4), `architecture` tests (2), `schema-processing` tests (2), `validation` tests (1)                                                                                                                           |
| `unicorn/prefer-type-error`                         |    8 | `schema-processing` tests (7), `schema-processing` (1)                                                                                                                                                                                  |
| `@typescript-eslint/prefer-optional-chain`          |    5 | `schema-processing` (2), `schema-processing` tests (2), `characterisation` (1)                                                                                                                                                          |
| `max-statements`                                    |    5 | `schema-processing` tests (4), `characterisation` tests (1)                                                                                                                                                                             |
| `prefer-object-has-own`                             |    5 | `schema-processing` (3), `schema-processing` tests (1), `shared` (1)                                                                                                                                                                    |
| `@oaknational/no-eslint-disable`                    |    4 | `shared` (2), `schema-processing` tests (1), `shared` tests (1)                                                                                                                                                                         |
| `@typescript-eslint/no-unsafe-return`               |    4 | `shared` tests (2), `architecture` tests (1), `characterisation` (1)                                                                                                                                                                    |
| `@typescript-eslint/no-unused-vars`                 |    4 | `schema-processing` (4)                                                                                                                                                                                                                 |
| `import-x/no-namespace`                             |    4 | `schema-processing` tests (3), `(root)` tests (1)                                                                                                                                                                                       |
| `unicorn/prefer-native-coercion-functions`          |    4 | `shared` tests (2), `shared` (1), `validation` (1)                                                                                                                                                                                      |
| `unicorn/prefer-string-raw`                         |    4 | `schema-processing` (2), `shared` tests (2)                                                                                                                                                                                             |
| `max-lines-per-function`                            |    3 | `schema-processing` (2), `cli` (1)                                                                                                                                                                                                      |
| `no-console`                                        |    3 | `schema-processing` tests (3)                                                                                                                                                                                                           |
| `unicorn/catch-error-name`                          |    3 | `shared` (2), `validation` tests (1)                                                                                                                                                                                                    |
| `unicorn/prefer-at`                                 |    3 | `schema-processing` (2), `shared` (1)                                                                                                                                                                                                   |
| unused disable directive                            |    3 | `schema-processing` tests (1), `shared` tests (1), `shared` (1)                                                                                                                                                                         |
| `sonarjs/no-alphabetical-sort`                      |    2 | `schema-processing` tests (2)                                                                                                                                                                                                           |
| `unicorn/no-object-as-default-parameter`            |    2 | `schema-processing` (2)                                                                                                                                                                                                                 |
| `@oaknational/no-dynamic-import`                    |    1 | `shared` (1)                                                                                                                                                                                                                            |
| `@typescript-eslint/max-params`                     |    1 | `schema-processing` (1)                                                                                                                                                                                                                 |
| `@typescript-eslint/no-base-to-string`              |    1 | `schema-processing` (1)                                                                                                                                                                                                                 |
| `no-restricted-syntax`                              |    1 | `schema-processing` tests (1)                                                                                                                                                                                                           |
| `sonarjs/no-misleading-array-reverse`               |    1 | `schema-processing` tests (1)                                                                                                                                                                                                           |
| `unicorn/no-useless-fallback-in-spread`             |    1 | `schema-processing` (1)                                                                                                                                                                                                                 |
| `unicorn/no-useless-spread`                         |    1 | `shared` tests (1)                                                                                                                                                                                                                      |
