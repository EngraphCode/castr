import { describe, expect, it } from 'vitest';
import { getZodClientTemplateContext } from '../../context/index.js';
import { writeTypeScript } from './index.js';

describe('writers/typescript custom method inline schemas', () => {
  it('keeps fallback inline request body names distinct for punctuation- and case-distinct custom methods', () => {
    const context = getZodClientTemplateContext({
      openapi: '3.2.0',
      info: { title: 'Custom Method API', version: '1.0.0' },
      paths: {
        '/users': {
          additionalOperations: {
            'M-SEARCH': {
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        q: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'ok',
                  content: {
                    'application/json': {
                      schema: { type: 'string' },
                    },
                  },
                },
              },
            },
            M_SEARCH: {
              requestBody: {
                required: true,
                content: {
                  'application/json': {
                    schema: {
                      type: 'object',
                      properties: {
                        query: { type: 'string' },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': {
                  description: 'ok',
                  content: {
                    'application/json': {
                      schema: { type: 'string' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        schemas: {},
      },
    });

    const output = writeTypeScript(context);

    expect(output).toContain('export type method_m_search__4d2d534541524348_users_Body =');
    expect(output).toContain('export type method_m_search__4d5f534541524348_users_Body =');
    expect(output.match(/export type .*_users_Body =/g)).toHaveLength(2);
  });
});
