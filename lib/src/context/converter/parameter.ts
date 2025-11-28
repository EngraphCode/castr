import type { ParameterObject, ReferenceObject } from 'openapi3-ts/oas31';
import type { IRParameter } from '../ir-schema.js';
import { convertSchema } from './schema.js';

export function convertParameter(param: IRParameter): ParameterObject | ReferenceObject {
  const p: ParameterObject = {
    name: param.name,
    in: param.in,
    required: param.required,
    schema: convertSchema(param.schema),
    ...(param.description ? { description: param.description } : {}),

    ...(param.deprecated ? { deprecated: param.deprecated } : {}),
  };

  if (param.style) {
    p.style = param.style;
  }
  if (param.explode !== undefined) {
    p.explode = param.explode;
  }
  if (param.allowReserved !== undefined) {
    p.allowReserved = param.allowReserved;
  }
  if (param.example !== undefined) {
    p.example = param.example;
  }
  if (param.examples) {
    p.examples = param.examples;
  }

  return p;
}
