# Replacing Handlebars with a Typed Emitter (ts‑morph) in `openapi-zod-client`

**Goal:** Remove Handlebars templates and introduce a small, typed _Emitter layer_ that converts the existing IR (schemas, endpoints, types) into TypeScript using **ts‑morph**. Preserve the package’s public behavior (CLI/API) while allowing rough (not byte-for-byte) output differences.

---

## Why switch to a typed emitter?

- **Type-safety end-to-end:** Generate code by constructing declarations, not concatenating strings.
- **Refactorable and testable:** Structural changes are localized; fewer “missing brace” failures.
- **Pluggable outputs:** Different file layouts or client targets become small emitter variants.
- **Developer experience > raw speed:** ts‑morph provides excellent ergonomics and readable codegen.

---

## File model (internal IR)

This is a _thin, stable_ interface between the conversion logic and the emitter. Your existing OpenAPI→Zod and OpenAPI→TS steps can continue producing expressions and types as strings; this IR just declares where they go and how they are named.

```ts
// file-model.ts
export interface FileUnit {
  path: string; // e.g. "users.ts" or "schemas/common.ts"
  imports: ImportSpec[];
  declarations: Decl[];
}

export interface ImportSpec {
  from: string; // module specifier, e.g. "zod" or "@zodios/core"
  names: string[]; // named imports
  typeOnly?: boolean; // import type { ... } from "..."
}

export type Decl =
  | { kind: 'zodSchema'; name: string; expr: string; jsDoc?: string }
  | { kind: 'tsTypeAlias'; name: string; type: string; jsDoc?: string }
  | { kind: 'tsInterface'; name: string; members: Member[]; jsDoc?: string }
  | { kind: 'const'; name: string; initializer: string; isExported?: boolean; jsDoc?: string }
  | { kind: 'client'; name: string; body: string; jsDoc?: string };

export interface Member {
  name: string;
  type: string;
  optional?: boolean;
  readonly?: boolean;
}
```

> Keep naming, grouping, and “complexity-based inlining” decisions _outside_ the emitter. The emitter should simply print what the IR describes.

---

## Emitter (ts‑morph)

A minimal ts‑morph emitter that writes files to disk. It respects JSDoc, named imports, and basic declarations. You can expand this to cover additional node kinds as needed.

```ts
// emit-tsmorph.ts
import { Project, VariableDeclarationKind } from 'ts-morph';
import type { FileUnit, Decl } from './file-model';

type PrettierRunner = (path: string) => Promise<void>;

export async function emitFilesTsMorph(
  files: FileUnit[],
  options?: { runPrettier?: PrettierRunner },
) {
  const project = new Project();
  for (const f of files) {
    const sf = project.createSourceFile(f.path, '', { overwrite: true });

    // Imports
    for (const im of f.imports) {
      sf.addImportDeclaration({
        isTypeOnly: !!im.typeOnly,
        moduleSpecifier: im.from,
        namedImports: im.names.map((n) => ({ name: n })),
      });
    }

    // Declarations
    for (const d of f.declarations) {
      emitDecl(sf, d);
    }
  }

  await project.save();

  // Optional formatting pass
  if (options?.runPrettier) {
    await Promise.all(files.map((f) => options.runPrettier!(f.path)));
  }
}

function emitDecl(sf: import('ts-morph').SourceFile, d: Decl) {
  if (d.kind === 'zodSchema') {
    if (d.jsDoc) sf.addStatements(jsDoc(d.jsDoc));
    sf.addVariableStatement({
      isExported: true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{ name: d.name, initializer: d.expr }],
    });
    return;
  }

  if (d.kind === 'tsTypeAlias') {
    sf.addTypeAlias({
      isExported: true,
      name: d.name,
      type: d.type,
      docs: d.jsDoc ? [{ description: d.jsDoc }] : [],
    });
    return;
  }

  if (d.kind === 'tsInterface') {
    sf.addInterface({
      isExported: true,
      name: d.name,
      docs: d.jsDoc ? [{ description: d.jsDoc }] : [],
      properties: d.members.map((m) => ({
        name: m.name,
        type: m.type,
        hasQuestionToken: !!m.optional,
        isReadonly: !!m.readonly,
      })),
    });
    return;
  }

  if (d.kind === 'const') {
    if (d.jsDoc) sf.addStatements(jsDoc(d.jsDoc));
    sf.addVariableStatement({
      isExported: d.isExported ?? true,
      declarationKind: VariableDeclarationKind.Const,
      declarations: [{ name: d.name, initializer: d.initializer }],
    });
    return;
  }

  if (d.kind === 'client') {
    if (d.jsDoc) sf.addStatements(jsDoc(d.jsDoc));
    sf.addStatements(`export const ${d.name} = ${d.body};`);
    return;
  }
}

function jsDoc(text: string) {
  // escape */ inside comments
  return `/** ${text.replace(/\*\//g, '*\/')} */`;
}
```

