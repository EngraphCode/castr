import { isJsonObject, type JsonObject } from '../rows/json.js';

/**
 * The rows of the picture a document states a construct of, and whatever it states that
 * is no row.
 */
export interface RowsUsed {
  readonly used: ReadonlySet<string>;
  /** Fields met that no row names, as `object.field`. */
  readonly unrecognised: readonly string[];
}

/** What a field of an object holds: one object of a kind, a list of them, or a map. */
type Holds = readonly [kind: string, shape: 'one' | 'list' | 'map'];

const SCHEMA = 'schema';
/**
 * A path item. Wherever one is held, in 3.1 and in 3.2, an object with `$ref` is a path
 * item whose `$ref` is one of its fields, and never a reference.
 */
const PATH_ITEM = 'path-item';
const one = (kind: string): Holds => [kind, 'one'];
const list = (kind: string): Holds => [kind, 'list'];
const map = (kind: string): Holds => [kind, 'map'];

const OPERATION_FIELDS = ['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'];

/**
 * Where the objects of a document are: for each kind of object, the fields that hold
 * another object, and its kind. The kinds are named as the rows name them. A field that
 * is not here holds a plain value.
 */
const CHILDREN: Readonly<Record<string, Readonly<Record<string, Holds>>>> = {
  openapi: {
    info: one('info'),
    servers: list('server'),
    paths: one('paths'),
    webhooks: map(PATH_ITEM),
    components: one('components'),
    security: list('security-requirement'),
    tags: list('tag'),
    externalDocs: one('external-documentation'),
  },
  info: { contact: one('contact'), license: one('license') },
  server: { variables: map('server-variable') },
  components: {
    schemas: map(SCHEMA),
    responses: map('response'),
    parameters: map('parameter'),
    examples: map('example'),
    requestBodies: map('request-body'),
    headers: map('header'),
    securitySchemes: map('security-scheme'),
    links: map('link'),
    callbacks: map('callbacks'),
    pathItems: map(PATH_ITEM),
    mediaTypes: map('media-type'),
  },
  'path-item': {
    ...Object.fromEntries([...OPERATION_FIELDS, 'query'].map((name) => [name, one('operation')])),
    additionalOperations: map('operation'),
    parameters: list('parameter'),
    servers: list('server'),
  },
  operation: {
    externalDocs: one('external-documentation'),
    parameters: list('parameter'),
    requestBody: one('request-body'),
    responses: one('responses'),
    callbacks: map('callbacks'),
    security: list('security-requirement'),
    servers: list('server'),
  },
  parameter: { schema: one(SCHEMA), content: one('content'), examples: map('example') },
  header: { schema: one(SCHEMA), content: one('content'), examples: map('example') },
  'request-body': { content: one('content') },
  'media-type': {
    schema: one(SCHEMA),
    itemSchema: one(SCHEMA),
    examples: map('example'),
    encoding: map('encoding'),
    prefixEncoding: list('encoding'),
    itemEncoding: one('encoding'),
  },
  encoding: {
    headers: map('header'),
    encoding: map('encoding'),
    prefixEncoding: list('encoding'),
    itemEncoding: one('encoding'),
  },
  response: { headers: map('header'), content: one('content'), links: map('link') },
  link: { server: one('server') },
  tag: { externalDocs: one('external-documentation') },
  'security-scheme': { flows: one('oauth-flows') },
  'oauth-flows': {
    implicit: one('oauth-flows/implicit'),
    password: one('oauth-flows/password'),
    clientCredentials: one('oauth-flows/client-credentials'),
    authorizationCode: one('oauth-flows/authorization-code'),
    deviceAuthorization: one('oauth-flows/device-authorization'),
  },
};

/**
 * The kinds of object whose entries are keyed by something the author chooses: for a
 * key, the row it is an entry of and the kind of object it holds, or nothing where the
 * key is none the object allows.
 */
const KEYED: Readonly<
  Record<string, (key: string) => readonly [row: string, kind: string] | undefined>
