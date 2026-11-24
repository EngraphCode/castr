/**
 * What Zod's functions and methods build, set against Appendix A of the specification.
 *
 * This test compiles against the installed package, runs it, and reads the
 * specification's file, so it is an end-to-end test. Each expectation is a fact about Zod
 * at the pinned version or about what Appendix A names.
 */

import { readFileSync } from 'node:fs';

import { describe, it, expect } from 'vitest';

import {
  readAppendixABuilt,
  readZodBuilders,
  type ZodBuilder,
  type ZodBuilt,
} from './zod-builders.js';

type BuilderRow = readonly [string, readonly string[], boolean, readonly string[], boolean];

/**
 * Every exported function that builds a schema or a check: its name, the schema kinds
 * its return type states, whether it states a schema of no one kind, the checks it
 * states, and whether it states a check of no one kind.
 */
const FACTORIES: readonly BuilderRow[] = [
  ['z._default', ['default'], false, [], false],
  ['z._function', ['function'], false, [], false],
  ['z.any', ['any'], false, [], false],
  ['z.array', ['array'], false, [], false],
  ['z.base64', ['string'], false, ['string_format'], false],
  ['z.base64url', ['string'], false, ['string_format'], false],
  ['z.bigint', ['bigint'], false, [], false],
  ['z.boolean', ['boolean'], false, [], false],
  ['z.catch', ['catch'], false, [], false],
  ['z.check', [], false, [], true],
  ['z.cidrv4', ['string'], false, ['string_format'], false],
  ['z.cidrv6', ['string'], false, ['string_format'], false],
  ['z.clone', [], true, [], false],
  ['z.codec', ['pipe'], false, [], false],
  ['z.coerce.bigint', ['bigint'], false, [], false],
  ['z.coerce.boolean', ['boolean'], false, [], false],
  ['z.coerce.date', ['date'], false, [], false],
  ['z.coerce.number', ['number'], false, [], false],
  ['z.coerce.string', ['string'], false, [], false],
  ['z.compile', [], true, [], false],
  ['z.creditCard', ['string'], false, ['string_format'], false],
  ['z.cuid', ['string'], false, ['string_format'], false],
  ['z.cuid2', ['string'], false, ['string_format'], false],
  ['z.currencyCode', ['string'], false, ['string_format'], false],
  ['z.custom', ['custom'], false, ['custom'], false],
  ['z.date', ['date'], false, [], false],
  ['z.deepPartial', [], true, [], false],
  ['z.describe', [], false, [], true],
  ['z.discriminatedUnion', ['union'], false, [], false],
  ['z.e164', ['string'], false, ['string_format'], false],
  ['z.email', ['string'], false, ['string_format'], false],
  ['z.emoji', ['string'], false, ['string_format'], false],
  ['z.endsWith', [], false, ['string_format'], false],
  ['z.enum', ['enum'], false, [], false],
  ['z.exactOptional', ['optional'], false, [], false],
  ['z.file', ['file'], false, [], false],
  ['z.float32', ['number'], false, ['number_format'], false],
  ['z.float64', ['number'], false, ['number_format'], false],
  ['z.fromJSONSchema', [], true, [], false],
  ['z.function', ['function'], false, [], false],
  ['z.getDiscriminatedOption', [], true, [], false],
  ['z.gt', [], false, ['greater_than'], false],
  ['z.gte', [], false, ['greater_than'], false],
  ['z.guid', ['string'], false, ['string_format'], false],
  ['z.hash', ['string'], false, ['string_format'], false],
  ['z.hex', ['string'], false, ['string_format'], false],
  ['z.hostname', ['string'], false, ['string_format'], false],
  ['z.httpUrl', ['string'], false, ['string_format'], false],
  ['z.iban', ['string'], false, ['string_format'], false],
  ['z.includes', [], false, ['string_format'], false],
  ['z.input', [], true, [], false],
  ['z.instanceof', ['custom'], false, ['custom'], false],
  ['z.int', ['number'], false, ['number_format'], false],
  ['z.int32', ['number'], false, ['number_format'], false],
  ['z.int64', ['bigint'], false, ['bigint_format'], false],
  ['z.intersection', ['intersection'], false, [], false],
  ['z.invertCodec', ['pipe'], false, [], false],
  ['z.ipv4', ['string'], false, ['string_format'], false],
  ['z.ipv6', ['string'], false, ['string_format'], false],
  ['z.iso.date', ['string'], false, ['string_format'], false],
  ['z.iso.datetime', ['string'], false, ['string_format'], false],
  ['z.iso.duration', ['string'], false, ['string_format'], false],
  ['z.iso.time', ['string'], false, ['string_format'], false],
  ['z.json', ['union'], false, [], false],
  ['z.jwt', ['string'], false, ['string_format'], false],
  ['z.keyof', ['enum'], false, [], false],
  ['z.ksuid', ['string'], false, ['string_format'], false],
  ['z.lazy', ['lazy'], false, [], false],
  ['z.length', [], false, ['length_equals'], false],
  ['z.literal', ['literal'], false, [], false],
  ['z.looseObject', ['object'], false, [], false],
  ['z.looseRecord', ['record'], false, [], false],
  ['z.lowercase', [], false, ['string_format'], false],
  ['z.lt', [], false, ['less_than'], false],
  ['z.lte', [], false, ['less_than'], false],
  ['z.mac', ['string'], false, ['string_format'], false],
  ['z.map', ['map'], false, [], false],
  ['z.maxLength', [], false, ['max_length'], false],
  ['z.maxSize', [], false, ['max_size'], false],
  ['z.meta', [], false, [], true],
  ['z.mime', [], false, ['mime_type'], false],
  ['z.minLength', [], false, ['min_length'], false],
  ['z.minSize', [], false, ['min_size'], false],
  ['z.multipleOf', [], false, ['multiple_of'], false],
  ['z.nan', ['nan'], false, [], false],
  ['z.nanoid', ['string'], false, ['string_format'], false],
  ['z.nativeEnum', ['enum'], false, [], false],
  ['z.negative', [], false, ['less_than'], false],
  ['z.never', ['never'], false, [], false],
  ['z.nonnegative', [], false, ['greater_than'], false],
  ['z.nonoptional', ['nonoptional'], false, [], false],
  ['z.nonpositive', [], false, ['less_than'], false],
  ['z.normalize', [], false, ['overwrite'], false],
  ['z.null', ['null'], false, [], false],
  ['z.nullable', ['nullable'], false, [], false],
  ['z.nullish', ['optional'], false, [], false],
  ['z.number', ['number'], false, [], false],
  ['z.object', ['object'], false, [], false],
  ['z.optional', ['optional'], false, [], false],
  ['z.output', [], true, [], false],
  ['z.overwrite', [], false, ['overwrite'], false],
  ['z.partialRecord', ['record'], false, [], false],
  ['z.pipe', ['pipe'], false, [], false],
  ['z.positive', [], false, ['greater_than'], false],
  ['z.prefault', ['prefault'], false, [], false],
  ['z.preprocess', ['pipe'], false, [], false],
  ['z.promise', ['promise'], false, [], false],
  ['z.properties', [], false, ['properties'], false],
  ['z.property', [], false, ['property'], false],
  ['z.readonly', ['readonly'], false, [], false],
  ['z.record', ['record'], false, [], false],
  ['z.refine', [], false, [], true],
  ['z.regex', [], false, ['string_format'], false],
  ['z.set', ['set'], false, [], false],
  ['z.size', [], false, ['size_equals'], false],
  ['z.slugify', [], false, ['overwrite'], false],
  ['z.startsWith', [], false, ['string_format'], false],
  ['z.strictObject', ['object'], false, [], false],
  ['z.string', ['string'], true, [], false],
  ['z.stringbool', ['pipe'], false, [], false],
  ['z.stringFormat', ['string'], false, ['string_format'], false],
  ['z.success', ['success'], false, [], false],
  ['z.superRefine', [], false, [], true],
  ['z.symbol', ['symbol'], false, [], false],
  ['z.templateLiteral', ['template_literal'], false, [], false],
  ['z.toLowerCase', [], false, ['overwrite'], false],
  ['z.toUpperCase', [], false, ['overwrite'], false],
  ['z.transform', ['transform'], false, [], false],
  ['z.trim', [], false, ['overwrite'], false],
  ['z.tuple', ['tuple'], false, [], false],
  ['z.uint32', ['number'], false, ['number_format'], false],
  ['z.uint64', ['bigint'], false, ['bigint_format'], false],
  ['z.ulid', ['string'], false, ['string_format'], false],
  ['z.undefined', ['undefined'], false, [], false],
  ['z.union', ['union'], false, [], false],
  ['z.unknown', ['unknown'], false, [], false],
  ['z.uppercase', [], false, ['string_format'], false],
  ['z.url', ['string'], false, ['string_format'], false],
  ['z.uuid', ['string'], false, ['string_format'], false],
  ['z.uuidv4', ['string'], false, ['string_format'], false],
  ['z.uuidv6', ['string'], false, ['string_format'], false],
  ['z.uuidv7', ['string'], false, ['string_format'], false],
  ['z.void', ['void'], false, [], false],
  ['z.withParser', [], true, [], false],
  ['z.xid', ['string'], false, ['string_format'], false],
  ['z.xor', ['union'], false, [], false],
];

