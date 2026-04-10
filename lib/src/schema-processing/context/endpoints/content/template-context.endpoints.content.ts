import type { EndpointParameter, RequestFormat } from '../../../../endpoints/definition.types.js';
import {
  getSchemaFromIRMediaTypeEntry,
  type CastrDocument,
  type CastrOperation,
  type CastrSchema,
  type IRMediaTypeEntry,
} from '../../../ir/index.js';

const REQUEST_MEDIA_TYPE_MULTIPART = 'multipart/form-data';
const REQUEST_MEDIA_TYPE_FORM = 'application/x-www-form-urlencoded';
const REQUEST_MEDIA_TYPE_BINARY = 'application/octet-stream';
const REQUEST_MEDIA_TYPE_TEXT = 'text/plain';
const REQUEST_MEDIA_TYPE_JSON = 'application/json';

export function createEmptySchema(): CastrSchema {
  return {
    type: 'object',
    metadata: {
      required: false,
      nullable: false,
      zodChain: { presence: '', validations: [], defaults: [] },
      dependencyGraph: { references: [], referencedBy: [], depth: 0 },
      circularReferences: [],
    },
  };
}

export function determineRequestFormat(requestBody?: CastrOperation['requestBody']): RequestFormat {
  if (!requestBody) {
    return 'json';
  }

  if (requestBody.content[REQUEST_MEDIA_TYPE_MULTIPART]) {
    return 'form-data';
  }
  if (requestBody.content[REQUEST_MEDIA_TYPE_FORM]) {
    return 'form-url';
  }
  if (requestBody.content[REQUEST_MEDIA_TYPE_BINARY]) {
    return 'binary';
  }
  if (requestBody.content[REQUEST_MEDIA_TYPE_TEXT]) {
    return 'text';
  }

  return 'json';
}

function getSortedMediaTypeKeys(content: Record<string, IRMediaTypeEntry>): string[] {
  return Object.keys(content).sort((left, right) => left.localeCompare(right));
}

export function getSchemaFromContent(
  ir: Pick<CastrDocument, 'components'>,
  content: Record<string, IRMediaTypeEntry> | undefined,
  location: string,
): CastrSchema | undefined {
  if (!content) {
    return undefined;
  }

  const preferredJsonSchema = content[REQUEST_MEDIA_TYPE_JSON]
    ? getSchemaFromIRMediaTypeEntry(
        ir,
        content[REQUEST_MEDIA_TYPE_JSON],
        `${location}/${REQUEST_MEDIA_TYPE_JSON}`,
      )
    : undefined;
  if (preferredJsonSchema) {
    return preferredJsonSchema;
  }

  for (const mediaTypeKey of getSortedMediaTypeKeys(content)) {
    const mediaType = content[mediaTypeKey];
    if (!mediaType) {
      continue;
    }
    const schema = getSchemaFromIRMediaTypeEntry(ir, mediaType, `${location}/${mediaTypeKey}`);
    if (schema) {
      return schema;
    }
  }

  return undefined;
}

function selectPreferredContentSchema(
  ir: Pick<CastrDocument, 'components'>,
  content: Record<string, IRMediaTypeEntry>,
  location: string,
): { schema: CastrSchema } | undefined {
  for (const mediaType of getSortedMediaTypeKeys(content)) {
    const entry = content[mediaType];
    if (!entry) {
      continue;
    }
    const schema = getSchemaFromIRMediaTypeEntry(ir, entry, `${location}/${mediaType}`);
    if (schema) {
      return { schema };
    }
  }

  return undefined;
}

export function createBodyParameter(
  ir: Pick<CastrDocument, 'components'>,
  requestBody?: CastrOperation['requestBody'],
): EndpointParameter | null {
  if (!requestBody) {
    return null;
  }

  const contentEntry = selectPreferredContentSchema(ir, requestBody.content, 'requestBody');
  if (!contentEntry) {
    return null;
  }

  const bodyParam: EndpointParameter = {
    name: 'body',
    type: 'Body',
    schema: contentEntry.schema,
  };

  if (requestBody.description) {
    bodyParam.description = requestBody.description;
  }
  if (contentEntry.schema.examples !== undefined) {
    bodyParam.schemaExamples = contentEntry.schema.examples;
  }

  return bodyParam;
}
