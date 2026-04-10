import type { OpenAPIV3_2 } from '@scalar/openapi-types';
import { describe, expect, it } from 'vitest';
import type {
  ComponentsObject,
  ParameterObject,
  ParameterLocation,
  PathItemObject,
} from './openapi-types.js';

type Assert<T extends true> = T;
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;
type Includes<TUnion, TValue> = Extract<TUnion, TValue> extends never ? false : true;

type ScalarStillExposesParameterContent = Assert<HasKey<OpenAPIV3_2.ParameterObject, 'content'>>;
type LocalStillExposesParameterContent = Assert<HasKey<ParameterObject, 'content'>>;
type ScalarStillExposesMediaTypes = Assert<HasKey<OpenAPIV3_2.ComponentsObject, 'mediaTypes'>>;
type LocalStillExposesMediaTypes = Assert<HasKey<ComponentsObject, 'mediaTypes'>>;
type ScalarStillIncludesQueryStringLocation = Assert<
  Includes<OpenAPIV3_2.ParameterLocation, 'querystring'>
>;
type LocalStillIncludesQueryStringLocation = Assert<Includes<ParameterLocation, 'querystring'>>;
type ScalarStillExposesPathItemRef = Assert<HasKey<OpenAPIV3_2.PathItemObject, '$ref'>>;
type LocalStillExposesPathItemRef = Assert<HasKey<PathItemObject, '$ref'>>;

const driftAssertions: [
  ScalarStillExposesParameterContent,
  LocalStillExposesParameterContent,
  ScalarStillExposesMediaTypes,
  LocalStillExposesMediaTypes,
  ScalarStillIncludesQueryStringLocation,
  LocalStillIncludesQueryStringLocation,
  ScalarStillExposesPathItemRef,
  LocalStillExposesPathItemRef,
] = [true, true, true, true, true, true, true, true];

describe('openapi-types drift harness', () => {
  it('compiles the critical Scalar compatibility assertions', () => {
    expect(driftAssertions).toBeDefined();
    expect(true).toBe(true);
  });
});
