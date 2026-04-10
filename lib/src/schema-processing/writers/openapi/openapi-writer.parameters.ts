import type { ParameterObject } from '../../../shared/openapi-types.js';
import type { CastrParameter } from '../../ir/index.js';
import { writeMediaTypeEntries } from './openapi-writer.media-types.js';
import { writeOpenApiSchema } from './schema/openapi-writer.schema.js';

function assignOptionalParameterFields(
  result: ParameterObject,
  parameter: CastrParameter,
): ParameterObject {
  if (parameter.description !== undefined) {
    result.description = parameter.description;
  }
  if (parameter.deprecated !== undefined) {
    result.deprecated = parameter.deprecated;
  }
  if (parameter.example !== undefined) {
    result.example = parameter.example;
  }
  if (parameter.examples !== undefined) {
    result.examples = parameter.examples;
  }
  if (parameter.style !== undefined) {
    result.style = parameter.style;
  }
  if (parameter.explode !== undefined) {
    result.explode = parameter.explode;
  }
  if (parameter.allowReserved !== undefined) {
    result.allowReserved = parameter.allowReserved;
  }

  return result;
}

export function writeParameterObject(parameter: CastrParameter): ParameterObject {
  const result: ParameterObject = {
    name: parameter.name,
    in: parameter.in,
    required: parameter.required,
  };

  if (parameter.content !== undefined) {
    result.content = writeMediaTypeEntries(parameter.content);
  } else {
    result.schema = writeOpenApiSchema(parameter.schema);
  }

  return assignOptionalParameterFields(result, parameter);
}
