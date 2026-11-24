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

/** For each kind of schema, the methods its classes have beyond those of every schema. */
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
  ['function', ['implement', 'implementAsync', 'input', 'output']],
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

/** What one example of each construct Appendix A names leaves in the schema it builds. */
const BUILT: readonly ZodBuilt[] = [
  {
    construct: '.refine',
    builtClass: 'ZodString',
    kind: 'string',
    fields: [],
    checks: ['custom'],
    inner: {},
    registered: false,
  },
  {
    construct: '.superRefine',
    builtClass: 'ZodString',
    kind: 'string',
    fields: [],
    checks: ['custom'],
    inner: {},
    registered: false,
  },
  {
    construct: '.check',
    builtClass: 'ZodString',
    kind: 'string',
    fields: [],
    checks: ['min_length'],
    inner: {},
    registered: false,
  },
  {
    construct: '.overwrite',
    builtClass: 'ZodString',
    kind: 'string',
    fields: [],
    checks: ['overwrite'],
    inner: {},
    registered: false,
  },
  {
    construct: '.transform',
    builtClass: 'ZodPipe',
    kind: 'pipe',
    fields: ['in', 'out'],
    checks: [],
    inner: { in: 'string', out: 'transform' },
    registered: false,
  },
  {
    construct: '.pipe',
    builtClass: 'ZodPipe',
    kind: 'pipe',
    fields: ['in', 'out'],
    checks: [],
    inner: { in: 'string', out: 'string' },
    registered: false,
  },
  {
    construct: 'z.preprocess',
    builtClass: 'ZodPreprocess',
    kind: 'pipe',
    fields: ['in', 'out'],
    checks: [],
    inner: { in: 'transform', out: 'string' },
    registered: false,
  },
  {
    construct: 'z.codec',
    builtClass: 'ZodCodec',
    kind: 'pipe',
    fields: ['in', 'out', 'reverseTransform', 'transform'],
    checks: [],
    inner: { in: 'string', out: 'number' },
    registered: false,
  },
  {
    construct: 'z.stringbool',
    builtClass: 'ZodCodec',
    kind: 'pipe',
    fields: ['in', 'out', 'reverseTransform', 'transform'],
    checks: [],
    inner: { in: 'string', out: 'boolean' },
    registered: false,
  },
  {
    construct: 'z.coerce.*',
    builtClass: 'ZodNumber',
    kind: 'number',
    fields: ['coerce'],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: '.catch',
    builtClass: 'ZodCatch',
    kind: 'catch',
    fields: ['catchValue', 'innerType'],
    checks: [],
    inner: { innerType: 'string' },
    registered: false,
  },
  {
    construct: '.default',
    builtClass: 'ZodDefault',
    kind: 'default',
    fields: ['defaultValue', 'innerType'],
    checks: [],
    inner: { innerType: 'string' },
    registered: false,
  },
  {
    construct: '.prefault',
    builtClass: 'ZodPrefault',
    kind: 'prefault',
    fields: ['defaultValue', 'innerType'],
    checks: [],
    inner: { innerType: 'string' },
    registered: false,
  },
  {
    construct: '.optional',
    builtClass: 'ZodOptional',
    kind: 'optional',
    fields: ['innerType'],
    checks: [],
    inner: { innerType: 'string' },
    registered: false,
  },
  {
    construct: '.exactOptional',
    builtClass: 'ZodExactOptional',
    kind: 'optional',
    fields: ['innerType'],
    checks: [],
    inner: { innerType: 'string' },
    registered: false,
  },
  {
    construct: '.nullable',
    builtClass: 'ZodNullable',
    kind: 'nullable',
    fields: ['innerType'],
    checks: [],
    inner: { innerType: 'string' },
    registered: false,
  },
  {
    construct: '.nullish',
    builtClass: 'ZodOptional',
    kind: 'optional',
    fields: ['innerType'],
    checks: [],
    inner: { innerType: 'nullable' },
    registered: false,
  },
  {
    construct: '.readonly',
    builtClass: 'ZodReadonly',
    kind: 'readonly',
    fields: ['innerType'],
    checks: [],
    inner: { innerType: 'object' },
    registered: false,
  },
  {
    construct: '.brand',
    builtClass: 'ZodString',
    kind: 'string',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.lazy',
    builtClass: 'ZodLazy',
    kind: 'lazy',
    fields: ['getter'],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.custom',
    builtClass: 'ZodCustom',
    kind: 'custom',
    fields: ['abort', 'check', 'fn'],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.instanceof',
    builtClass: 'ZodInstanceOf',
    kind: 'custom',
    fields: ['abort', 'check', 'fn'],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.date',
    builtClass: 'ZodDate',
    kind: 'date',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.bigint',
    builtClass: 'ZodBigInt',
    kind: 'bigint',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.map',
    builtClass: 'ZodMap',
    kind: 'map',
    fields: ['keyType', 'valueType'],
    checks: [],
    inner: { keyType: 'string', valueType: 'string' },
    registered: false,
  },
  {
    construct: 'z.set',
    builtClass: 'ZodSet',
    kind: 'set',
    fields: ['valueType'],
    checks: [],
    inner: { valueType: 'string' },
    registered: false,
  },
  {
    construct: 'z.undefined',
    builtClass: 'ZodUndefined',
    kind: 'undefined',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.void',
    builtClass: 'ZodVoid',
    kind: 'void',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.symbol',
    builtClass: 'ZodSymbol',
    kind: 'symbol',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.nan',
    builtClass: 'ZodNaN',
    kind: 'nan',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.file',
    builtClass: 'ZodFile',
    kind: 'file',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.never',
    builtClass: 'ZodNever',
    kind: 'never',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.unknown',
    builtClass: 'ZodUnknown',
    kind: 'unknown',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.any',
    builtClass: 'ZodAny',
    kind: 'any',
    fields: [],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.templateLiteral',
    builtClass: 'ZodTemplateLiteral',
    kind: 'template_literal',
    fields: ['parts'],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.email',
    builtClass: 'ZodEmail',
    kind: 'string',
    fields: ['abort', 'check', 'format', 'pattern'],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.uuid',
    builtClass: 'ZodUUID',
    kind: 'string',
    fields: ['abort', 'check', 'format', 'pattern'],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: 'z.iso.*',
    builtClass: 'ZodISODateTime',
    kind: 'string',
    fields: ['check', 'format', 'local', 'offset', 'pattern', 'precision'],
    checks: [],
    inner: {},
    registered: false,
  },
  {
    construct: '.meta',
    builtClass: 'ZodString',
    kind: 'string',
    fields: [],
    checks: [],
    inner: {},
    registered: true,
  },
  {
    construct: '.describe',
    builtClass: 'ZodString',
    kind: 'string',
    fields: [],
    checks: [],
    inner: {},
    registered: true,
  },
  {
    construct: 'z.strictObject',
    builtClass: 'ZodObject',
    kind: 'object',
    fields: ['catchall', 'shape'],
    checks: [],
    inner: { catchall: 'never' },
    registered: false,
  },
  {
    construct: 'z.looseObject',
    builtClass: 'ZodObject',
    kind: 'object',
    fields: ['catchall', 'shape'],
    checks: [],
    inner: { catchall: 'unknown' },
    registered: false,
  },
  {
    construct: '.catchall',
    builtClass: 'ZodObject',
    kind: 'object',
    fields: ['catchall', 'shape'],
    checks: [],
    inner: { catchall: 'number' },
    registered: false,
  },
  {
    construct: 'z.object',
    builtClass: 'ZodObject',
    kind: 'object',
    fields: ['shape'],
    checks: [],
    inner: {},
    registered: false,
  },
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

  it('does not name these functions and these methods of every schema', () => {
    const unnamed = everyBuilder.filter((builder) => !names.some((name) => covers(name, builder)));

    expect(unnamed).toEqual(UNNAMED);
  });
});
