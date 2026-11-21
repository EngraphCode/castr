import type { UnknownRecord } from '../../src/shared/type-utils/types.js';

import type { Expectation, StructureCase } from './structure-case.js';

const OK = { '200': { description: 'ok' } };
const PLAIN = { responses: OK };

function documentOf(paths: UnknownRecord, more: UnknownRecord = {}): UnknownRecord {
  return { openapi: '3.1.0', info: { title: 'case', version: '1' }, paths, ...more };
}

function value(held: string | number): Expectation {
  return { kind: 'value', value: held };
}

const DIFFERENCE: Expectation = { kind: 'difference' };

/** A case about one path item: the construct on `/things`, against a control path item. */
function pathItem(
  field: string,
  item: UnknownRecord,
  control: UnknownRecord,
  expects: Expectation,
  more: UnknownRecord = {},
): StructureCase {
  return {
    rowId: `path-item.${field}`,
    document: documentOf({ '/things': item }, more),
    control: documentOf({ '/things': control }, more),
    expects,
  };
}

/** A case about one operation: `get /things` with the construct, against one without. */
function operation(
  field: string,
  with_: UnknownRecord,
  expects: Expectation,
  without: UnknownRecord = {},
): StructureCase {
  return {
    rowId: `operation.${field}`,
    document: documentOf({ '/things': { get: { ...PLAIN, ...with_ } } }),
    control: documentOf({ '/things': { get: { ...PLAIN, ...without } } }),
    expects,
  };
}

function method(name: string): StructureCase {
  return pathItem(
    name,
    { [name]: PLAIN },
    { [name === 'get' ? 'post' : 'get']: PLAIN },
    value(name),
  );
}

const QUERY_PARAMETER = { name: 'kestrel', in: 'query', schema: { type: 'string' } };

const PATHS_AND_OPERATIONS: readonly StructureCase[] = [
  {
    rowId: 'paths[a path template]',
    document: documentOf({ '/kestrels': { get: PLAIN } }),
    control: documentOf({ '/things': { get: PLAIN } }),
    expects: value('/kestrels'),
  },

  // Each method of a path item, against a path item with another method.
  ...['get', 'put', 'post', 'delete', 'options', 'head', 'patch', 'trace'].map(method),
  {
    ...method('query'),
    document: { ...documentOf({ '/things': { query: PLAIN } }), openapi: '3.2.0' },
    control: { ...documentOf({ '/things': { get: PLAIN } }), openapi: '3.2.0' },
  },
  {
    rowId: 'path-item.additionalOperations',
    document: {
      ...documentOf({ '/things': { additionalOperations: { COPY: PLAIN } } }),
      openapi: '3.2.0',
    },
    control: { ...documentOf({ '/things': { get: PLAIN } }), openapi: '3.2.0' },
    expects: value('COPY'),
  },

  pathItem('summary', { summary: 'kestrel', get: PLAIN }, { get: PLAIN }, value('kestrel')),
  pathItem('description', { description: 'kestrel', get: PLAIN }, { get: PLAIN }, value('kestrel')),
  pathItem(
    'parameters',
    { parameters: [QUERY_PARAMETER], get: PLAIN },
    { get: PLAIN },
    value('kestrel'),
  ),
  // A path item that is a reference to a named one: the name is what is held.
  pathItem('$ref', { $ref: '#/components/pathItems/Kestrel' }, { get: PLAIN }, value('Kestrel'), {
    components: { pathItems: { Kestrel: { get: PLAIN } } },
  }),

  operation('operationId', { operationId: 'kestrelById' }, value('kestrelById'), {
    operationId: 'thingById',
  }),
  operation('summary', { summary: 'kestrel' }, value('kestrel')),
  operation('description', { description: 'kestrel' }, value('kestrel')),
  operation('deprecated', { deprecated: true }, DIFFERENCE),
  operation('parameters', { parameters: [QUERY_PARAMETER] }, value('kestrel')),
  operation(
    'requestBody',
    {
      requestBody: {
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: { kestrel: { type: 'string' } },
              additionalProperties: false,
            },
          },
        },
      },
    },
    value('kestrel'),
  ),
  operation('responses', { responses: { ...OK, '404': { description: 'none' } } }, value(404)),
  operation(
    'callbacks',
    { callbacks: { onKestrel: { '{$request.body#/url}': { post: PLAIN } } } },
    value('onKestrel'),
  ),
];

