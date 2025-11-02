import { afterEach, beforeEach, describe, expect, it, vi, type MockInstance } from 'vitest';
import { logger } from './logger.js';

describe('Logger', () => {
  let infoSpy: MockInstance<typeof console.info>;
  let warnSpy: MockInstance<typeof console.warn>;
  let errorSpy: MockInstance<typeof console.error>;

  beforeEach(() => {
    infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('info', () => {
    it('should log info messages with [INFO] prefix', () => {
      logger.info('test message');
      expect(infoSpy).toHaveBeenCalledWith('[INFO]', 'test message');
    });

    it('should support multiple arguments', () => {
      logger.info('message', { key: 'value' }, 123);
      expect(infoSpy).toHaveBeenCalledWith('[INFO]', 'message', { key: 'value' }, 123);
    });
  });

  describe('warn', () => {
    it('should log warning messages with [WARN] prefix', () => {
      logger.warn('warning message');
      expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'warning message');
    });

    it('should support multiple arguments', () => {
      logger.warn('deprecated', 'operationId');
      expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'deprecated', 'operationId');
    });
  });

  describe('error', () => {
    it('should log error messages with [ERROR] prefix', () => {
      logger.error('error message');
      expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'error message');
    });

    it('should support multiple arguments', () => {
      const err = new Error('test error');
      logger.error('Failed to parse:', err);
      expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'Failed to parse:', err);
    });
  });

  describe('type safety', () => {
    it('should have readonly methods (compile-time check)', () => {
      // This test verifies the logger object exists and has the expected methods
      // The `as const` provides compile-time immutability via TypeScript
      expect(logger).toHaveProperty('info');
      expect(logger).toHaveProperty('warn');
      expect(logger).toHaveProperty('error');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');

      // Compile-time check (this would fail type-check if logger wasn't readonly):
      // @ts-expect-error - logger methods are readonly
      logger.info = (): void => undefined;
    });
  });
});