> = {
  paths: () => ['paths[a path template]', PATH_ITEM],
  content: () => ['content[a media type]', 'media-type'],
  callbacks: () => ['callbacks[a callback expression]', PATH_ITEM],
  responses: (key) => {
    if (key === 'default') {
      return ['responses.default', 'response'];
    }
    if (/^[1-5]XX$/.test(key)) {
      return ['responses[a status range]', 'response'];
    }
    return /^[1-5]\d\d$/.test(key) ? ['responses[an exact status code]', 'response'] : undefined;
  },
};

/** The keyed kinds whose entries are media types or the like, and admit no extension. */
const NOT_EXTENSIBLE: ReadonlySet<string> = new Set(['content']);

/** The keyed kinds that may be given by reference instead. */
const KEYED_BY_REFERENCE: ReadonlySet<string> = new Set(['callbacks']);

/**
 * The fields the definitions declare as a map from a name to a string, as
 * `object.field`.
 */
const MAPS_OF_STRINGS: ReadonlySet<string> = new Set([
  'link.parameters',
  ...[
    'implicit',
    'password',
    'client-credentials',
    'authorization-code',
    'device-authorization',
  ].map((flow) => `oauth-flows/${flow}.scopes`),
]);
const MAP_OF_STRINGS_ROW = 'map-of-strings[an entry of a map of strings]';

/** Keywords that hold one schema, a list of schemas, or a map of schemas. */
const SCHEMA_IN: Readonly<Record<string, 'one' | 'list' | 'map'>> = {
  items: 'one',
  contains: 'one',
  additionalProperties: 'one',
  propertyNames: 'one',
  if: 'one',
  then: 'one',
  else: 'one',
  not: 'one',
  unevaluatedItems: 'one',
  unevaluatedProperties: 'one',
  contentSchema: 'one',
  prefixItems: 'list',
  allOf: 'list',
  anyOf: 'list',
  oneOf: 'list',
  properties: 'map',
  patternProperties: 'map',
  dependentSchemas: 'map',
  $defs: 'map',
};

/** The objects OpenAPI adds to a schema, by the field that holds each. */
const SCHEMA_VOCABULARY: Readonly<Record<string, string>> = {
  discriminator: 'discriminator',
  externalDocs: 'external-docs',
  xml: 'xml',
};

const UNKNOWN_FORMAT = 'text:format: a value no specification defines';
const UNKNOWN_KEYWORD = 'text:a keyword no vocabulary defines';
const NOT_A_PRIMITIVE = 'text:`const` or an `enum` member that is an object or array';

function each(value: unknown, shape: 'one' | 'list' | 'map'): readonly unknown[] {
  if (shape === 'one') {
    return [value];
  }
  if (shape === 'list') {
    return Array.isArray(value) ? value : [];
  }
  return isJsonObject(value) ? Object.values(value) : [];
}

/**
 * Walks a whole document and names every row of the picture it states a construct of.
 * `rows` is every row there is: a field is a row where its object and name are one, and
 * a value is a row where the definitions fix it.
 *
 * A row is used where the document states its construct. A construct in force by
 * default, which the document does not write, is not named. A reference is not
 * followed: what it points at is walked where it is declared.
 */