const STRING = { type: 'string' };
const STRINGS = { type: 'array', items: STRING };

/** `get` on a path, with the parameters given. */
function getWith(
  path: string,
  parameters: readonly UnknownRecord[],
  openapi: string,
): UnknownRecord {
  return { ...documentOf({ [path]: { get: { ...PLAIN, parameters } } }), openapi };
}

/**
 * A case about one parameter: the parameter with the construct, against the same
 * parameter without it or with another value. A parameter in the path is on
 * `/things/{id}`, and any other on `/things`.
 */
function parameter(
  row: string,
  with_: UnknownRecord,
  without: UnknownRecord,
  expects: Expectation,
  openapi = '3.1.0',
): StructureCase {
  const path = with_['in'] === 'path' ? '/things/{id}' : '/things';
  return {
    rowId: `parameter.${row}`,
    document: getWith(path, [with_], openapi),
    control: getWith(path, [without], openapi),
    expects,
  };
}

const KESTREL_OBJECT = {
  type: 'object',
  properties: { kestrel: STRING },
  additionalProperties: false,
};
const IN_QUERY = { name: 'q', in: 'query', schema: STRING };
const IN_PATH = { name: 'id', in: 'path', required: true, schema: STRING };
const MANY_IN_QUERY = { name: 'q', in: 'query', schema: STRINGS };

/** The one payload a `querystring` parameter may have, which any parameter may have too. */
const FORM_CONTENT = {
  content: { 'application/x-www-form-urlencoded': { schema: { type: 'object' } } },
};
const LOCATIONS = ['query', 'header', 'cookie', 'querystring'];

/**
 * A parameter in one location: its name is held, and the definitions differ from those
 * for the same parameter in each other location. Every document is an OpenAPI 3.2 one
 * and gives the parameter the same content, because that is the only form all four
 * locations share; the location is then the only thing that differs.
 */
function location(name: string): StructureCase {
  const at = (where: string): UnknownRecord =>
    getWith('/things', [{ name: 'kestrel', in: where, ...FORM_CONTENT }], '3.2.0');
  return {
    rowId: `parameter.in=${name}`,
    document: at(name),
    control: getWith('/things', [], '3.2.0'),
    expects: value('kestrel'),
    apartFrom: LOCATIONS.filter((other) => other !== name).map(at),
  };
}

/** A style, against the same parameter with another style its location allows. */
function style(name: string, base: UnknownRecord, other: string, openapi?: string): StructureCase {
  return parameter(
    `style=${name}`,
    { ...base, style: name },
    { ...base, style: other },
    value(name),
    openapi,
  );
}

