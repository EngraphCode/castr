/**
 * Logger (integration)
 *
 * `createLogger` is an integration point per `testing-strategy.md`: the
 * {@link LoggerSink} is an IO interface injected as an argument. These tests
 * therefore carry the `*.integration.test.ts` category — the injected
 * recording sink is a simple fake (captured calls, no logic), which the
 * test-quality rules permit in integration tests but ban from unit tests
 * (`.agent/rules/test-immediate-fails.md` items 11 and 20: unit tests are
 * pure, and the file name IS the category).
 */

import { describe, expect, it } from 'vitest';
import { createLogger, type LoggerSink } from './logger.js';

interface RecordedCall {
  readonly level: 'info' | 'warn' | 'error';
  readonly args: readonly unknown[];
}

interface RecordingSink {
  readonly sink: LoggerSink;
  readonly calls: RecordedCall[];
}

/**
 * Build a fresh in-memory sink per test. No global state is touched:
 * every call the logger makes is recorded on a local array.
 */
function createRecordingSink(): RecordingSink {
  const calls: RecordedCall[] = [];
  const sink: LoggerSink = {
    info: (...args: unknown[]): void => {
      calls.push({ level: 'info', args });
    },
    warn: (...args: unknown[]): void => {
      calls.push({ level: 'warn', args });
    },
    error: (...args: unknown[]): void => {
      calls.push({ level: 'error', args });
    },
  };
  return { sink, calls };
}

describe('createLogger', () => {
  describe('info', () => {
    it('writes info messages to the injected sink with the [INFO] prefix', () => {
      const { sink, calls } = createRecordingSink();
      const logger = createLogger(sink);

      logger.info('test message');

      expect(calls).toEqual([{ level: 'info', args: ['[INFO]', 'test message'] }]);
    });

    it('forwards multiple arguments to the sink', () => {
      const { sink, calls } = createRecordingSink();
      const logger = createLogger(sink);

      logger.info('message', { key: 'value' }, 123);

      expect(calls).toEqual([
        { level: 'info', args: ['[INFO]', 'message', { key: 'value' }, 123] },
      ]);
    });
  });

  describe('warn', () => {
    it('writes warning messages to the injected sink with the [WARN] prefix', () => {
      const { sink, calls } = createRecordingSink();
      const logger = createLogger(sink);

      logger.warn('warning message');

      expect(calls).toEqual([{ level: 'warn', args: ['[WARN]', 'warning message'] }]);
    });

    it('forwards multiple arguments to the sink', () => {
      const { sink, calls } = createRecordingSink();
      const logger = createLogger(sink);

      logger.warn('deprecated', 'operationId');

      expect(calls).toEqual([{ level: 'warn', args: ['[WARN]', 'deprecated', 'operationId'] }]);
    });
  });

  describe('error', () => {
    it('writes error messages to the injected sink with the [ERROR] prefix', () => {
      const { sink, calls } = createRecordingSink();
      const logger = createLogger(sink);

      logger.error('error message');

      expect(calls).toEqual([{ level: 'error', args: ['[ERROR]', 'error message'] }]);
    });

    it('forwards multiple arguments to the sink', () => {
      const { sink, calls } = createRecordingSink();
      const logger = createLogger(sink);
      const err = new Error('test error');

      logger.error('Failed to parse:', err);

      expect(calls).toEqual([{ level: 'error', args: ['[ERROR]', 'Failed to parse:', err] }]);
    });
  });

  describe('level routing', () => {
    it('routes each level to its own sink channel only', () => {
      const { sink, calls } = createRecordingSink();
      const logger = createLogger(sink);

      logger.info('a');
      logger.warn('b');
      logger.error('c');

      expect(calls.map((call) => call.level)).toEqual(['info', 'warn', 'error']);
    });
  });
});
