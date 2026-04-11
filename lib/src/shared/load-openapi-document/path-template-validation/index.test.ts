import { describe, expect, it } from 'vitest';

import { validateTopLevelPathTemplates } from './index.js';

describe('validateTopLevelPathTemplates', () => {
  it('accepts valid hyphenated and dotted path templates', () => {
    const document = {
      paths: {
        '/devices/{device-id}/tokens/{token.id}': {
          get: { responses: { '200': { description: 'OK' } } },
        },
        'x-malformed-{}': true,
      },
      webhooks: {
        '/ignored/{}/webhook': {
          post: { responses: { '200': { description: 'OK' } } },
        },
      },
    };

    expect(validateTopLevelPathTemplates(document)).toEqual([]);
  });

  it('ignores specification extensions under paths', () => {
    expect(
      validateTopLevelPathTemplates({
        paths: {
          'x-empty-{}': {
            note: 'This is a specification extension, not a path key',
          },
          '/devices/{device-id}': {
            get: { responses: { '200': { description: 'OK' } } },
          },
        },
      }),
    ).toEqual([]);
  });

  it('rejects missing closing braces', () => {
    expect(
      validateTopLevelPathTemplates({
        paths: {
          '/devices/{device-id/tokens': {
            get: { responses: { '200': { description: 'OK' } } },
          },
        },
      }),
    ).toEqual([
      {
        message: 'Malformed path template: missing closing "}" for a template expression',
        path: '/paths/~1devices~1{device-id~1tokens',
      },
    ]);
  });

  it('rejects stray closing braces', () => {
    expect(
      validateTopLevelPathTemplates({
        paths: {
          '/devices/device-id}/tokens': {
            get: { responses: { '200': { description: 'OK' } } },
          },
        },
      }),
    ).toEqual([
      {
        message: 'Malformed path template: unexpected "}" outside a template expression',
        path: '/paths/~1devices~1device-id}~1tokens',
      },
    ]);
  });

  it('rejects empty template expressions', () => {
    expect(
      validateTopLevelPathTemplates({
        paths: {
          '/devices/{}/tokens': {
            get: { responses: { '200': { description: 'OK' } } },
          },
        },
      }),
    ).toEqual([
      {
        message: 'Malformed path template: empty template expressions like "{}" are not allowed',
        path: '/paths/~1devices~1{}~1tokens',
      },
    ]);
  });

  it('rejects nested opening braces inside template expressions', () => {
    expect(
      validateTopLevelPathTemplates({
        paths: {
          '/devices/{{device-id}}/tokens': {
            get: { responses: { '200': { description: 'OK' } } },
          },
        },
      }),
    ).toEqual([
      {
        message: 'Malformed path template: nested "{" is not allowed inside a template expression',
        path: '/paths/~1devices~1{{device-id}}~1tokens',
      },
    ]);
  });
});
