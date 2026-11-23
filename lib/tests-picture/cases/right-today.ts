/**
 * The rows on which Castr's Zod output decides every sample as the reference validator
 * does, today. The picture's test holds this list to exactly the rows that are right: a
 * row that stops being right fails it, and so does a row that becomes right and is not
 * added here. It records what is true; it does not accept the rows that are missing.
 */
export const RIGHT_TODAY: readonly string[] = [
  'type:string',
  'type:number',
  'type:boolean',
  'type:null',
  'type:array',
  'type:object',
  'keyword:type',
  'keyword:const',
  'keyword:enum',
  'keyword:multipleOf',
  'keyword:maximum',
  'keyword:exclusiveMaximum',
  'keyword:minimum',
  'keyword:exclusiveMinimum',
  'keyword:maxLength',
  'keyword:minLength',
  'keyword:maxItems',
  'keyword:minItems',
  'keyword:required',
  'keyword:dependentRequired',
  'keyword:properties',
  'keyword:items',
  'keyword:allOf',
  'keyword:anyOf',
  'keyword:oneOf',
  'keyword:$ref',
  'keyword:format',
  'text:format: date',
  'text:format: hostname',
  'text:format: ipv4',
  'text:format: ipv6',
  'text:format: int32',
  'text:format: float',
  'text:format: double',
  'text:`true` as a schema',
  'text:a list of types (`type: [..]`)',
  'text:`additionalProperties: false`',
  'text:a map: `additionalProperties` with a schema',
  'text:a map: a `propertyNames` that refuses no name',
];

/**
 * The rows on which the type Castr generates is right today, held as exactly as the list
 * above. For a row TypeScript is proposed to carry, right means the compiler decides
 * every sample against the type as the reference validator does. For a row proposed as
 * carried by companion it means less: the type admits every sample the reference accepts.
 */
export const RIGHT_TODAY_TYPESCRIPT: readonly string[] = [
  'type:string',
  'type:number',
  'type:integer',
  'type:boolean',
  'type:null',
  'type:array',
  'type:object',
  'keyword:type',
  'keyword:const',
  'keyword:enum',
  'keyword:multipleOf',
  'keyword:maximum',
  'keyword:exclusiveMaximum',
  'keyword:minimum',
  'keyword:exclusiveMinimum',
  'keyword:maxLength',
  'keyword:minLength',
  'keyword:pattern',
  'keyword:maxItems',
  'keyword:minItems',
  'keyword:uniqueItems',
  'keyword:required',
  'keyword:dependentRequired',
  'keyword:properties',
  'keyword:items',
  'keyword:dependentSchemas',
  'keyword:if',
  'keyword:then',
  'keyword:else',
  'keyword:anyOf',
  'keyword:oneOf',
  'keyword:not',
  'keyword:unevaluatedProperties',
  'keyword:$ref',
  'keyword:format',
  'text:format: date-time',
  'text:format: date',
  'text:format: time',
  'text:format: duration',
  'text:format: email',
  'text:format: hostname',
  'text:format: ipv4',
  'text:format: ipv6',
  'text:format: uri',
  'text:format: uuid',
  'text:format: int32',
  'text:format: float',
  'text:format: double',
  'text:`true` as a schema',
  'text:a list of types (`type: [..]`)',
  'text:`additionalProperties: false`',
  'text:a map: `additionalProperties` with a schema',
  'text:a map: a `propertyNames` that refuses no name',
];

/**
 * The rows of a document outside a schema for which the endpoint definitions hold what
 * the construct states, today, held as exactly as the lists above. Right says the value
 * is somewhere in the definitions; it does not say it is in the right place.
 */
export const RIGHT_TODAY_ENDPOINTS: readonly string[] = [
  'paths[a path template]',
  'path-item.get',
  'path-item.put',
  'path-item.post',
  'path-item.delete',
  'path-item.options',
  'path-item.head',
  'path-item.patch',
  'path-item.trace',
  'path-item.query',
  'path-item.additionalOperations',
  'path-item.parameters',
  'operation.operationId',
  'operation.description',
  'operation.parameters',
  'operation.requestBody',
  'operation.responses',
  'parameter.name',
  'parameter.in=query',
  'parameter.in=querystring',
  'parameter.required',
  'parameter.required=true',
  'parameter.schema',
  'parameter.description',
  'request-body.description',
  'media-type.schema',
  'response.description',
  'openapi.paths',
  'openapi.components',
];

/**
 * The rows of a schema that decide no value for which the Zod validators hold what the
 * construct states, today, held as exactly as the lists above. Right says the value is
 * somewhere in the validators; it does not say it is in the right place.
 */
export const RIGHT_TODAY_ZOD_STRUCTURE: readonly string[] = [
  'keyword:title',
  'keyword:description',
  'keyword:examples',
  'schema.example',
  'schema.externalDocs',
  'external-docs.url',
  'external-docs.description',
  'extensible[an `x-` extension]',
  'schema.xml',
  'xml.name',
  'xml.namespace',
  'xml.prefix',
  'xml.attribute',
  'xml.wrapped',
  'xml.nodeType=element',
  'xml.nodeType=attribute',
  'xml.nodeType=text',
  'xml.nodeType=cdata',
  'xml.nodeType=none',
];

/**
 * The rows the exported types hold what the construct states for, today, held as exactly
 * as the lists above. Right says the value is somewhere in the types, or that the types
 * differ; it does not say it is in the place the specification names.
 */
export const RIGHT_TODAY_TYPESCRIPT_STRUCTURE: readonly string[] = [
  'operation.requestBody',
  'openapi.components',
  'components.schemas',
];