export function rowsUsedBy(document: JsonObject, rows: ReadonlySet<string>): RowsUsed {
  const used = new Set<string>();
  const unrecognised = new Set<string>();
  const use = (row: string): void => {
    if (rows.has(row)) {
      used.add(row);
    } else {
      unrecognised.add(row);
    }
  };

  const useField = (kind: string, name: string, value: unknown): void => {
    const fixed = `${kind}.${name}=${String(value)}`;
    const free = `${kind}.${name}`;
    const isFixed = typeof value !== 'object' && rows.has(fixed);
    if (isFixed) {
      used.add(fixed);
    }
    if (rows.has(free)) {
      used.add(free);
    } else if (!isFixed) {
      unrecognised.add(free);
    }
  };

  const useExtension = (kind: string): void => {
    if (kind === SCHEMA) {
      use('text:`x-` extension on a schema');
    } else if (Object.values(SCHEMA_VOCABULARY).includes(kind)) {
      // An object OpenAPI adds to a schema has a row of its own for its extensions.
      use('extensible[an `x-` extension]');
    } else {
      use('specification-extensions[an `x-` extension]');
    }
  };

  const walkSchemaKeyword = (name: string, value: unknown): void => {
    if (name === 'type') {
      if (Array.isArray(value)) {
        use('text:a list of types (`type: [..]`)');
      }
      for (const type of Array.isArray(value) ? value : [value]) {
        use(`type:${String(type)}`);
      }
    }
    if (name === 'format') {
      const row = `text:format: ${String(value)}`;
      use(rows.has(row) ? row : UNKNOWN_FORMAT);
    }
    const members = name === 'enum' && Array.isArray(value) ? value : [];
    if (
      [...(name === 'const' ? [value] : []), ...members].some(
        (member) => isJsonObject(member) || Array.isArray(member),
      )
    ) {
      use(NOT_A_PRIMITIVE);
    }
    const shape = SCHEMA_IN[name];
    if (shape !== undefined) {
      each(value, shape).forEach(walkSchema);
    }
  };

  function walkSchema(schema: unknown): void {
    if (typeof schema === 'boolean') {
      use(schema ? 'text:`true` as a schema' : 'text:`false` as a schema');
      return;
    }
    if (!isJsonObject(schema)) {
      return;
    }
    for (const [name, value] of Object.entries(schema)) {
      if (name.startsWith('x-')) {
        useExtension(SCHEMA);
      } else if (rows.has(`keyword:${name}`)) {
        used.add(`keyword:${name}`);
        walkSchemaKeyword(name, value);
      } else if (rows.has(`schema.${name}`)) {
        used.add(`schema.${name}`);
        const kind = SCHEMA_VOCABULARY[name];
        if (kind !== undefined) {
          walk(kind, value);
        }
      } else {
        use(UNKNOWN_KEYWORD);
      }
    }
  }

  const walkKeyed = (kind: string, node: JsonObject): void => {
    const keyed = KEYED[kind];
    for (const [key, value] of Object.entries(node)) {
      if (key.startsWith('x-') && !NOT_EXTENSIBLE.has(kind)) {
        useExtension(kind);
      } else {
        const entry = keyed?.(key);
        if (entry === undefined) {
          unrecognised.add(`${kind}.${key}`);
        } else {
          use(entry[0]);
          walk(entry[1], value);
        }
      }
    }
  };

  const walkField = (kind: string, name: string, value: unknown): void => {
    useField(kind, name, value);
    if (MAPS_OF_STRINGS.has(`${kind}.${name}`) && each(value, 'map').length > 0) {
      use(MAP_OF_STRINGS_ROW);
    }
    const holds = CHILDREN[kind]?.[name];
    if (kind === 'components' && holds !== undefined && each(value, 'map').length > 0) {
      use('components[a component name]');
    }
    if (holds !== undefined) {
      each(value, holds[1]).forEach((child) => {
        walk(holds[0], child);
      });
    }
  };

  // A reference stands in for the object, and holds only what a reference holds: it
  // admits no extension. A path item is the exception: its `$ref` is a field of its
  // own beside the others.
  const isReferenceAt = (kind: string, node: JsonObject): boolean => {
    const mayBeReference = kind in KEYED ? KEYED_BY_REFERENCE.has(kind) : kind !== PATH_ITEM;
    return '$ref' in node && mayBeReference;
  };

  const walkObject = (kind: string, node: JsonObject): void => {
    const isReference = isReferenceAt(kind, node);
    if (kind in KEYED && !isReference) {
      walkKeyed(kind, node);
      return;
    }
    for (const [name, value] of Object.entries(node)) {
      if (isReference) {
        useField('reference', name, value);
      } else if (name.startsWith('x-')) {
        useExtension(kind);
      } else {
        walkField(kind, name, value);
      }
    }
  };

  function walk(kind: string, node: unknown): void {
    if (kind === SCHEMA) {
      walkSchema(node);
    } else if (!isJsonObject(node)) {
      // A plain value where an object belongs states nothing more.
    } else if (kind !== 'security-requirement') {
      walkObject(kind, node);
    } else if (Object.keys(node).length > 0) {
      use('security-requirement[a security scheme name]');
    }
  }

  walk('openapi', document);
  return { used, unrecognised: [...unrecognised].sort((a, b) => a.localeCompare(b, 'en')) };
}