---

## Printing to strings (programmatic API)

When `disableWriteToFile` is true, return a `Record<path,string>` instead of writing.

```ts
// emit-print.ts (TS factory + printer to avoid touching disk)
import ts from 'typescript';
import type { FileUnit } from './file-model';

export function printFilesToStrings(files: FileUnit[]): Record<string, string> {
  const out: Record<string, string> = {};
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });

  for (const f of files) {
    const stmts: ts.Statement[] = [];

    // imports
    for (const im of f.imports) {
      // import { A, B } from "mod";
      const importClause = ts.factory.createImportClause(
        false,
        undefined,
        ts.factory.createNamedImports(
          im.names.map((n) =>
            ts.factory.createImportSpecifier(false, undefined, ts.factory.createIdentifier(n)),
          ),
        ),
      );
      const decl = ts.factory.createImportDeclaration(
        undefined,
        im.typeOnly ? [ts.factory.createModifier(ts.SyntaxKind.TypeKeyword)] : undefined,
        importClause,
        ts.factory.createStringLiteral(im.from),
      );
      stmts.push(decl);
    }

    // crude approach: emit declarations as raw statements (keeps this example short).
    // In production, construct AST nodes for each declaration (mirroring emitFilesTsMorph).
    for (const d of f.declarations) {
      if (d.kind === 'zodSchema') {
        stmts.push(s(`export const ${d.name} = ${d.expr};`));
      } else if (d.kind === 'tsTypeAlias') {
        stmts.push(s(`export type ${d.name} = ${d.type};`));
      } else if (d.kind === 'tsInterface') {
        const props = d.members
          .map(
            (m) =>
              `  ${m.readonly ? 'readonly ' : ''}${m.name}${m.optional ? '?' : ''}: ${m.type};`,
          )
          .join('\n');
        stmts.push(s(`export interface ${d.name} {\n${props}\n}`));
      } else if (d.kind === 'const') {
        stmts.push(s(`export const ${d.name} = ${d.initializer};`));
      } else if (d.kind === 'client') {
        stmts.push(s(`export const ${d.name} = ${d.body};`));
      }
    }

    const sf = ts.factory.createSourceFile(
      stmts,
      ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
      ts.NodeFlags.None,
    );
    out[f.path] = printer.printFile(sf);
  }
  return out;
}

function s(code: string): ts.Statement {
  const file = ts.createSourceFile('x.ts', code, ts.ScriptTarget.Latest, false, ts.ScriptKind.TS);
  return file.statements[0]!;
}
```

---

## Mapping current template options to strategies

- `schemas-only` → emit only Zod schemas and (optionally) `export type Foo = z.infer<typeof FooSchema>`
- `client+schemas` (single file) → schemas + client in one unit
- `client+schemas` (grouped by tag/method) → multiple files + optional index
- `grouped-common` → extract shared schemas to `common.ts` and import where needed
- Custom “template” path → **emitter plugin** (see below), not a text template

The CLI flag can stay `--template`, but now the value is a **strategy name** or a path to a **JS emitter plugin** instead of a `.hbs` file.

---

## Building `FileUnit[]` from your existing grouping

Below shows a rough sketch for the grouped-by-tag mode; in practice you already know which schemas/endpoints belong to which group.

```ts
// build-files.ts (sketch)
import type { FileUnit, Decl } from './file-model';

export function buildFilesFromGroups(
  groups: Group[],
  options: { mode: 'schemas-only' | 'client+schemas'; includeIndex?: boolean },
): FileUnit[] {
  const files: FileUnit[] = [];

  for (const g of groups) {
    const decls: Decl[] = [];

    // Schemas (Zod)
    for (const s of g.schemas) {
      decls.push({
        kind: 'zodSchema',
        name: s.name, // e.g. "UserSchema"
        expr: s.expr, // e.g. z.object({...}).strict()
        jsDoc: s.description,
      });

      // Optional: exported types via z.infer
      decls.push({
        kind: 'tsTypeAlias',
        name: s.name.replace(/Schema$/, ''),
        type: `z.infer<typeof ${s.name}>`,
      });
    }

    // Endpoints client
    if (options.mode === 'client+schemas') {
      decls.push({
        kind: 'client',
        name: `${g.tagName}Api`, // e.g. "UsersApi"
        body: makeZodiosClientBody(g), // returns string like: makeApi([...]) or a small wrapper
      });
    }

    const imports = [
      { from: 'zod', names: ['z'] },
      // add zodios or fetch client imports if you generate a client
    ];

    files.push({
      path: `api/${g.tagName}.ts`,
      imports,
      declarations: decls,
    });
  }

  // Optional index (barrel)
  // files.push({ path: "api/index.ts", imports: [], declarations: groups.map(...) })

  return files;
}
```