/** Every method of a schema that builds a schema, in the same columns. */
const METHODS: readonly BuilderRow[] = [
  ['.and', ['intersection'], false, [], false],
  ['.array', ['array'], false, [], false],
  ['.brand', [], true, [], false],
  ['.catch', ['catch'], false, [], false],
  ['.check', [], true, [], false],
  ['.clone', [], true, [], false],
  ['.default', ['default'], false, [], false],
  ['.describe', [], true, [], false],
  ['.exactOptional', ['optional'], false, [], false],
  ['.meta', [], true, [], false],
  ['.nonoptional', ['nonoptional'], false, [], false],
  ['.nullable', ['nullable'], false, [], false],
  ['.nullish', ['optional'], false, [], false],
  ['.optional', ['optional'], false, [], false],
  ['.or', ['union'], false, [], false],
  ['.overwrite', [], true, [], false],
  ['.pipe', ['pipe'], false, [], false],
  ['.prefault', ['prefault'], false, [], false],
  ['.readonly', ['readonly'], false, [], false],
  ['.refine', [], true, [], false],
  ['.register', [], true, [], false],
  ['.superRefine', [], true, [], false],
  ['.transform', ['pipe'], false, [], false],
  ['.with', [], true, [], false],
];

/**
 * For each kind of schema, the methods its classes have beyond those of every schema,
 * that build a schema or a check.
 */