const PARAMETERS: readonly StructureCase[] = [
  parameter('name', { ...IN_QUERY, name: 'kestrel' }, IN_QUERY, value('kestrel')),

  ...LOCATIONS.map(location),

  parameter(
    'required',
    { ...IN_QUERY, required: false },
    { ...IN_QUERY, required: true },
    DIFFERENCE,
  ),
  parameter('required=true', { ...IN_QUERY, required: true }, IN_QUERY, DIFFERENCE),
  parameter(
    'schema',
    { ...IN_QUERY, schema: { type: 'string', enum: ['kestrel'] } },
    IN_QUERY,
    value('kestrel'),
  ),
  // The same schema, carried under a media type and carried directly: the media type is
  // what only the content states.
  parameter(
    'content',
    { name: 'q', in: 'query', content: { 'application/json': { schema: KESTREL_OBJECT } } },
    { name: 'q', in: 'query', schema: KESTREL_OBJECT },
    value('application/json'),
  ),
  parameter('description', { ...IN_QUERY, description: 'kestrel' }, IN_QUERY, value('kestrel')),
  parameter('deprecated', { ...IN_QUERY, deprecated: true }, IN_QUERY, DIFFERENCE),
  parameter('allowEmptyValue', { ...IN_QUERY, allowEmptyValue: true }, IN_QUERY, DIFFERENCE),
  parameter('allowReserved', { ...IN_QUERY, allowReserved: true }, IN_QUERY, DIFFERENCE),
  parameter(
    'explode',
    { ...MANY_IN_QUERY, explode: false },
    { ...MANY_IN_QUERY, explode: true },
    DIFFERENCE,
  ),

  style('form', MANY_IN_QUERY, 'pipeDelimited'),
  style('spaceDelimited', MANY_IN_QUERY, 'form'),
  style('pipeDelimited', MANY_IN_QUERY, 'form'),
  style(
    'deepObject',
    {
      name: 'q',
      in: 'query',
      schema: { type: 'object', properties: { a: STRING }, additionalProperties: false },
    },
    'form',
  ),
  style('simple', IN_PATH, 'label'),
  style('label', IN_PATH, 'simple'),
  style('matrix', IN_PATH, 'simple'),
  style('cookie', { ...IN_QUERY, in: 'cookie' }, 'form', '3.2.0'),
];

const JSON_TYPE = 'application/json';
const KESTREL_ONLY = { type: 'string', enum: ['kestrel'] };

/** `get /things` whose `200` response is the one given. */
function respondingWith(response: UnknownRecord, openapi = '3.1.0'): UnknownRecord {
  return { ...documentOf({ '/things': { get: { responses: { '200': response } } } }), openapi };
}

/** `post /things` with the request body given. */
function sending(requestBody: UnknownRecord, openapi = '3.1.0'): UnknownRecord {
  return { ...documentOf({ '/things': { post: { ...PLAIN, requestBody } } }), openapi };
}

/** A pair of documents made the same way, the second being the control. */
function pair(
  rowId: string,
  make: (given: UnknownRecord) => UnknownRecord,
  with_: UnknownRecord,
  without: UnknownRecord,
  expects: Expectation,
): StructureCase {
  return { rowId, document: make(with_), control: make(without), expects };
}

const JSON_BODY = { content: { [JSON_TYPE]: { schema: KESTREL_OBJECT } } };

const REQUEST_BODIES: readonly StructureCase[] = [
  // One schema under one media type, against the same schema under another.
  pair(
    'request-body.content',
    sending,
    JSON_BODY,
    { content: { 'application/xml': { schema: KESTREL_OBJECT } } },
    value(JSON_TYPE),
  ),
  pair(
    'request-body.description',
    sending,
    { ...JSON_BODY, description: 'osprey' },
    JSON_BODY,
    value('osprey'),
  ),
  pair(
    'request-body.required',
    sending,
    { ...JSON_BODY, required: true },
    { ...JSON_BODY, required: false },
    DIFFERENCE,
  ),
];

/** A `200` response whose content under one media type is the media type object given. */
function contentOf(mediaType: string, object: UnknownRecord): UnknownRecord {
  return { description: 'ok', content: { [mediaType]: object } };
}

function mediaType(
  field: string,
  type: string,
  with_: UnknownRecord,
  without: UnknownRecord,
  expects: Expectation,
  openapi = '3.1.0',
): StructureCase {
  return pair(
    `media-type.${field}`,
    (given) => respondingWith(contentOf(type, given), openapi),
    with_,
    without,
    expects,
  );
}

const FORM = {
  type: 'object',
  properties: { part: STRING },
  additionalProperties: false,
};
const AS_KESTREL = { contentType: 'text/kestrel' };

