// Probe B: exactOptional/.exactPartial() fidelity study (zod 4.5.4).
import { z } from 'zod45';

const out = {};
out.api = {
  exactOptional: typeof z.exactOptional,
  exactPartial: typeof z.strictObject({}).exactPartial,
};

const Classic = z.strictObject({ a: z.string().optional(), b: z.string() });
const Exact = z.strictObject({ a: z.exactOptional(z.string()), b: z.string() });

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
  };
}

// JSON wire equivalence: JSON cannot carry undefined, so parsed-JSON inputs
// can never hit the divergent case. Demonstrate.
const wire = JSON.parse('{"b":"x"}');
out.wire = {
  hasOwnA: Object.hasOwn(wire, 'a'),
  optional: Classic.safeParse(wire).success,
  exactOptional: Exact.safeParse(wire).success,
  note: 'JSON.parse can never produce an own undefined-valued key',
};

// JSON Schema projection: do the two forms project identically?
const projClassic = z.toJSONSchema(Classic);
const projExact = z.toJSONSchema(Exact);
out.projectionIdentical = JSON.stringify(projClassic) === JSON.stringify(projExact);
out.projClassic = projClassic;
if (!out.projectionIdentical) out.projExact = projExact;

console.log(JSON.stringify(out, null, 1));
