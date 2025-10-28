import { beforeEach, describe, expect, it, vi } from 'vitest';
import { logger } from './logger.js';

describe('Logger', () => {
  beforeEach(() => {
    vi.spyOn(console, 'info').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('info', () => {
    it('should log info messages with [INFO] prefix', () => {
      logger.info('test message');
      expect(console.info).toHaveBeenCalledWith('[INFO]', 'test message');
    });

    it('should support multiple arguments', () => {
      logger.info('message', { key: 'value' }, 123);
      expect(console.info).toHaveBeenCalledWith('[INFO]', 'message', { key: 'value' }, 123);
    });
  });

  describe('warn', () => {
    it('should log warning messages with [WARN] prefix', () => {
      logger.warn('warning message');
      expect(console.warn).toHaveBeenCalledWith('[WARN]', 'warning message');
    });

    it('should support multiple arguments', () => {
      logger.warn('deprecated', 'operationId');
      expect(console.warn).toHaveBeenCalledWith('[WARN]', 'deprecated', 'operationId');
    });
  });

  describe('error', () => {
    it('should log error messages with [ERROR] prefix', () => {
      logger.error('error message');
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'error message');
    });

    it('should support multiple arguments', () => {
      const err = new Error('test error');
      logger.error('Failed to parse:', err);
      expect(console.error).toHaveBeenCalledWith('[ERROR]', 'Failed to parse:', err);
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
      logger.info = () => {};
    });
  });
});