const MEDIA_TYPES: readonly StructureCase[] = [
  pair(
    'content[a media type]',
    respondingWith,
    contentOf('text/kestrel', { schema: STRING }),
    contentOf('text/plain', { schema: STRING }),
    value('text/kestrel'),
  ),
  mediaType('schema', JSON_TYPE, { schema: KESTREL_ONLY }, { schema: STRING }, value('kestrel')),
  pair(
    'media-type.encoding',
    sending,
    { content: { 'multipart/form-data': { schema: FORM, encoding: { part: AS_KESTREL } } } },
    { content: { 'multipart/form-data': { schema: FORM } } },
    value('text/kestrel'),
  ),
  mediaType(
    'description',
    JSON_TYPE,
    { schema: STRING, description: 'kestrel' },
    { schema: STRING },
    value('kestrel'),
    '3.2.0',
  ),
  mediaType(
    'itemSchema',
    'application/jsonl',
    { itemSchema: KESTREL_ONLY },
    { itemSchema: STRING },
    value('kestrel'),
    '3.2.0',
  ),
  mediaType(
    'itemEncoding',
    'multipart/mixed',
    { schema: STRINGS, itemEncoding: AS_KESTREL },
    { schema: STRINGS },
    value('text/kestrel'),
    '3.2.0',
  ),
  mediaType(
    'prefixEncoding',
    'multipart/mixed',
    { schema: STRINGS, prefixEncoding: [AS_KESTREL] },
    { schema: STRINGS },
    value('text/kestrel'),
    '3.2.0',
  ),
];

const KEYS_OF_A_RESPONSE = ['default', '404', '4XX'];

/**
 * One response under one key of `responses`, beside a `200`: the key is held, and the
 * definitions differ from those for the same response under each other kind of key.
 */
function responseKey(rowId: string, key: string): StructureCase {
  const under = (given: string): UnknownRecord =>
    documentOf({ '/things': { get: { responses: { ...OK, [given]: { description: 'none' } } } } });
  return {
    rowId,
    document: under(key),
    control: documentOf({ '/things': { get: PLAIN } }),
    expects: value(key),
    apartFrom: KEYS_OF_A_RESPONSE.filter((other) => other !== key).map(under),
  };
}

function response(
  field: string,
  with_: UnknownRecord,
  without: UnknownRecord,
  expects: Expectation,
  openapi = '3.1.0',
): StructureCase {
  return pair(
    `response.${field}`,
    (given) => respondingWith({ description: 'ok', ...given }, openapi),
    with_,
    without,
    expects,
  );
}

/** A case about one header of a `200` response. */
function header(
  field: string,
  with_: UnknownRecord,
  without: UnknownRecord,
  expects: Expectation,
  openapi = '3.1.0',
): StructureCase {
  return pair(
    `header.${field}`,
    (given) => respondingWith({ description: 'ok', headers: { 'X-Thing': given } }, openapi),
    with_,
    without,
    expects,
  );
}

const PLAIN_HEADER = { schema: STRING };
const MANY_HEADER = { schema: STRINGS };

const RESPONSES_AND_HEADERS: readonly StructureCase[] = [
  responseKey('responses.default', 'default'),
  responseKey('responses[an exact status code]', '404'),
  responseKey('responses[a status range]', '4XX'),

  response('description', { description: 'kestrel' }, {}, value('kestrel')),
  response('content', JSON_BODY, {}, value(JSON_TYPE)),
  response('headers', { headers: { 'X-Kestrel': PLAIN_HEADER } }, {}, value('X-Kestrel')),
  response('summary', { summary: 'kestrel' }, {}, value('kestrel'), '3.2.0'),

  header('schema', { schema: KESTREL_ONLY }, PLAIN_HEADER, value('kestrel')),
  // The same schema, carried under a media type and carried directly.
  header(
    'content',
    { content: { [JSON_TYPE]: { schema: KESTREL_OBJECT } } },
    { schema: KESTREL_OBJECT },
    value(JSON_TYPE),
  ),
  header(
    'description',
    { ...PLAIN_HEADER, description: 'kestrel' },
    PLAIN_HEADER,
    value('kestrel'),
  ),
  header('deprecated', { ...PLAIN_HEADER, deprecated: true }, PLAIN_HEADER, DIFFERENCE),
  header(
    'required',
    { ...PLAIN_HEADER, required: true },
    { ...PLAIN_HEADER, required: false },
    DIFFERENCE,
  ),
  header(
    'explode',
    { ...MANY_HEADER, explode: true },
    { ...MANY_HEADER, explode: false },
    DIFFERENCE,
  ),
  header(
    'allowReserved',
    { ...PLAIN_HEADER, allowReserved: true },
    PLAIN_HEADER,
    DIFFERENCE,
    '3.2.0',
  ),
];

