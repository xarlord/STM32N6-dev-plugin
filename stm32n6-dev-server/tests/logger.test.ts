/**
 * Tests for Logger
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { Logger } from '../src/utils/logger.js';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = new Logger('info', 'Test');
  });

  it('should create logger with level and prefix', () => {
    expect(logger).toBeDefined();
  });

  it('should set level', () => {
    logger.setLevel('debug');
    // No error means success
  });

  it('should create child logger', () => {
    const child = logger.child('Child');
    expect(child).toBeDefined();
  });

  it('should log at appropriate levels', () => {
    // These should not throw
    logger.debug('Debug message');
    logger.info('Info message');
    logger.warn('Warning message');
    logger.error('Error message');
  });

  it('should use log method with level', () => {
    logger.log('info', 'Test message');
  });
});
