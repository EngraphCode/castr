import { Writers, type WriterFunction } from 'ts-morph';
import type { TemplateContextMcpTool } from '../../context/index.js';
import { isValidJsIdentifier } from '../../../shared/utils/identifier-utils.js';

const OBJECT_MAP_KEY_PROPERTIES = 'properties' as const;

export function createMcpToolWriter(tool: TemplateContextMcpTool): WriterFunction {
  const httpOpProps: Record<string, string> = {
    method: `"${tool.httpOperation.method}"`,
    path: `"${tool.httpOperation.path}"`,
    originalPath: `"${tool.httpOperation.originalPath}"`,
  };

  if (tool.httpOperation.operationId) {
    httpOpProps['operationId'] = `"${tool.httpOperation.operationId}"`;
  }

  const toolProps: Record<string, string | WriterFunction> = {
    tool: writeValue(tool.tool),
    httpOperation: Writers.object(httpOpProps),
  };

  if (tool.security) {
    toolProps['security'] = writeValue(tool.security);
  }

  return Writers.object(toolProps);
}

function writeValue(value: unknown): WriterFunction {
  return writeValueWithParentKey(value);
}

function writeValueWithParentKey(value: unknown, parentKey?: string): WriterFunction {
  return (writer) => {
    if (Array.isArray(value)) {
      writer.write('[');
      value.forEach((item, index) => {
        writeValueWithParentKey(item)(writer);
        if (index < value.length - 1) {
          writer.write(', ');
        }
      });
      writer.write(']');
    } else if (typeof value === 'object' && value !== null) {
      writer.write('{');
      const entries = Object.entries(value);
      if (parentKey === OBJECT_MAP_KEY_PROPERTIES) {
        entries.sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey));
      }
      entries.forEach(([key, val], index) => {
        // Use proper identifier validation per ADR-026
        const needsQuotes = !isValidJsIdentifier(key);
        const keyStr = needsQuotes ? `"${key}"` : key;
        writer.write(`${keyStr}: `);
        writeValueWithParentKey(val, key)(writer);
        if (index < entries.length - 1) {
          writer.write(', ');
        }
      });
      writer.write('}');
    } else {
      writer.write(JSON.stringify(value));
    }
  };
}