interface Form {
  /** The media type of the body. */
  readonly type: string;
  /** The schema of the body's one property, `part`. */
  readonly part: UnknownRecord;
  readonly openapi: string;
}

/** `post /things` sending a form whose one part has the encoding given, or none. */
function formWith(form: Form, encoding: UnknownRecord | undefined): UnknownRecord {
  const schema = {
    type: 'object',
    properties: { part: form.part },
    additionalProperties: false,
  };
  const media = encoding === undefined ? {} : { encoding: { part: encoding } };
  return sending({ content: { [form.type]: { schema, ...media } } }, form.openapi);
}

const MULTIPART: Form = { type: 'multipart/form-data', part: STRINGS, openapi: '3.1.0' };
const URL_ENCODED: Form = {
  type: 'application/x-www-form-urlencoded',
  part: STRINGS,
  openapi: '3.1.0',
};

function encoding(
  field: string,
  with_: UnknownRecord,
  without: UnknownRecord,
  expects: Expectation,
  form: Form = MULTIPART,
): StructureCase {
  return pair(`encoding.${field}`, (given) => formWith(form, given), with_, without, expects);
}

/** A style with `explode` stated, so that no document leans on a default. */
function styled(name: string, explode: boolean): UnknownRecord {
  return { style: name, explode };
}

const STYLES_OF_AN_ARRAY = ['form', 'spaceDelimited', 'pipeDelimited'];

/**
 * A style of an encoding for an array: its name is held, and it is told from each other
 * style an array may have.
 */
function arrayStyle(name: string): StructureCase {
  return {
    rowId: `encoding.style=${name}`,
    document: formWith(URL_ENCODED, styled(name, false)),
    control: formWith(URL_ENCODED, undefined),
    expects: value(name),
    apartFrom: STYLES_OF_AN_ARRAY.filter((other) => other !== name).map((other) =>
      formWith(URL_ENCODED, styled(other, false)),
    ),
  };
}

const AN_OBJECT = { type: 'object', properties: { inner: STRING }, additionalProperties: false };
const URL_ENCODED_OBJECT: Form = { ...URL_ENCODED, part: AN_OBJECT };

/** A part that is itself a form, so that an encoding nested in its encoding has a property to name. */
const NESTED_FORM: Form = { type: 'multipart/form-data', part: AN_OBJECT, openapi: '3.2.0' };
const AS_FORM = { contentType: 'multipart/form-data' };

/**
 * A part that is an array of arrays. An encoding is applied to each item of an array
 * property, so each item must itself be an array for an item or prefix encoding nested in
 * it to have items to apply to.
 */
const NESTED_ITEMS: Form = {
  type: 'multipart/form-data',
  part: { type: 'array', items: STRINGS },
  openapi: '3.2.0',
};
const AS_MIXED = { contentType: 'multipart/mixed' };

