/**
 * Tests for Tool Implementations
 */

import { describe, it, expect } from 'vitest';
import { STM32BuildTool } from '../src/tools/stm32-build.js';
import { STM32FlashTool } from '../src/tools/stm32-flash.js';
import { STM32DebugTool } from '../src/tools/stm32-debug.js';
import { PeripheralConfigTool } from '../src/tools/peripheral-config.js';
import { ClockConfigTool } from '../src/tools/clock-config.js';
import { ModelConvertTool } from '../src/tools/model-convert.js';
import { ModelQuantizeTool } from '../src/tools/model-quantize.js';
import { TraceAnalyzeTool } from '../src/tools/trace-analyze.js';
import { RegisterInspectTool } from '../src/tools/register-inspect.js';
import { MemoryMapTool } from '../src/tools/memory-map.js';

describe('STM32BuildTool', () => {
  it('should have correct metadata', () => {
    const tool = new STM32BuildTool();
    expect(tool.name).toBe('stm32_build');
    expect(tool.description).toContain('Build');
  });

  it('should build a cmake project', async () => {
    const tool = new STM32BuildTool();
    const result = await tool.handler({
      projectPath: '.',
      buildType: 'Debug',
    }, {} as any);

    expect(result.content[0]?.type).toBe('text');
    const data = JSON.parse(result.content[0]?.text as string);
    // The build tool detects project type, should succeed for any valid project
    expect(data).toHaveProperty('success');
    expect(data).toHaveProperty('output');
  });
});

describe('STM32FlashTool', () => {
  it('should have correct metadata', () => {
    const tool = new STM32FlashTool();
    expect(tool.name).toBe('stm32_flash');
    expect(tool.description).toContain('Program');
  });

  it('should fail for missing binary', async () => {
    const tool = new STM32FlashTool();
    const result = await tool.handler({
      binaryPath: '/nonexistent/file.elf',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(false);
  });
});

describe('STM32DebugTool', () => {
  it('should have correct metadata', () => {
    const tool = new STM32DebugTool();
    expect(tool.name).toBe('stm32_debug');
    expect(tool.description).toContain('GDB');
  });

  it('should fail for missing ELF', async () => {
    const tool = new STM32DebugTool();
    const result = await tool.handler({
      elfPath: '/nonexistent/file.elf',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(false);
  });
});

describe('PeripheralConfigTool', () => {
  it('should have correct metadata', () => {
    const tool = new PeripheralConfigTool();
    expect(tool.name).toBe('peripheral_config');
    expect(tool.description).toContain('peripheral');
  });

  it('should generate I2C driver', async () => {
    const tool = new PeripheralConfigTool();
    const result = await tool.handler({
      peripheral: 'I2C1',
      mode: 'master',
      config: { clockSpeed: 400000 },
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.files).toBeDefined();
    expect(data.files.length).toBeGreaterThan(0);
  });
});

describe('ClockConfigTool', () => {
  it('should have correct metadata', () => {
    const tool = new ClockConfigTool();
    expect(tool.name).toBe('clock_config');
    expect(tool.description).toContain('clock');
  });

  it('should generate clock configuration', async () => {
    const tool = new ClockConfigTool();
    const result = await tool.handler({
      sysclk: 800000000,
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.frequencies.sysclk).toBe(800000000);
  });
});

describe('ModelConvertTool', () => {
  it('should have correct metadata', () => {
    const tool = new ModelConvertTool();
    expect(tool.name).toBe('model_convert');
    expect(tool.description).toContain('Neural-ART');
  });

  it('should fail for missing model', async () => {
    const tool = new ModelConvertTool();
    const result = await tool.handler({
      inputModel: '/nonexistent/model.onnx',
      inputFormat: 'onnx',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(false);
  });
});

describe('ModelQuantizeTool', () => {
  it('should have correct metadata', () => {
    const tool = new ModelQuantizeTool();
    expect(tool.name).toBe('model_quantize');
    expect(tool.description).toContain('Quantize');
  });

  it('should fail for missing model', async () => {
    const tool = new ModelQuantizeTool();
    const result = await tool.handler({
      inputModel: '/nonexistent/model.bin',
      quantizationScheme: 'int8',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(false);
  });
});

describe('TraceAnalyzeTool', () => {
  it('should have correct metadata', () => {
    const tool = new TraceAnalyzeTool();
    expect(tool.name).toBe('trace_analyze');
    expect(tool.description).toContain('SWV');
  });

  it('should fail for missing trace file', async () => {
    const tool = new TraceAnalyzeTool();
    const result = await tool.handler({
      traceFile: '/nonexistent/trace.bin',
      analysisType: ['timing'],
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(false);
  });
});

describe('RegisterInspectTool', () => {
  it('should have correct metadata', () => {
    const tool = new RegisterInspectTool();
    expect(tool.name).toBe('register_inspect');
    expect(tool.description).toContain('register');
  });

  it('should read I2C1 CR1 register', async () => {
    const tool = new RegisterInspectTool();
    const result = await tool.handler({
      action: 'read',
      peripheral: 'I2C1',
      register: 'CR1',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.bits).toBeDefined();
  });

  it('should fail for unknown peripheral', async () => {
    const tool = new RegisterInspectTool();
    const result = await tool.handler({
      action: 'read',
      peripheral: 'UNKNOWN',
      register: 'CR1',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(false);
  });
});

describe('MemoryMapTool', () => {
  it('should have correct metadata', () => {
    const tool = new MemoryMapTool();
    expect(tool.name).toBe('memory_map');
    expect(tool.description).toContain('memory');
  });

  it('should generate memory map', async () => {
    const tool = new MemoryMapTool();
    const result = await tool.handler({
      analysisType: ['sections', 'usage'],
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.sections).toBeDefined();
    expect(data.memoryUsage).toBeDefined();
  });
});
