/**
 * Rendering module - Template-based code generation
 * @module rendering
 */

export { generateZodClientFromOpenAPI } from './generate-from-context.js';
export { type GenerateZodClientFromOpenApiArgs } from './generate-from-context.js';

export { type GenerationResult } from './generation-result.js';
export { isSingleFileResult, isGroupedFileResult } from './generation-result.js';
