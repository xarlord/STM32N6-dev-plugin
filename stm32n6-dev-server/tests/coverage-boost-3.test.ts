/**
 * Additional tests for maximum coverage - Part 3
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ConfigManager } from '../src/config/manager.js';
import { BaseTool, ToolCategory, ToolResult } from '../src/tools/base.js';
import { z } from 'zod';

// Store original env
const originalEnv = { ...process.env };

describe('ConfigManager Extended', () => {
  afterEach(() => {
    // Restore environment
    process.env = { ...originalEnv };
  });

  it('should load config from STM32N6_LOG_LEVEL env var', () => {
    process.env['STM32N6_LOG_LEVEL'] = 'debug';
    const config = new ConfigManager();
    expect(config.get('server').logLevel).toBe('debug');
  });

  it('should load config from STM32N6_TIMEOUT env var', () => {
    process.env['STM32N6_TIMEOUT'] = '30000';
    const config = new ConfigManager();
    expect(config.get('server').timeout).toBe(30000);
  });

  it('should ignore invalid STM32N6_LOG_LEVEL', () => {
    process.env['STM32N6_LOG_LEVEL'] = 'invalid';
    const config = new ConfigManager();
    // Should use default
    expect(config.get('server').logLevel).toBe('info');
  });

  it('should ignore invalid STM32N6_TIMEOUT', () => {
    process.env['STM32N6_TIMEOUT'] = 'not-a-number';
    const config = new ConfigManager();
    // Should use default
    expect(config.get('server').timeout).toBe(60000);
  });

  it('should load toolchain paths from env', () => {
    process.env['STM32CUBE_IDE_PATH'] = '/path/to/cubeide';
    process.env['GCC_ARM_PATH'] = '/path/to/gcc';
    process.env['STM32CUBE_PROG_PATH'] = '/path/to/prog';
    process.env['ST_EDGE_AI_PATH'] = '/path/to/edgeai';
    process.env['OPENOCD_PATH'] = '/path/to/openocd';

    const config = new ConfigManager();
    expect(config.get('toolchain').stm32cubeIdePath).toBe('/path/to/cubeide');
    expect(config.get('toolchain').gccArmPath).toBe('/path/to/gcc');
    expect(config.get('toolchain').stm32cubeProgPath).toBe('/path/to/prog');
    expect(config.get('toolchain').stEdgeAiPath).toBe('/path/to/edgeai');
    expect(config.get('toolchain').openocdPath).toBe('/path/to/openocd');
  });

  it('should use getNested for nested config access', () => {
    const config = new ConfigManager();
    const logLevel = config.getNested('server', 'logLevel');
    expect(logLevel).toBe('info');
  });

  it('should set configuration value', () => {
    const config = new ConfigManager();
    config.set('server', { logLevel: 'debug', timeout: 30000 });
    expect(config.get('server').logLevel).toBe('debug');
  });

  it('should check if tool is available', () => {
    const config = new ConfigManager();
    expect(config.isToolAvailable('stm32cubeIdePath')).toBe(false);

    process.env['STM32CUBE_IDE_PATH'] = '/path/to/cubeide';
    const configWithTool = new ConfigManager();
    expect(configWithTool.isToolAvailable('stm32cubeIdePath')).toBe(true);
  });

  it('should get tool path with fallback', () => {
    const config = new ConfigManager();
    const path = config.getToolPath('stm32cubeIdePath', '/default/path');
    expect(path).toBe('/default/path');
  });

  it('should return debug config', () => {
    const config = new ConfigManager();
    const debugConfig = config.getDebugConfig();
    expect(debugConfig.probe).toBe('stlink');
    expect(debugConfig.interface).toBe('swd');
  });

  it('should return build config', () => {
    const config = new ConfigManager();
    const buildConfig = config.getBuildConfig();
    expect(buildConfig.defaultBuildType).toBe('Debug');
    expect(buildConfig.parallelJobs).toBe(4);
  });

  it('should return target config', () => {
    const config = new ConfigManager();
    const targetConfig = config.getTargetConfig();
    expect(targetConfig.mcu).toBe('STM32N6570');
    expect(targetConfig.board).toBe('STM32N6570-DK');
  });

  it('should return edge AI config', () => {
    const config = new ConfigManager();
    const edgeAiConfig = config.getEdgeAiConfig();
    expect(edgeAiConfig.defaultQuantization).toBe('int8');
    expect(edgeAiConfig.optimizeFor).toBe('balanced');
  });

  it('should create config with overrides', () => {
    const config = new ConfigManager();
    const newConfig = config.withOverrides({
      server: { logLevel: 'error', timeout: 120000 },
    });
    expect(newConfig.get('server').logLevel).toBe('error');
    expect(newConfig.get('server').timeout).toBe(120000);
    // Original should not be affected
    expect(config.get('server').logLevel).toBe('info');
  });

  it('should validate configuration', () => {
    const config = new ConfigManager();
    const result = config.validate();
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should return validation error for invalid config', () => {
    const config = new ConfigManager();
    // Manually corrupt the config
    (config as any).config = { invalid: 'config' };

    const result = config.validate();
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThan(0);
  });
});

// Test various Zod schema types for JSON schema conversion
describe('BaseTool JSON Schema Conversion', () => {
  // Test tools with various schema types
  class NumberTool extends BaseTool {
    readonly name = 'number_tool';
    readonly description = 'Tool with number schema';
    readonly inputSchema = z.object({
      value: z.number(),
    });
    readonly category = ToolCategory.BUILD;
    protected async execute() { return { success: true }; }
  }

  class BooleanTool extends BaseTool {
    readonly name = 'boolean_tool';
    readonly description = 'Tool with boolean schema';
    readonly inputSchema = z.object({
      enabled: z.boolean(),
    });
    readonly category = ToolCategory.BUILD;
    protected async execute() { return { success: true }; }
  }

  class ArrayTool extends BaseTool {
    readonly name = 'array_tool';
    readonly description = 'Tool with array schema';
    readonly inputSchema = z.object({
      items: z.array(z.string()),
    });
    readonly category = ToolCategory.BUILD;
    protected async execute() { return { success: true }; }
  }

  class EnumTool extends BaseTool {
    readonly name = 'enum_tool';
    readonly description = 'Tool with enum schema';
    readonly inputSchema = z.object({
      mode: z.enum(['mode1', 'mode2', 'mode3']),
    });
    readonly category = ToolCategory.BUILD;
    protected async execute() { return { success: true }; }
  }

  class NativeEnumTool extends BaseTool {
    readonly name = 'native_enum_tool';
    readonly description = 'Tool with native enum schema';
    readonly inputSchema = z.object({
      level: z.nativeEnum({ LOW: 'low', MEDIUM: 'medium', HIGH: 'high' }),
    });
    readonly category = ToolCategory.BUILD;
    protected async execute() { return { success: true }; }
  }

  class LiteralTool extends BaseTool {
    readonly name = 'literal_tool';
    readonly description = 'Tool with literal schema';
    readonly inputSchema = z.object({
      type: z.literal('fixed'),
    });
    readonly category = ToolCategory.BUILD;
    protected async execute() { return { success: true }; }
  }

  class OptionalTool extends BaseTool {
    readonly name = 'optional_tool';
    readonly description = 'Tool with optional schema';
    readonly inputSchema = z.object({
      required: z.string(),
      optional: z.string().optional(),
    });
    readonly category = ToolCategory.BUILD;
    protected async execute() { return { success: true }; }
  }

  class DefaultTool extends BaseTool {
    readonly name = 'default_tool';
    readonly description = 'Tool with default schema';
    readonly inputSchema = z.object({
      name: z.string().default('default_name'),
    });
    readonly category = ToolCategory.BUILD;
    protected async execute() { return { success: true }; }
  }

  it('should generate JSON schema for number type', () => {
    const tool = new NumberTool();
    const schema = tool.getJsonSchema();
    expect(schema.type).toBe('object');
    expect((schema.properties as any).value.type).toBe('number');
  });

  it('should generate JSON schema for boolean type', () => {
    const tool = new BooleanTool();
    const schema = tool.getJsonSchema();
    expect((schema.properties as any).enabled.type).toBe('boolean');
  });

  it('should generate JSON schema for array type', () => {
    const tool = new ArrayTool();
    const schema = tool.getJsonSchema();
    expect((schema.properties as any).items.type).toBe('array');
    expect((schema.properties as any).items.items.type).toBe('string');
  });

  it('should generate JSON schema for enum type', () => {
    const tool = new EnumTool();
    const schema = tool.getJsonSchema();
    expect((schema.properties as any).mode.type).toBe('string');
    expect((schema.properties as any).mode.enum).toEqual(['mode1', 'mode2', 'mode3']);
  });

  it('should generate JSON schema for native enum type', () => {
    const tool = new NativeEnumTool();
    const schema = tool.getJsonSchema();
    expect((schema.properties as any).level.type).toBe('string');
    expect((schema.properties as any).level.enum).toContain('low');
    expect((schema.properties as any).level.enum).toContain('medium');
    expect((schema.properties as any).level.enum).toContain('high');
  });

  it('should generate JSON schema for literal type', () => {
    const tool = new LiteralTool();
    const schema = tool.getJsonSchema();
    expect((schema.properties as any).type.type).toBe('string');
    expect((schema.properties as any).type.const).toBe('fixed');
  });

  it('should generate JSON schema for optional type', () => {
    const tool = new OptionalTool();
    const schema = tool.getJsonSchema();
    // required should be in the required array
    expect(schema.required).toContain('required');
    expect(schema.required).not.toContain('optional');
  });

  it('should generate JSON schema for default type', () => {
    const tool = new DefaultTool();
    const schema = tool.getJsonSchema();
    expect((schema.properties as any).name.default).toBe('default_name');
  });

  it('should handle isErrorResult with non-object', async () => {
    const tool = new NumberTool();
    const result = await tool.handler({ value: 42 }, {} as any);
    expect(result.isError).toBe(false);
  });

  it('should handle isErrorResult with success=false', async () => {
    class FailingTool extends BaseTool {
      readonly name = 'failing_tool';
      readonly description = 'Tool that returns failure';
      readonly inputSchema = z.object({});
      readonly category = ToolCategory.BUILD;
      protected async execute() {
        return { success: false, error: 'Test error' };
      }
    }

    const tool = new FailingTool();
    const result = await tool.handler({}, {} as any);
    expect(result.isError).toBe(true);
    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(false);
  });
});
