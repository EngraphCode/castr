import type { HeaderObject, ReferenceObject } from '../../../../../shared/openapi-types.js';
import { isReferenceObject } from '../../../../../validation/type-guards.js';
import type { IRResponseHeader } from '../../../../ir/index.js';
import { buildCastrSchema } from '../../builder.core.js';
import type { IRBuildContext } from '../../builder.types.js';
import {
  assertNoCircularComponentRef,
  parseComponentNameForType,
} from '../../components/builder.component-ref-resolution.js';
import {
  buildIRMediaTypeEntries,
  deriveSchemaFromMediaTypeEntries,
} from '../builder.media-types.js';

const OPENAPI_COMPONENT_TYPE_HEADERS = 'headers';

export function buildResponseHeaders(
  headers: Record<string, HeaderObject | ReferenceObject>,
  context: IRBuildContext,
): Record<string, IRResponseHeader> {
  const result: Record<string, IRResponseHeader> = {};

  for (const [headerName, headerObj] of Object.entries(headers)) {
    const irHeader = buildResponseHeader(headerName, headerObj, context);
    if (irHeader) {
      result[headerName] = irHeader;
    }
  }

  return result;
}

function buildResponseHeader(
  headerName: string,
  headerObj: HeaderObject | ReferenceObject,
  context: IRBuildContext,
): IRResponseHeader | undefined {
  if (isReferenceObject(headerObj)) {
    return buildResponseHeader(headerName, resolveHeader(headerObj, headerName, context), context);
  }

  const headerContext: IRBuildContext = {
    ...context,
    path: [...context.path, 'headers', headerName],
  };
  const schema = buildHeaderSchema(headerName, headerObj, headerContext);
  if (!schema) {
    return undefined;
  }

  const irHeader: IRResponseHeader = {
    schema,
  };

  addResponseHeaderContent(irHeader, headerObj, headerContext);
  applyResponseHeaderFields(irHeader, headerObj);

  return irHeader;
}

function addResponseHeaderContent(
  irHeader: IRResponseHeader,
  headerObj: HeaderObject,
  headerContext: IRBuildContext,
): void {
  const content = buildIRMediaTypeEntries(headerObj.content, headerContext, [
    ...headerContext.path,
    'content',
  ]);
  if (Object.keys(content).length > 0) {
    irHeader.content = content;
  }
}

function applyResponseHeaderFields(irHeader: IRResponseHeader, headerObj: HeaderObject): void {
  if (headerObj.description !== undefined) {
    irHeader.description = headerObj.description;
  }
  if (headerObj.required !== undefined) {
    irHeader.required = headerObj.required;
  }
  if (headerObj.deprecated !== undefined) {
    irHeader.deprecated = headerObj.deprecated;
  }
  if (headerObj.example !== undefined) {
    irHeader.example = headerObj.example;
  }
  if (headerObj.examples !== undefined) {
    irHeader.examples = headerObj.examples;
  }
}

function resolveHeader(
  ref: ReferenceObject,
  headerName: string,
  context: IRBuildContext,
  seenRefs = new Set<string>(),
): HeaderObject {
  const location = [...context.path, 'headers', headerName].join('/');
  assertNoCircularComponentRef(ref.$ref, location, seenRefs, 'header');

  const componentName = parseComponentNameForType(
    ref.$ref,
    OPENAPI_COMPONENT_TYPE_HEADERS,
    location,
    'header',
    '#/components/headers/{name}',
  );
  const headers = context.doc.components?.headers;
  if (!headers) {
    throw new Error(
      `Unresolvable header reference "${ref.$ref}" at ${location}. ` +
        'The referenced header does not exist in components.headers.',
    );
  }

  const resolved = headers[componentName];
  if (!resolved) {
    throw new Error(
      `Unresolvable header reference "${ref.$ref}" at ${location}. ` +
        'The referenced header does not exist in components.headers.',
    );
  }

  if (isReferenceObject(resolved)) {
    return resolveHeader(resolved, headerName, context, seenRefs);
  }

  return resolved;
}

function buildHeaderSchema(
  headerName: string,
  header: HeaderObject,
  context: IRBuildContext,
): ReturnType<typeof buildCastrSchema> | undefined {
  if (header.schema) {
    return buildCastrSchema(header.schema, context);
  }

  if (header.content) {
    const schema = deriveSchemaFromMediaTypeEntries(header.content, context, [
      ...context.path,
      'content',
    ]);
    if (schema) {
      return schema;
    }
  }

  const location = context.path.join('/');
  throw new Error(
    `Header "${headerName}" at ${location} has neither 'schema' nor schema-bearing 'content'. ` +
      'OpenAPI headers must define a schema directly or via content.',
  );
}