---

## Example: OpenAPI → Zod snippet → IR

Assume your converter yields the expression for a simple schema and we drop it into a `FileUnit`.

```ts
// Suppose OpenAPI `User` resolves to:
const userExpr = `z.object({
  id: z.string(),
  role: z.enum(["admin", "teacher"]),
  friends: z.array(z.lazy(() => UserSchema)).optional(), // if circular
}).strict()`;

const file: FileUnit = {
  path: 'schemas/user.ts',
  imports: [{ from: 'zod', names: ['z'] }],
  declarations: [
    { kind: 'zodSchema', name: 'UserSchema', expr: userExpr, jsDoc: 'User model' },
    { kind: 'tsTypeAlias', name: 'User', type: 'z.infer<typeof UserSchema>' },
  ],
};
```

Emit with:

```ts
await emitFilesTsMorph([file], { runPrettier: maybeRunPrettier });
```

---

## CLI shape & compatibility

- Keep flags like `--output`, `--export-schemas`, `--group-strategy`, `--success-expr`, `--error-expr`, `--media-type-expr`, `--allReadonly`, `--strictObjects`, `--prettier`, `--disableWriteToFile`.
- Interpret `--template` as either:
  - a **built-in strategy name** (e.g. `schemas-only`, `grouped`, `grouped-index`, `grouped-common`), or
  - a **path to an emitter plugin module** (see below).

Programmatic usage continues to support `disableWriteToFile`; return `Record<path,string>` using the “print to strings” path.

---

## Tests

- **Golden snapshots**: Keep your fixtures; update snapshots as needed. Treat minor cosmetic diffs (import order, whitespace) as acceptable.
- **Spec coverage**: Include OAS 3.0/3.1, `$ref` cycles, `oneOf/anyOf/allOf`, discriminators, nullable, defaults, `additionalProperties`, auth/security, success/error/media selection.
- **Determinism**: Sort members and files stably to minimize churn. Your existing “complexity-based inlining” can remain unchanged.

---

## Emitter plugin API (for “custom templates” replacement)

Let users pass a JS module path to `--template` that exports a function:

```ts
// my-emitter-plugin.ts
import type { FileUnit } from 'openapi-zod-client/internal/file-model';

export type PluginOptions = Record<string, unknown>;

export function apply(ir: YourExistingIR, options: PluginOptions): FileUnit[] {
  // transform your IR into FileUnit[] however you like
  return [];
}
```

The core CLI will:

1. Load the spec, build your IR (schemas, endpoints, groups).
2. If `--template` is a path, `require()` the module and call `apply(ir, options)`.
3. Pass the resulting `FileUnit[]` to the ts‑morph emitter.

---

## End-to-end example

```ts
import { emitFilesTsMorph } from './emit-tsmorph';
import { buildFilesFromGroups } from './build-files';
import { parseAndBundleOpenAPI } from './load'; // existing logic
import { toIR } from './to-ir'; // your current OpenAPI→IR
import { groupByTag } from './grouping'; // your existing grouping

async function generate(
  input: string,
  opts: { outDir: string; mode: 'schemas-only' | 'client+schemas' },
) {
  const doc = await parseAndBundleOpenAPI(input); // uses @apidevtools/swagger-parser
  const ir = toIR(doc);
  const groups = groupByTag(ir);

  const files = buildFilesFromGroups(groups, { mode: opts.mode, includeIndex: true }).map((f) => ({
    ...f,
    path: `${opts.outDir}/${f.path}`,
  }));

  await emitFilesTsMorph(files, { runPrettier: maybeRunPrettier });
}

async function maybeRunPrettier(path: string) {
  // shell out to Prettier or use API; respect user config.
}
```

---

## Notes & tips

- Keep the “success/error/media” expressions and security handling in your IR; the emitter only prints the final client arrays/objects.
- For circular schemas, rely on your existing detection and wrap expressions with `z.lazy`. The emitter doesn’t need special logic.
- Consider adding a small banner header in each file (generator version, command, do-not-edit) to aid debugging.
- If some outputs are huge and ts‑morph becomes a bottleneck, switch just the final printing step to the TS printer for those files; you can mix approaches.

---

## Migration checklist

- [ ] Introduce `FileUnit` IR and write a small builder that mirrors your current grouping strategies.
- [ ] Implement `emitFilesTsMorph`.
- [ ] Replace Handlebars calls with: build `FileUnit[]` → emit → format.
- [ ] Update CLI help: clarify that `--template` now refers to strategies or a plugin emitter.
- [ ] Update fixtures and snapshots; ship a minor version with a “migration notes” section.
- [ ] Gather feedback; consider offering an AST-printer path for very large specs as an advanced option.

---

**That’s it.** You preserve user-facing behavior while gaining a safer, more maintainable, and easily extensible codegen core.
