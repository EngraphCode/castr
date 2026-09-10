/**
 * Basic logging utility for `@engraph/castr`.
 *
 * The logger writes level-prefixed messages to an injected {@link LoggerSink}.
 * In-process tests inject an in-memory fake, while the default logger resolves
 * the current global `console` whenever a log call runs.
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

/**
 * Destination for log output. Structurally compatible with the global
 * `console`, so `console` is a valid sink; tests supply an in-memory fake.
 */
export interface LoggerSink {
  /** Receive an informational message. */
  readonly info: (...args: unknown[]) => void;

  /** Receive a warning message. */
  readonly warn: (...args: unknown[]) => void;

  /** Receive an error message. */
  readonly error: (...args: unknown[]) => void;
}

/**
 * Create a logger that writes level-prefixed messages (`[INFO]`, `[WARN]`,
 * `[ERROR]`) to the given sink.
 *
 * @param sink - Destination for log output. When omitted, each call resolves
 * the current global `console`, so adapters installed after import receive
 * subsequent output.
 * @returns A logger whose methods forward to the sink with a level prefix.
 */
export function createLogger(sink?: LoggerSink): LoggerSink {
  const resolveSink = (): LoggerSink => sink ?? console;
  return {
    info: (...args: unknown[]): void => {
      resolveSink().info('[INFO]', ...args);
    },
    warn: (...args: unknown[]): void => {
      resolveSink().warn('[WARN]', ...args);
    },
    error: (...args: unknown[]): void => {
      resolveSink().error('[ERROR]', ...args);
    },
  };
}

/**
 * Default logger instance backed by the global `console`.
 */
export const logger = createLogger();
