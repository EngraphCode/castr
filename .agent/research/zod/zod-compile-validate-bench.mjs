// Probe A: z.compile() / z.validate() benchmark on castr-shaped schemas (zod 4.5.4).
// Run from the zod-probe prefix (aliases installed): node bench-compile-validate.mjs
import { z } from 'zod45';

const Pet = z.strictObject({
  id: z.uuid(),
  email: z.email(),
  createdAt: z.iso.datetime(),
  count: z.int32(),
  score: z.number().gt(0).multipleOf(0.5),
  tags: z.array(z.string().min(1)).min(1).max(10),
  status: z.enum(['available', 'pending', 'sold']),
  meta: z.strictObject({ note: z.string().optional(), flag: z.boolean() }),
});
const Shape = z.discriminatedUnion('t', [
  z.strictObject({ t: z.literal('circle'), r: z.number().gt(0) }),
  z.strictObject({ t: z.literal('rect'), w: z.number(), h: z.number() }),
]);

const validPet = {
  id: '123e4567-e89b-42d3-a456-426614174000',
  email: 'a@b.co',
  createdAt: '2026-08-31T12:00:00Z',
  count: 3,
  score: 1.5,
  tags: ['x', 'y'],
  status: 'sold',
  meta: { flag: true },
};
const invalidType = { ...validPet, count: 'three' };
const invalidKey = { ...validPet, extra: 1 };
const validShape = { t: 'circle', r: 2 };
const invalidShape = { t: 'circle', r: -1 };

function bench(label, fn, iters) {
  for (let i = 0; i < Math.min(2000, iters); i++) fn();
  const t0 = process.hrtime.bigint();
  for (let i = 0; i < iters; i++) fn();
  const ns = Number(process.hrtime.bigint() - t0);
  const opsPerSec = Math.round((iters / ns) * 1e9);
  console.log(JSON.stringify({ label, iters, opsPerSec }));
  return opsPerSec;
}

const out = { api: { compile: typeof z.compile, validate: typeof z.validate } };
console.log(JSON.stringify(out));

// One-time compile cost (matters for one-shot CLI vs long-lived MCP server).
const tc0 = process.hrtime.bigint();
const PetC = z.compile(Pet);
const petCompileMs = Number(process.hrtime.bigint() - tc0) / 1e6;
const tc1 = process.hrtime.bigint();
const ShapeC = z.compile(Shape);
const shapeCompileMs = Number(process.hrtime.bigint() - tc1) / 1e6;
console.log(JSON.stringify({ label: 'compile-once-ms', petCompileMs, shapeCompileMs }));

const N = 100000;
const r = {};
r.pet_valid_plain = bench('pet valid safeParse plain', () => Pet.safeParse(validPet), N);
r.pet_valid_compiled = bench('pet valid safeParse compiled', () => PetC.safeParse(validPet), N);
r.pet_invalidType_plain = bench('pet invalid-type plain', () => Pet.safeParse(invalidType), N);
r.pet_invalidType_compiled = bench('pet invalid-type compiled', () => PetC.safeParse(invalidType), N);
r.pet_invalidKey_plain = bench('pet unknown-key plain', () => Pet.safeParse(invalidKey), N);
r.pet_invalidKey_compiled = bench('pet unknown-key compiled', () => PetC.safeParse(invalidKey), N);
r.pet_invalid_validate = bench('pet invalid-type z.validate', () => z.validate(Pet, invalidType), N);
r.pet_valid_validate = bench('pet valid z.validate', () => z.validate(Pet, validPet), N);
r.shape_valid_plain = bench('shape valid plain', () => Shape.safeParse(validShape), N);
r.shape_valid_compiled = bench('shape valid compiled', () => ShapeC.safeParse(validShape), N);
r.shape_invalid_validate = bench('shape invalid z.validate', () => z.validate(Shape, invalidShape), N);
r.shape_invalid_plain = bench('shape invalid plain', () => Shape.safeParse(invalidShape), N);

console.log(
  JSON.stringify({
    label: 'ratios',
    compiled_over_plain_valid: +(r.pet_valid_compiled / r.pet_valid_plain).toFixed(2),
    compiled_over_plain_invalidType: +(r.pet_invalidType_compiled / r.pet_invalidType_plain).toFixed(2),
    validate_over_safeParse_invalid: +(r.pet_invalid_validate / r.pet_invalidType_plain).toFixed(2),
    validate_over_safeParse_valid: +(r.pet_valid_validate / r.pet_valid_plain).toFixed(2),
    shape_compiled_over_plain: +(r.shape_valid_compiled / r.shape_valid_plain).toFixed(2),
    shape_validate_over_safeParse_invalid: +(r.shape_invalid_validate / r.shape_invalid_plain).toFixed(2),
  }),
);
