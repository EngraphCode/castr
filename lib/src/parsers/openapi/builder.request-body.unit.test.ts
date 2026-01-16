/**
 * Unit tests for request body builder - encoding extraction
 *
 * TDD tests for 2.6.2 Parser Completion: encoding field in IRMediaType
 */

import { describe, test, expect } from 'vitest';
import type { RequestBodyObject } from 'openapi3-ts/oas31';
import { buildIRRequestBody } from './builder.request-body.js';
import type { IRBuildContext } from './builder.types.js';

describe('buildIRRequestBody - encoding extraction', () => {
  const createContext = (): IRBuildContext => ({
    doc: {
      openapi: '3.1.0',
      info: { title: 'Test', version: '1.0.0' },
      paths: {},
    },
    path: [],
    required: true,
  });

  test('extracts encoding from multipart/form-data request body', () => {
    const requestBody: RequestBodyObject = {
      required: true,
      content: {
        'multipart/form-data': {
          schema: {
            type: 'object',
            properties: {
              profileImage: { type: 'string', format: 'binary' },
              userId: { type: 'string' },
            },
          },
          encoding: {
            profileImage: {
              contentType: 'image/png, image/jpeg',
              headers: {
                'X-Custom-Header': {
                  description: 'Custom header for file upload',
                  schema: { type: 'string' },
                },
              },
            },
          },
        },
      },
    };

    const result = buildIRRequestBody(requestBody, createContext());

    expect(result.content['multipart/form-data']).toBeDefined();
    expect(result.content['multipart/form-data']?.encoding).toBeDefined();
    expect(result.content['multipart/form-data']?.encoding?.['profileImage']).toBeDefined();
    expect(result.content['multipart/form-data']?.encoding?.['profileImage']?.['contentType']).toBe(
      'image/png, image/jpeg',
    );
  });

  test('handles request body without encoding', () => {
    const requestBody: RequestBodyObject = {
      required: true,
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
            },
          },
        },
      },
    };

    const result = buildIRRequestBody(requestBody, createContext());

    expect(result.content['application/json']).toBeDefined();
    expect(result.content['application/json']?.encoding).toBeUndefined();
  });
});
