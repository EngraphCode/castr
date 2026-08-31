// Zod multi-version probe: behavioural claims + core def-shape stability.
const versions = ['zod43', 'zod44', 'zod45'];

function defShape(schema) {
  // Shallow def discriminant + sorted own keys; recurse one level into checks.
  const def = schema._zod.def;
  const keys = Object.keys(def).sort();
  const checks = (def.checks ?? []).map((c) => {
    const cd = c._zod?.def ?? c.def ?? {};
    return `${cd.check ?? cd.kind ?? '?'}${cd.format ? ':' + cd.format : ''}`;
  });
  return { type: def.type, format: def.format ?? null, keys, checks };
}

for (const v of versions) {
  const z = (await import(v)).z ?? (await import(v)).default;
  const out = {
    version: (await import(v + '/package.json', { with: { type: 'json' } })).default.version,
  };

  // B1: iso.datetime seconds requirement
  out.datetime_no_seconds = z.iso.datetime().safeParse('2026-08-31T12:00Z').success;
  out.datetime_with_seconds = z.iso.datetime().safeParse('2026-08-31T12:00:00Z').success;

  // B2: string length counting (astral char = 1 code point, 2 UTF-16 units)
  out.astral_length1 = z.string().length(1).safeParse('\u{1F4A9}').success;
  out.astral_min2 = z.string().min(2).safeParse('\u{1F4A9}').success;

  // B3: new 4.5 API presence
  out.api = {
    creditCard: typeof z.creditCard === 'function',
    properties: typeof z.properties === 'function',
    deepPartial: typeof z.deepPartial === 'function',
    validate: typeof z.validate === 'function',
    compile: typeof z.compile === 'function',
    exactPartial: typeof z.strictObject({}).exactPartial === 'function',
  };

  // B4: toJSONSchema minLength emission for a code-point-relevant constraint
  try {
    out.toJSONSchema_min = z.toJSONSchema(z.string().min(2))?.minLength ?? null;
  } catch (e) {
    out.toJSONSchema_min = 'throws: ' + e.message;
  }

  // U1: core def shapes for a representative construct set
  const reps = {
    string: z.string(),
    stringChecked: z.string().min(1).max(5).regex(/a/),
    datetime: z.iso.datetime(),
    email: z.email(),
    uuidv7: z.uuidv7(),
    int: z.int(),
    int64: z.int64(),
    number: z.number().gt(0).multipleOf(2),
    strictObject: z.strictObject({ a: z.string().optional(), b: z.string().nullable() }),
    union: z.union([z.string(), z.number()]),
    dunion: z.discriminatedUnion('t', [
      z.object({ t: z.literal('x') }),
      z.object({ t: z.literal('y') }),
    ]),
    array: z.array(z.string()).min(1),
    tuple: z.tuple([z.string(), z.number()]),
    record: z.record(z.string(), z.number()),
    enum: z.enum(['a', 'b']),
    literal: z.literal('x'),
    default: z.string().default('d'),
    lazy: z.lazy(() => z.string()),
    pipe: z.string().transform((s) => s.length),
    meta: z.string().meta({ description: 'd' }),
  };
  out.defs = Object.fromEntries(Object.entries(reps).map(([k, s]) => [k, defShape(s)]));
  console.log(JSON.stringify(out));
}