const ENCODINGS: readonly StructureCase[] = [
  encoding('contentType', AS_KESTREL, { contentType: 'text/plain' }, value('text/kestrel')),
  encoding('headers', { headers: { 'X-Kestrel': PLAIN_HEADER } }, {}, value('X-Kestrel')),
  ...STYLES_OF_AN_ARRAY.map(arrayStyle),
  // `deepObject` is defined for an object and with `explode: true`, which only `form`
  // shares with it.
  {
    rowId: 'encoding.style=deepObject',
    document: formWith(URL_ENCODED_OBJECT, styled('deepObject', true)),
    control: formWith(URL_ENCODED_OBJECT, undefined),
    expects: value('deepObject'),
    apartFrom: [formWith(URL_ENCODED_OBJECT, styled('form', true))],
  },
  encoding('explode', styled('form', false), styled('form', true), DIFFERENCE, URL_ENCODED),
  encoding('allowReserved', { allowReserved: true }, {}, DIFFERENCE, URL_ENCODED),
  encoding(
    'encoding',
    { ...AS_FORM, encoding: { inner: AS_KESTREL } },
    AS_FORM,
    value('text/kestrel'),
    NESTED_FORM,
  ),
  encoding(
    'itemEncoding',
    { ...AS_MIXED, itemEncoding: AS_KESTREL },
    AS_MIXED,
    value('text/kestrel'),
    NESTED_ITEMS,
  ),
  encoding(
    'prefixEncoding',
    { ...AS_MIXED, prefixEncoding: [AS_KESTREL] },
    AS_MIXED,
    value('text/kestrel'),
    NESTED_ITEMS,
  ),
];

const REF = (kind: string, name = 'Kestrel'): UnknownRecord => ({
  $ref: `#/components/${kind}/${name}`,
});

/**
 * A named component, used by reference, against the same thing written in place: the
 * name is what only the component states.
 */
function named(
  rowId: string,
  kind: string,
  thing: UnknownRecord,
  usedIn: (use: UnknownRecord) => UnknownRecord,
  name = 'Kestrel',
  openapi = '3.1.0',
): StructureCase {
  return {
    rowId,
    document: {
      ...documentOf(usedIn(REF(kind, name)), { components: { [kind]: { [name]: thing } } }),
      openapi,
    },
    control: { ...documentOf(usedIn(thing)), openapi },
    expects: value(name),
  };
}

const getting = (operation: UnknownRecord): UnknownRecord => ({
  '/things': { get: { ...PLAIN, ...operation } },
});
const asParameter = (use: UnknownRecord): UnknownRecord => getting({ parameters: [use] });
const asResponse = (use: UnknownRecord): UnknownRecord => getting({ responses: { '200': use } });
const CALLBACK = { '{$request.body#/url}': { post: PLAIN } };
const JSON_RESPONSE = { description: 'ok', ...JSON_BODY };

/**
 * A reference with and without a field beside `$ref`. The field has an effect only where
 * the thing referred to has that field itself: a parameter has a `description`, and a
 * response has a `summary` from OpenAPI 3.2.
 */
function beside(
  field: string,
  kind: string,
  thing: UnknownRecord,
  usedIn: (use: UnknownRecord) => UnknownRecord,
  openapi: string,
): StructureCase {
  const using = (use: UnknownRecord): UnknownRecord => ({
    ...documentOf(usedIn(use), { components: { [kind]: { Kestrel: thing } } }),
    openapi,
  });
  return {
    rowId: `reference.${field}`,
    document: using({ ...REF(kind), [field]: 'osprey' }),
    control: using(REF(kind)),
    expects: value('osprey'),
  };
}

/** The same named response in both documents: referred to in one, written in place in the other. */
function referredTo(): StructureCase {
  const using = (use: UnknownRecord): UnknownRecord =>
    documentOf(asResponse(use), { components: { responses: { Kestrel: JSON_RESPONSE } } });
  return {
    rowId: 'reference.$ref',
    document: using(REF('responses')),
    control: using(JSON_RESPONSE),
    expects: DIFFERENCE,
  };
}

