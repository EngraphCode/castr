# Usage guide

Use Castr from a local checkout. No published package is currently planned.
The commands below run from the repository root unless a different directory is
stated. Node.js 24.x and the declared pnpm version are required; see
[contributor prerequisites](../CONTRIBUTING.md).

## Build and generate

```bash
git clone https://github.com/EngraphCode/castr.git
cd castr
pnpm install --frozen-lockfile
pnpm --filter @engraph/castr build
node lib/dist/cli/index.js --help
mkdir -p lib/tmp
node lib/dist/cli/index.js examples/local-user.json -o lib/tmp/local-user.ts
```

The [committed fixture](../examples/local-user.json) defines `GET /user` and an
explicitly closed `User` object with one required non-empty string `id`.
The current writer exports `User`. Keeping scratch
output under `lib/tmp/` lets generated imports resolve the library workspace's
installed Zod dependency; `tmp/` is ignored by Git.

## Compile and execute the generated schema

Compile-check the generated TypeScript:

```bash
pnpm --filter @engraph/castr exec tsc --ignoreConfig --strict --noEmit --target es2022 --module nodenext --moduleResolution nodenext tmp/local-user.ts
```

Node.js 24 can execute this generated TypeScript module directly. Check successful
parsed values and distinguishing invalid data:

```bash
node --input-type=module <<'JAVASCRIPT'
import assert from 'node:assert/strict';
import { User } from './lib/tmp/local-user.ts';

assert.deepEqual(User.parse({ id: 'user-1' }), { id: 'user-1' });
assert.equal(User.safeParse({ id: '' }).success, false);
assert.equal(User.safeParse({}).success, false);
assert.equal(User.safeParse({ id: 1 }).success, false);
assert.equal(User.safeParse({ id: 'user-1', extra: true }).success, false);
console.log('User validation passed');
JAVASCRIPT
```

The additional-property rejection follows this fixture's explicit
`additionalProperties: false`. It is not a default to impose on other source
schemas.

## Deterministic output and actionable failure

Generate the same input to a second path and compare the contents:

```bash
node lib/dist/cli/index.js examples/local-user.json -o lib/tmp/local-user-again.ts
cmp lib/tmp/local-user.ts lib/tmp/local-user-again.ts
```

`cmp` exits successfully when the contents match. This checks repeated generation
of the committed fixture.

A missing input must fail with a non-zero exit and an error identifying the input:

```bash
node lib/dist/cli/index.js examples/does-not-exist.json -o lib/tmp/unused.ts
```

That command intentionally fails. Do not treat an error as generated output.

## Fidelity and further reading

Strictness, fail-fast behaviour and source-dialect fidelity are required in every
path. They include accepted values and produced values, object openness and
catchalls, and ordered processing. Current violations require repair; this
walkthrough proves only its explicit fixture contract. Remaining findings live
in the [correction inventory](../.agent/plans/correction-manifests/castr-correction-findings.json).

- [API reference](./API-REFERENCE.md)
- [Examples](./EXAMPLES.md)
- [Migration guide](./MIGRATION.md)
- [MCP integration](./MCP_INTEGRATION_GUIDE.md)
