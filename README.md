# Castr

Castr is a schema compiler that transforms data definitions through a canonical
Intermediate Representation (IR). Its existing entry points include OpenAPI
input to generated Zod schemas and endpoint metadata, Zod source parsing, IR
inspection and persistence, OpenAPI writing, and MCP tool projection.

Castr currently has no consumers. Its owner has several intended projects and
considers its usefulness settled. The current work verifies correctness and
usability. No published package is currently planned; use a local checkout.

## Local quick start

Use Node.js 24.x and the pnpm version declared in `package.json`. See
[CONTRIBUTING.md](./CONTRIBUTING.md) for prerequisites, including the secret
scanner required by repository checks and hooks.

```bash
git clone https://github.com/EngraphCode/castr.git
cd castr
pnpm install --frozen-lockfile
pnpm --filter @engraph/castr build
node lib/dist/cli/index.js --help
mkdir -p lib/tmp
node lib/dist/cli/index.js examples/local-user.json -o lib/tmp/local-user.ts
```

The committed [User fixture](./examples/local-user.json) describes one explicit
closed object: a required, non-empty string `id`. Generated output contains a
`User` Zod schema and endpoint metadata. The [usage walkthrough](./docs/USAGE.md)
compiles the output, executes positive and negative validation examples, and
compares repeated generation. That proof covers this fixture's contract; the
[correction plan](./.agent/plans/active/castr-documentation-and-fidelity-correction.md)
owns the remaining fidelity repairs.

## Fidelity contract

Strictness, fail-fast behaviour and semantic fidelity are absolute requirements.
Castr must preserve source-dialect acceptance and processing semantics, including
object retention, stripping and catchalls. Strictness does not authorise closing
an object whose source permits additional properties.

Known silent loss, ignored options and incorrect output are design or
implementation defects requiring repair. The [finding inventory](./.agent/plans/correction-manifests/castr-correction-findings.json)
and [delivery plan](./.agent/plans/active/castr-documentation-and-fidelity-correction.md)
name their evidence and owners. An existing export or a green fixture does not
prove every construct on that surface correct.

Castr generates schemas and metadata. Applications compose their own HTTP
transport; see [the integration guide](./docs/OPENAPI-FETCH-INTEGRATION.md).

## Contributing and current work

Start with [CONTRIBUTING.md](./CONTRIBUTING.md), the [Practice bridge](./.agent/practice-index.md)
and the [verification contract](./.agent/directives/DEFINITION_OF_DONE.md). The
[programme parent](./.agent/plans/proof-programme/parent-plan.md#current-execution-state)
is the controlling queue; the [delivery ledger](./.agent/plans/delivery-ledger.md)
records PR custody. The platform-neutral autonomous-development experiment is
paused, and its Claude Routine is disabled. Interactive correction work is
separately authorised.
