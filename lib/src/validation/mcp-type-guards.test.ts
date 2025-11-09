import { describe, expect, it } from 'vitest';
import { ToolSchema } from '@modelcontextprotocol/sdk/types.js';

import { isMcpTool, isMcpToolInput, isMcpToolOutput } from './mcp-type-guards.js';

const createSampleTool = () =>
  ToolSchema.parse({
    name: 'find_pets',
    description: 'Find pets with optional filters',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'object',
          properties: {
            tag: { type: 'string' },
            limit: { type: 'integer' },
          },
          required: ['tag'],
        },
      },
      required: ['query'],
    },
    outputSchema: {
      type: 'object',
      properties: {
        value: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'integer' },
              name: { type: 'string' },
            },
            required: ['id', 'name'],
          },
        },
      },
      required: ['value'],
    },
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: false,
    },
  });

describe('mcp type guards', () => {
  describe('isMcpTool', () => {
    it('accepts a valid MCP tool object', () => {
      const tool = createSampleTool();
      expect(isMcpTool(tool)).toBe(true);
    });

    it('rejects an invalid MCP tool object', () => {
      const invalidTool = {
        name: 'missing_input_schema',
      };
      expect(isMcpTool(invalidTool)).toBe(false);
    });
  });

  describe('isMcpToolInput', () => {
    it('accepts valid input payloads', () => {
      const tool = createSampleTool();
      const payload = {
        query: {
          tag: 'cats',
        },
      };
      expect(isMcpToolInput(payload, tool)).toBe(true);
    });

    it('rejects invalid input payloads', () => {
      const tool = createSampleTool();
      const payload = {
        query: {
          limit: 10,
        },
      };
      expect(isMcpToolInput(payload, tool)).toBe(false);
    });
  });

  describe('isMcpToolOutput', () => {
    it('accepts valid output payloads', () => {
      const tool = createSampleTool();
      const payload = {
        value: [
          {
            id: 1,
            name: 'Felix',
          },
        ],
      };
      expect(isMcpToolOutput(payload, tool)).toBe(true);
    });

    it('rejects invalid output payloads', () => {
      const tool = createSampleTool();
      const payload = {
        value: [
          {
            id: 'not-a-number',
            name: 'Felix',
          },
        ],
      };
      expect(isMcpToolOutput(payload, tool)).toBe(false);
    });

    it('treats undefined schema as always valid', () => {
      const toolWithoutOutput = ToolSchema.parse({
        name: 'noop',
        description: 'Tool without output schema',
        inputSchema: {
          type: 'object',
          properties: {},
        },
        annotations: {},
      });

      expect(isMcpToolOutput(undefined, toolWithoutOutput)).toBe(true);
    });
  });
});
