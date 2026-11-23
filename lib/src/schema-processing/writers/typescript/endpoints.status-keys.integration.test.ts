import { describe, expect, it } from 'vitest';

import { generateZodClientFromOpenAPI } from '../../../index.js';

async function endpointsFor(responses: Record<string, { description: string }>): Promise<string> {
  const result = await generateZodClientFromOpenAPI({
    openApiDoc: {
      openapi: '3.1.0',
      info: { title: 'status keys', version: '1' },
      paths: { '/things': { get: { operationId: 'getThings', responses } } },
    },
    disableWriteToFile: true,
    template: 'schemas-with-metadata',
  });
  if (result.type !== 'single') {
    throw new Error('expected one module');
  }
  return result.content;
}

describe("the keys of an endpoint definition's responses", () => {
  it('quotes a status range, which is no identifier and no number', async () => {
    const content = await endpointsFor({ '2XX': { description: 'ok' } });

    expect(content).toContain('"2XX": {');
    expect(content).not.toContain(' 2XX: {');
  });

  it('leaves an exact code and default as they were', async () => {
    const content = await endpointsFor({
      '200': { description: 'ok' },
      default: { description: 'other' },
    });

    expect(content).toContain(' 200: {');
    expect(content).toContain(' default: {');
  });
});