const KIND_METHODS: readonly (readonly [string, readonly string[]])[] = [
  ['array', ['length', 'max', 'min', 'nonempty', 'unwrap']],
  [
    'bigint',
    [
      'gt',
      'gte',
      'lt',
      'lte',
      'max',
      'min',
      'multipleOf',
      'negative',
      'nonnegative',
      'nonpositive',
      'positive',
    ],
  ],
  ['catch', ['removeCatch', 'unwrap']],
  ['custom', ['properties']],
  ['date', ['max', 'min']],
  ['default', ['removeDefault', 'unwrap']],
  ['enum', ['exclude', 'extract']],
  ['file', ['max', 'mime', 'min']],
  ['function', ['input', 'output']],
  ['lazy', ['unwrap']],
  ['map', ['max', 'min', 'nonempty', 'size']],
  ['nonoptional', ['unwrap']],
  ['nullable', ['unwrap']],
  [
    'number',
    [
      'finite',
      'gt',
      'gte',
      'int',
      'lt',
      'lte',
      'max',
      'min',
      'multipleOf',
      'negative',
      'nonnegative',
      'nonpositive',
      'positive',
      'safe',
      'step',
    ],
  ],
  [
    'object',
    [
      'catchall',
      'exactPartial',
      'extend',
      'keyof',
      'loose',
      'merge',
      'omit',
      'partial',
      'passthrough',
      'pick',
      'required',
      'safeExtend',
      'strict',
      'strip',
    ],
  ],
  ['optional', ['unwrap']],
  ['prefault', ['unwrap']],
  ['promise', ['unwrap']],
  ['readonly', ['unwrap']],
  ['set', ['max', 'min', 'nonempty', 'size']],
  [
    'string',
    [
      'base64',
      'base64url',
      'cidrv4',
      'cidrv6',
      'cuid',
      'cuid2',
      'date',
      'datetime',
      'duration',
      'e164',
      'email',
      'emoji',
      'endsWith',
      'guid',
      'includes',
      'ipv4',
      'ipv6',
      'jwt',
      'ksuid',
      'length',
      'lowercase',
      'max',
      'min',
      'nanoid',
      'nonempty',
      'normalize',
      'regex',
      'slugify',
      'startsWith',
      'time',
      'toLowerCase',
      'toUpperCase',
      'trim',
      'ulid',
      'uppercase',
      'url',
      'uuid',
      'uuidv4',
      'uuidv6',
      'uuidv7',
      'xid',
    ],
  ],
  ['success', ['unwrap']],
  ['tuple', ['partial', 'rest']],
];