const COMPONENTS_AND_REFERENCES: readonly StructureCase[] = [
  named('components.parameters', 'parameters', IN_QUERY, asParameter),
  named('components.responses', 'responses', JSON_RESPONSE, asResponse),
  named('components.requestBodies', 'requestBodies', JSON_BODY, (use) => ({
    '/things': { post: { ...PLAIN, requestBody: use } },
  })),
  named('components.headers', 'headers', PLAIN_HEADER, (use) =>
    asResponse({ description: 'ok', headers: { 'X-Thing': use } }),
  ),
  named('components.pathItems', 'pathItems', { get: PLAIN }, (use) => ({ '/things': use })),
  named('components.callbacks', 'callbacks', CALLBACK, (use) =>
    getting({ callbacks: { onThing: use } }),
  ),
  named(
    'components.mediaTypes',
    'mediaTypes',
    { schema: KESTREL_OBJECT },
    (use) => asResponse({ description: 'ok', content: { [JSON_TYPE]: use } }),
    'Kestrel',
    '3.2.0',
  ),
  // A name using every kind of character the grammar of a component name allows.
  named('components[a component name]', 'parameters', IN_QUERY, asParameter, 'Kestrel.v1-a_b'),
  // The component is declared in both documents, so only the reference differs.
  referredTo(),
  beside('summary', 'responses', JSON_RESPONSE, asResponse, '3.2.0'),
  beside('description', 'parameters', IN_QUERY, asParameter, '3.1.0'),

  {
    rowId: 'openapi.paths',
    document: documentOf({ '/kestrels': { get: PLAIN } }),
    control: documentOf(getting({})),
    expects: value('/kestrels'),
  },
  {
    rowId: 'openapi.webhooks',
    document: documentOf(getting({}), { webhooks: { kestrel: { post: PLAIN } } }),
    control: documentOf(getting({})),
    expects: value('kestrel'),
  },
  // The components of a document, shown by one of them being used: a named schema.
  {
    rowId: 'openapi.components',
    document: documentOf(
      asResponse({ description: 'ok', content: { [JSON_TYPE]: { schema: REF('schemas') } } }),
      {
        components: { schemas: { Kestrel: KESTREL_OBJECT } },
      },
    ),
    control: documentOf(
      asResponse({ description: 'ok', content: { [JSON_TYPE]: { schema: KESTREL_OBJECT } } }),
    ),
    expects: value('Kestrel'),
  },
  {
    rowId: 'openapi.$self',
    document: {
      ...documentOf(getting({})),
      openapi: '3.2.0',
      $self: 'https://kestrel.example/api',
    },
    control: { ...documentOf(getting({})), openapi: '3.2.0' },
    expects: value('https://kestrel.example/api'),
  },
  {
    rowId: 'callbacks[a callback expression]',
    document: documentOf(
      getting({ callbacks: { onThing: { '{$request.body#/kestrel}': { post: PLAIN } } } }),
    ),
    control: documentOf(getting({ callbacks: { onThing: CALLBACK } })),
    expects: value('{$request.body#/kestrel}'),
  },
];

/**
 * One case for each row of a document outside a schema that the endpoint definitions
 * are proposed to carry as structure. The families not yet here have no cell.
 */
export const STRUCTURE_CASES: readonly StructureCase[] = [
  ...PATHS_AND_OPERATIONS,
  ...PARAMETERS,
  ...REQUEST_BODIES,
  ...MEDIA_TYPES,
  ...RESPONSES_AND_HEADERS,
  ...ENCODINGS,
  ...COMPONENTS_AND_REFERENCES,
];

/**
 * Rows no pair of documents can isolate, each with the reason. Their cell is not judged.
 */
export const ROWS_NO_CASE_ISOLATES: ReadonlyMap<string, string> = new Map([
  [
    'parameter.in=path',
    'a parameter in the path cannot move while its template stays, so no valid document differs only in the location',
  ],
  [
    'header.style=simple',
    'simple is the only style a header has, so stating it says nothing its absence does not',
  ],
]);
