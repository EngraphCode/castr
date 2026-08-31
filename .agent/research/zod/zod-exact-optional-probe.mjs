// Probe B: exactOptional / .exactPartial() fidelity study (zod 4.5.4).
//
// Reproducible from a clean checkout: run
//   node zod-exact-optional-probe.mjs > zod-exact-optional-probe-<date>.out.json
//   pnpm exec prettier --write zod-exact-optional-probe-<date>.out.json
// The script stages itself into a temp prefix and npm-installs the probed
// zod version there (same mechanism as zod-version-probe.mjs), so the bare
// alias import below resolves.
import { execFileSync } from 'node:child_process';
import { copyFileSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const PROBE_VERSIONS = { zod45: '4.5.4' };

if (!process.env.ZOD_PROBE_STAGED) {
  const prefix = mkdtempSync(join(tmpdir(), 'zod-exact-optional-probe-'));
  writeFileSync(
    join(prefix, 'package.json'),
    JSON.stringify({ name: 'zod-exact-optional-probe', private: true, type: 'module' }),
  );
  const specs = Object.entries(PROBE_VERSIONS).map(([alias, v]) => `${alias}@npm:zod@${v}`);
  execFileSync('npm', ['install', '--no-audit', '--no-fund', ...specs], {
    cwd: prefix,
    stdio: ['ignore', 'ignore', 'inherit'],
  });
  const staged = join(prefix, 'zod-exact-optional-probe.mjs');
  copyFileSync(fileURLToPath(import.meta.url), staged);
  execFileSync(process.execPath, [staged], {
    cwd: prefix,
    stdio: 'inherit',
    env: { ...process.env, ZOD_PROBE_STAGED: '1' },
  });
  process.exit(0);
}

const { z } = await import('zod45');

const out = {};
out.api = {
  exactOptional: typeof z.exactOptional,
  exactPartial: typeof z.strictObject({}).exactPartial,
};

// Direct wrapper comparison: exactOptional vs optional.
const Classic = z.strictObject({ a: z.string().optional(), b: z.string() });
const Exact = z.strictObject({ a: z.exactOptional(z.string()), b: z.string() });
// Method comparison: .partial() vs .exactPartial() applied to the same base.
const Base = z.strictObject({ a: z.string(), b: z.string() });
const Partial = Base.partial({ a: true });
const ExactPartial = Base.exactPartial({ a: true });

const cases = {
  omitted: { b: 'x' },
  present: { a: 'v', b: 'x' },
  explicitUndefined: { a: undefined, b: 'x' },
};
out.behaviour = {};
for (const [name, payload] of Object.entries(cases)) {
  out.behaviour[name] = {
    optional: Classic.safeParse(payload).success,
    exactOptional: Exact.safeParse(payload).success,
    partial: Partial.safeParse(payload).success,
    exactPartial: ExactPartial.safeParse(payload).success,
  };
}

// JSON wire equivalence: JSON cannot carry undefined, so parsed-JSON inputs
// can never hit the divergent case. Demonstrate.
const wire = JSON.parse('{"b":"x"}');
out.wire = {
  hasOwnA: Object.hasOwn(wire, 'a'),
  optional: Classic.safeParse(wire).success,
  exactOptional: Exact.safeParse(wire).success,
  partial: Partial.safeParse(wire).success,
  exactPartial: ExactPartial.safeParse(wire).success,
  note: 'JSON.parse can never produce an own undefined-valued key',
};

// JSON Schema projection: do the forms project identically?
out.projectionIdentical = {
  optional_vs_exactOptional:
    JSON.stringify(z.toJSONSchema(Classic)) === JSON.stringify(z.toJSONSchema(Exact)),
  partial_vs_exactPartial:
    JSON.stringify(z.toJSONSchema(Partial)) === JSON.stringify(z.toJSONSchema(ExactPartial)),
};
out.projClassic = z.toJSONSchema(Classic);

console.log(JSON.stringify(out, null, 2));