/**
 * One expected reading: a construct, the class and the kind it builds, and whatever else
 * it holds. A construct that holds no field, check or inner schema and is not registered
 * is written with the first three alone.
 */
function holds(
  construct: string,
  builtClass: string,
  kind: string,
  more: Partial<Pick<ZodBuilt, 'fields' | 'checks' | 'inner' | 'registered'>> = {},
): ZodBuilt {
  return {
    construct,
    builtClass,
    kind,
    fields: [],
    checks: [],
    inner: {},
    registered: false,
    ...more,
  };
}

/** What one example of each construct Appendix A names leaves in the schema it builds. */
const BUILT: readonly ZodBuilt[] = [
  holds('.refine', 'ZodString', 'string', { checks: ['custom'] }),
  holds('.superRefine', 'ZodString', 'string', { checks: ['custom'] }),
  holds('.check', 'ZodString', 'string', { checks: ['min_length'] }),
  holds('.overwrite', 'ZodString', 'string', { checks: ['overwrite'] }),
  holds('.transform', 'ZodPipe', 'pipe', {
    fields: ['in', 'out'],
    inner: { in: 'string', out: 'transform' },
  }),
  holds('.pipe', 'ZodPipe', 'pipe', {
    fields: ['in', 'out'],
    inner: { in: 'string', out: 'string' },
  }),
  holds('z.preprocess', 'ZodPreprocess', 'pipe', {
    fields: ['in', 'out'],
    inner: { in: 'transform', out: 'string' },
  }),
  holds('z.codec', 'ZodCodec', 'pipe', {
    fields: ['in', 'out', 'reverseTransform', 'transform'],
    inner: { in: 'string', out: 'number' },
  }),
  holds('z.stringbool', 'ZodCodec', 'pipe', {
    fields: ['in', 'out', 'reverseTransform', 'transform'],
    inner: { in: 'string', out: 'boolean' },
  }),
  holds('z.coerce.*', 'ZodNumber', 'number', { fields: ['coerce'] }),
  holds('.catch', 'ZodCatch', 'catch', {
    fields: ['catchValue', 'innerType'],
    inner: { innerType: 'string' },
  }),
  holds('.default', 'ZodDefault', 'default', {
    fields: ['defaultValue', 'innerType'],
    inner: { innerType: 'string' },
  }),
  holds('.prefault', 'ZodPrefault', 'prefault', {
    fields: ['defaultValue', 'innerType'],
    inner: { innerType: 'string' },
  }),
  holds('.optional', 'ZodOptional', 'optional', {
    fields: ['innerType'],
    inner: { innerType: 'string' },
  }),
  holds('.exactOptional', 'ZodExactOptional', 'optional', {
    fields: ['innerType'],
    inner: { innerType: 'string' },
  }),
  holds('.nullable', 'ZodNullable', 'nullable', {
    fields: ['innerType'],
    inner: { innerType: 'string' },
  }),
  holds('.nullish', 'ZodOptional', 'optional', {
    fields: ['innerType'],
    inner: { innerType: 'nullable' },
  }),
  holds('.readonly', 'ZodReadonly', 'readonly', {
    fields: ['innerType'],
    inner: { innerType: 'object' },
  }),
  holds('.brand', 'ZodString', 'string'),
  holds('z.lazy', 'ZodLazy', 'lazy', { fields: ['getter'] }),
  holds('z.custom', 'ZodCustom', 'custom', { fields: ['abort', 'check', 'fn'] }),
  holds('z.instanceof', 'ZodInstanceOf', 'custom', { fields: ['abort', 'check', 'fn'] }),
  holds('z.date', 'ZodDate', 'date'),
  holds('z.bigint', 'ZodBigInt', 'bigint'),
  holds('z.map', 'ZodMap', 'map', {
    fields: ['keyType', 'valueType'],
    inner: { keyType: 'string', valueType: 'string' },
  }),
  holds('z.set', 'ZodSet', 'set', { fields: ['valueType'], inner: { valueType: 'string' } }),
  holds('z.undefined', 'ZodUndefined', 'undefined'),
  holds('z.void', 'ZodVoid', 'void'),
  holds('z.symbol', 'ZodSymbol', 'symbol'),
  holds('z.nan', 'ZodNaN', 'nan'),
  holds('z.file', 'ZodFile', 'file'),
  holds('z.never', 'ZodNever', 'never'),
  holds('z.unknown', 'ZodUnknown', 'unknown'),
  holds('z.any', 'ZodAny', 'any'),
  holds('z.templateLiteral', 'ZodTemplateLiteral', 'template_literal', { fields: ['parts'] }),
  holds('z.email', 'ZodEmail', 'string', { fields: ['abort', 'check', 'format', 'pattern'] }),
  holds('z.uuid', 'ZodUUID', 'string', { fields: ['abort', 'check', 'format', 'pattern'] }),
  holds('z.iso.*', 'ZodISODateTime', 'string', {
    fields: ['check', 'format', 'local', 'offset', 'pattern', 'precision'],
  }),
  holds('.meta', 'ZodString', 'string', { registered: true }),
  holds('.describe', 'ZodString', 'string', { registered: true }),
  holds('z.strictObject', 'ZodObject', 'object', {
    fields: ['catchall', 'shape'],
    inner: { catchall: 'never' },
  }),
  holds('z.looseObject', 'ZodObject', 'object', {
    fields: ['catchall', 'shape'],
    inner: { catchall: 'unknown' },
  }),
  holds('.catchall', 'ZodObject', 'object', {
    fields: ['catchall', 'shape'],
    inner: { catchall: 'number' },
  }),
  holds('z.object', 'ZodObject', 'object', { fields: ['shape'] }),
];

