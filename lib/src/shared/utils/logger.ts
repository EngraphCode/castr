/**
 * Basic logging utility for `@engraph/castr`.
 *
 * The logger writes level-prefixed messages to an injected {@link LoggerSink}.
 * The default sink is the global `console`; tests inject an in-memory fake so
 * no global state is observed or mutated.
 *
 * This is a temporary logger. After extraction to the Engraph monorepo it
 * will be replaced with the workspace logger.
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
 * @param sink - Destination for log output; defaults to the global `console`.
 * @returns A logger whose methods forward to the sink with a level prefix.
 */
export function createLogger(sink: LoggerSink = console): LoggerSink {
  return {
    info: (...args: unknown[]): void => {
      sink.info('[INFO]', ...args);
    },
    warn: (...args: unknown[]): void => {
      sink.warn('[WARN]', ...args);
    },
    error: (...args: unknown[]): void => {
      sink.error('[ERROR]', ...args);
    },
  };
}

/**
 * Default logger instance backed by the global `console`.
 */
export const logger = createLogger();
