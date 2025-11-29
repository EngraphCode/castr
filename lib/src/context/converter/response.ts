import type {
  ResponseObject,
  ReferenceObject,
  ResponsesObject,
  HeaderObject,
} from 'openapi3-ts/oas31';
import type { IRResponse } from '../ir-schema.js';
import { convertContent } from './content.js';
import { convertSchema } from './schema.js';

export function convertResponses(responses: IRResponse[]): ResponsesObject {
  const result: ResponsesObject = {};
  for (const resp of responses) {
    result[resp.statusCode] = convertResponse(resp);
  }
  return result;
}

export function convertResponse(resp: IRResponse): ResponseObject | ReferenceObject {
  const responseObj: ResponseObject = {
    description: resp.description || '',
  };

  if (resp.content) {
    responseObj.content = convertContent(resp.content);
  }

  if (resp.headers) {
    responseObj.headers = Object.entries(resp.headers).reduce<
      Record<string, HeaderObject | ReferenceObject>
    >((acc, [key, value]) => {
      acc[key] = { schema: convertSchema(value) };
      return acc;
    }, {});
  }

  return responseObj;
}