/** The builders, by type, that no name in Appendix A covers. */
const UNNAMED: readonly string[] = [
  'z._default',
  'z._function',
  'z.array',
  'z.base64',
  'z.base64url',
  'z.boolean',
  'z.catch',
  'z.check',
  'z.cidrv4',
  'z.cidrv6',
  'z.clone',
  'z.compile',
  'z.creditCard',
  'z.cuid',
  'z.cuid2',
  'z.currencyCode',
  'z.deepPartial',
  'z.describe',
  'z.discriminatedUnion',
  'z.e164',
  'z.emoji',
  'z.endsWith',
  'z.enum',
  'z.exactOptional',
  'z.float32',
  'z.float64',
  'z.fromJSONSchema',
  'z.function',
  'z.getDiscriminatedOption',
  'z.gt',
  'z.gte',
  'z.guid',
  'z.hash',
  'z.hex',
  'z.hostname',
  'z.httpUrl',
  'z.iban',
  'z.includes',
  'z.input',
  'z.int',
  'z.int32',
  'z.int64',
  'z.intersection',
  'z.invertCodec',
  'z.ipv4',
  'z.ipv6',
  'z.json',
  'z.jwt',
  'z.keyof',
  'z.ksuid',
  'z.length',
  'z.literal',
  'z.looseRecord',
  'z.lowercase',
  'z.lt',
  'z.lte',
  'z.mac',
  'z.maxLength',
  'z.maxSize',
  'z.meta',
  'z.mime',
  'z.minLength',
  'z.minSize',
  'z.multipleOf',
  'z.nanoid',
  'z.nativeEnum',
  'z.negative',
  'z.nonnegative',
  'z.nonoptional',
  'z.nonpositive',
  'z.normalize',
  'z.null',
  'z.nullable',
  'z.nullish',
  'z.number',
  'z.optional',
  'z.output',
  'z.overwrite',
  'z.partialRecord',
  'z.pipe',
  'z.positive',
  'z.prefault',
  'z.promise',
  'z.properties',
  'z.property',
  'z.readonly',
  'z.record',
  'z.refine',
  'z.regex',
  'z.size',
  'z.slugify',
  'z.startsWith',
  'z.string',
  'z.stringFormat',
  'z.success',
  'z.superRefine',
  'z.toLowerCase',
  'z.toUpperCase',
  'z.transform',
  'z.trim',
  'z.tuple',
  'z.uint32',
  'z.uint64',
  'z.ulid',
  'z.union',
  'z.uppercase',
  'z.url',
  'z.uuidv4',
  'z.uuidv6',
  'z.uuidv7',
  'z.withParser',
  'z.xid',
  'z.xor',
  '.and',
  '.array',
  '.clone',
  '.nonoptional',
  '.or',
  '.register',
  '.with',
];

