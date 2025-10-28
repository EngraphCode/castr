/**
 * Basic logging utility for openapi-zod-client.
 *
 * This is a temporary logger that uses console under the hood.
 * After extraction to Engraph monorepo, this will be replaced
 * with the workspace logger.
 *
 * @example
 * ```typescript
 * import { logger } from './utils/logger.js';
 *
 * logger.info('Starting generation...');
 * logger.warn('Deprecated feature used');
 * logger.error('Failed to parse schema');
 * ```
 */
export const logger = {
  /**
   * Log informational message
   */
  info: (...args: unknown[]): void => {
    console.info('[INFO]', ...args);
  },

  /**
   * Log warning message
   */
  warn: (...args: unknown[]): void => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Log error message
   */
  error: (...args: unknown[]): void => {
    console.error('[ERROR]', ...args);
  },
} as const;

