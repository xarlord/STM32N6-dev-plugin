/**
 * Tests for Configuration Manager
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ConfigManager } from '../src/config/manager.js';

describe('ConfigManager', () => {
  let config: ConfigManager;

  beforeEach(() => {
    config = new ConfigManager();
  });

  it('should create with default configuration', () => {
    const all = config.getAll();
    expect(all.server.logLevel).toBe('info');
    expect(all.server.timeout).toBe(60000);
    expect(all.target.mcu).toBe('STM32N6570');
    expect(all.target.board).toBe('STM32N6570-DK');
  });

  it('should get configuration values', () => {
    expect(config.get('server').logLevel).toBe('info');
    expect(config.get('target').mcu).toBe('STM32N6570');
  });

  it('should set configuration values', () => {
    config.set('server', { logLevel: 'debug', timeout: 30000 });
    expect(config.get('server').logLevel).toBe('debug');
    expect(config.get('server').timeout).toBe(30000);
  });

  it('should validate configuration', () => {
    const result = config.validate();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should merge options on construction', () => {
    const customConfig = new ConfigManager({
      server: { logLevel: 'error', timeout: 10000 },
    });

    expect(customConfig.get('server').logLevel).toBe('error');
    expect(customConfig.get('server').timeout).toBe(10000);
  });

  it('should check tool availability', () => {
    expect(config.isToolAvailable('stm32cubeIdePath')).toBe(false);

    config.set('toolchain', { stm32cubeIdePath: '/path/to/ide' });
    expect(config.isToolAvailable('stm32cubeIdePath')).toBe(true);
  });

  it('should get tool path with fallback', () => {
    expect(config.getToolPath('stm32cubeIdePath')).toBeUndefined();
    expect(config.getToolPath('stm32cubeIdePath', '/default/path')).toBe('/default/path');

    config.set('toolchain', { stm32cubeIdePath: '/custom/path' });
    expect(config.getToolPath('stm32cubeIdePath')).toBe('/custom/path');
  });

  it('should get typed configuration sections', () => {
    const debugConfig = config.getDebugConfig();
    expect(debugConfig.probe).toBe('stlink');
    expect(debugConfig.interface).toBe('swd');
    expect(debugConfig.speed).toBe(4000);

    const buildConfig = config.getBuildConfig();
    expect(buildConfig.defaultBuildType).toBe('Debug');
    expect(buildConfig.parallelJobs).toBe(4);

    const targetConfig = config.getTargetConfig();
    expect(targetConfig.mcu).toBe('STM32N6570');
    expect(targetConfig.board).toBe('STM32N6570-DK');

    const edgeAiConfig = config.getEdgeAiConfig();
    expect(edgeAiConfig.defaultQuantization).toBe('int8');
    expect(edgeAiConfig.optimizeFor).toBe('balanced');
  });

  it('should create child config with overrides', () => {
    const childConfig = config.withOverrides({
      server: { logLevel: 'debug', timeout: 5000 },
    });

    expect(childConfig.get('server').logLevel).toBe('debug');
    expect(childConfig.get('server').timeout).toBe(5000);

    // Original should be unchanged
    expect(config.get('server').logLevel).toBe('info');
  });
});