const builders = readZodBuilders();
const built = readAppendixABuilt();

function asRow(builder: ZodBuilder): BuilderRow {
  return [
    builder.name,
    builder.schemaKinds,
    builder.anySchema,
    builder.checkKinds,
    builder.anyCheck,
  ];
}

function builtNamed(construct: string): ZodBuilt {
  const found = built.find((candidate) => candidate.construct === construct);
  if (found === undefined) {
    throw new Error(`no built construct named ${construct}`);
  }
  return found;
}

/** The names Appendix A gives in its first column, read from the specification. */
function appendixANames(): readonly string[] {
  const specification = readFileSync(
    new URL('../../../docs/SPECIFICATION.md', import.meta.url),
    'utf8',
  );
  const start = specification.indexOf('## Appendix A.');
  const end = specification.indexOf('## Appendix B.');
  return specification
    .slice(start, end)
    .split('\n')
    .filter((line) => line.startsWith('| `'))
    .flatMap((line) => [...(line.split('|')[1] ?? '').matchAll(/`([^`]+)`/g)])
    .map((match) => match[1] ?? '');
}

/** Whether a name Appendix A gives covers a builder: itself, or its family by `.*`. */
function covers(appendixName: string, builderName: string): boolean {
  return appendixName.endsWith('.*')
    ? builderName.startsWith(appendixName.slice(0, -1))
    : appendixName === builderName;
}

describe("what Zod's functions and methods build, by their types", () => {
  it('lists the 146 exported functions that build a schema or a check', () => {
    expect(builders.factories).toHaveLength(146);
    expect(builders.factories.map(asRow)).toEqual(FACTORIES);
  });

  it('lists the 24 methods of a schema that build a schema', () => {
    expect(builders.methods).toHaveLength(24);
    expect(builders.methods.map(asRow)).toEqual(METHODS);
  });
});

describe('the methods each kind of schema has beyond those of every schema', () => {
  it('lists them for the 23 kinds that have any', () => {
    expect(builders.kindMethods).toHaveLength(23);
    expect(builders.kindMethods.map((entry) => [entry.kind, entry.methods])).toEqual(KIND_METHODS);
  });

  it('leaves out a method that builds neither a schema nor a check', () => {
    const ofAFunction = builders.kindMethods.find((entry) => entry.kind === 'function');

    expect(ofAFunction?.methods).toEqual(['input', 'output']);
  });

  it('gives an object the four methods that set its policy for unknown keys', () => {
    const object = builders.kindMethods.find((entry) => entry.kind === 'object');

    expect(object?.methods).toEqual(
      expect.arrayContaining(['catchall', 'loose', 'strict', 'strip']),
    );
    expect(object?.methods).toContain('passthrough');
  });
});

describe('what the constructs Appendix A names leave in a schema', () => {
  it('builds one example of each and reads its definition', () => {
    expect(built).toEqual(BUILT);
  });

  it('has an example for every name Appendix A gives, and for no other', () => {
    expect(built.map((entry) => entry.construct).sort()).toEqual([...appendixANames()].sort());
  });

  it('tells the four policies for unknown keys apart by the catchall alone', () => {
    expect(builtNamed('z.object').inner).toEqual({});
    expect(builtNamed('z.strictObject').inner).toEqual({ catchall: 'never' });
    expect(builtNamed('z.looseObject').inner).toEqual({ catchall: 'unknown' });
    expect(builtNamed('.catchall').inner).toEqual({ catchall: 'number' });
  });

  it('tells an exact optional from an optional by its class alone', () => {
    const optional = builtNamed('.optional');
    const exact = builtNamed('.exactOptional');

    expect({ ...exact, construct: '', builtClass: '' }).toEqual({
      ...optional,
      construct: '',
      builtClass: '',
    });
    expect([optional.builtClass, exact.builtClass]).toEqual(['ZodOptional', 'ZodExactOptional']);
  });

  it('leaves nothing in the schema for a brand, and a registry entry for metadata', () => {
    expect(builtNamed('.brand').fields).toEqual([]);
    expect(builtNamed('.brand').checks).toEqual([]);
    expect(builtNamed('.brand').registered).toBe(false);
    expect(builtNamed('.meta').registered).toBe(true);
    expect(builtNamed('.describe').registered).toBe(true);
    expect(builtNamed('.meta').checks).toEqual([]);
  });
});

describe('Appendix A set against what Zod builds', () => {
  const names = appendixANames();
  const everyBuilder = [...builders.factories, ...builders.methods].map((entry) => entry.name);
  const ofOneKind = builders.kindMethods.flatMap((entry) =>
    entry.methods.map((method) => `.${method}`),
  );

  it('names only constructs Zod has', () => {
    const known = [...everyBuilder, ...ofOneKind];
    const missing = names.filter((name) => !known.some((builder) => covers(name, builder)));

    expect(missing).toEqual([]);
  });

  it('names one method that only one kind of schema has', () => {
    expect(
      names.filter((name) => ofOneKind.includes(name) && !everyBuilder.includes(name)),
    ).toEqual(['.catchall']);
  });

  it('names no other method of one kind, so every other one is unnamed', () => {
    const unnamed = builders.kindMethods.map((entry) => [
      entry.kind,
      entry.methods.filter((method) => !names.includes(`.${method}`)),
    ]);
    const expected = KIND_METHODS.map(([kind, methods]) => [
      kind,
      methods.filter((method) => method !== 'catchall'),
    ]);

    expect(unnamed).toEqual(expected);
    expect(unnamed.flatMap(([, methods]) => methods)).toHaveLength(117);
  });

  it('does not name these functions and these methods of every schema', () => {
    const unnamed = everyBuilder.filter((builder) => !names.some((name) => covers(name, builder)));

    expect(unnamed).toEqual(UNNAMED);
  });
});
