import { describe, expect, it } from 'vitest';
import { loadOpenApiDocument } from '../../src/shared/load-openapi-document/index.js';

describe('Additional operations validation', () => {
  it('REJECTS invalid additionalOperations methods under webhooks', async () => {
    await expect(
      loadOpenApiDocument({
        openapi: '3.2.0',
        info: { title: 'Invalid webhook additionalOperations method', version: '1.0.0' },
        paths: {},
        webhooks: {
          PhaseEWebhook: {
            additionalOperations: {
              POST: {
                responses: {
                  '202': { description: 'Accepted' },
                },
              },
            },
          },
        },
      }),
    ).rejects.toThrow(/must not appear in additionalOperations/i);
  });

  it('REJECTS invalid additionalOperations methods under components.pathItems', async () => {
    await expect(
      loadOpenApiDocument({
        openapi: '3.2.0',
        info: {
          title: 'Invalid component path item additionalOperations method',
          version: '1.0.0',
        },
        paths: {},
        components: {
          pathItems: {
            PhaseEPathItem: {
              additionalOperations: {
                POST: {
                  responses: {
                    '202': { description: 'Accepted' },
                  },
                },
              },
            },
          },
        },
      }),
    ).rejects.toThrow(/must not appear in additionalOperations/i);
  });

  it('REJECTS invalid additionalOperations methods inside callbacks', async () => {
    await expect(
      loadOpenApiDocument({
        openapi: '3.2.0',
        info: { title: 'Invalid callback additionalOperations method', version: '1.0.0' },
        paths: {
          '/phase-e': {
            get: {
              callbacks: {
                phaseECallback: {
                  '{$request.body#/callbackUrl}': {
                    additionalOperations: {
                      POST: {
                        responses: {
                          '202': { description: 'Accepted' },
                        },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': { description: 'OK' },
              },
            },
          },
        },
      }),
    ).rejects.toThrow(/must not appear in additionalOperations/i);
  });

  it('REJECTS invalid additionalOperations methods under components.callbacks', async () => {
    await expect(
      loadOpenApiDocument({
        openapi: '3.2.0',
        info: { title: 'Invalid component callback additionalOperations method', version: '1.0.0' },
        paths: {
          '/phase-e': {
            get: {
              responses: {
                '200': { description: 'OK' },
              },
            },
          },
        },
        components: {
          callbacks: {
            PhaseECallback: {
              '{$request.body#/callbackUrl}': {
                additionalOperations: {
                  POST: {
                    responses: {
                      '202': { description: 'Accepted' },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ).rejects.toThrow(/components → callbacks → PhaseECallback/i);
  });

  it('ACCEPTS valid custom additionalOperations methods across expanded traversal branches', async () => {
    await expect(
      loadOpenApiDocument({
        openapi: '3.2.0',
        info: { title: 'Valid additionalOperations traversal coverage', version: '1.0.0' },
        paths: {
          '/phase-e': {
            get: {
              callbacks: {
                PhaseECallback: {
                  '{$request.body#/callbackUrl}': {
                    additionalOperations: {
                      PURGE: {
                        responses: {
                          '202': { description: 'Accepted' },
                        },
                      },
                    },
                  },
                },
              },
              responses: {
                '200': { description: 'OK' },
              },
            },
          },
        },
        webhooks: {
          PhaseEWebhook: {
            additionalOperations: {
              PURGE: {
                responses: {
                  '202': { description: 'Accepted' },
                },
              },
            },
          },
        },
        components: {
          pathItems: {
            PhaseEPathItem: {
              additionalOperations: {
                PURGE: {
                  responses: {
                    '202': { description: 'Accepted' },
                  },
                },
              },
            },
          },
          callbacks: {
            PhaseECallback: {
              '{$request.body#/callbackUrl}': {
                additionalOperations: {
                  PURGE: {
                    responses: {
                      '202': { description: 'Accepted' },
                    },
                  },
                },
              },
            },
          },
        },
        'x-ext': {
          abc123: {
            components: {
              pathItems: {
                PhaseEPathItem: {
                  additionalOperations: {
                    PURGE: {
                      responses: {
                        '202': { description: 'Accepted' },
                      },
                    },
                  },
                },
              },
              callbacks: {
                PhaseECallback: {
                  '{$request.body#/callbackUrl}': {
                    additionalOperations: {
                      PURGE: {
                        responses: {
                          '202': { description: 'Accepted' },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ).resolves.toBeDefined();
  });

  it('REJECTS invalid additionalOperations methods under x-ext pathItems', async () => {
    await expect(
      loadOpenApiDocument({
        openapi: '3.2.0',
        info: { title: 'Invalid x-ext path item additionalOperations method', version: '1.0.0' },
        paths: {
          '/phase-e': {
            $ref: '#/x-ext/abc123/components/pathItems/PhaseEPathItem',
          },
        },
        'x-ext': {
          abc123: {
            components: {
              pathItems: {
                PhaseEPathItem: {
                  additionalOperations: {
                    POST: {
                      responses: {
                        '202': { description: 'Accepted' },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      }),
    ).rejects.toThrow(/x-ext → abc123 → components → pathItems → PhaseEPathItem/i);
  });
});
