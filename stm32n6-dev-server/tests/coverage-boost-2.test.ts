/**
 * Additional tests for maximum coverage improvement
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { STM32BuildTool } from '../src/tools/stm32-build.js';
import { STM32FlashTool } from '../src/tools/stm32-flash.js';
import { STM32DebugTool } from '../src/tools/stm32-debug.js';
import { ModelConvertTool } from '../src/tools/model-convert.js';
import { ModelQuantizeTool } from '../src/tools/model-quantize.js';
import { TraceAnalyzeTool } from '../src/tools/trace-analyze.js';
import { AIEngineerAgent } from '../src/agents/ai-engineer.js';
import { TemplateEngine } from '../src/templates/engine.js';
import { HookEngine, HookDefinition } from '../src/hooks/engine.js';
import { registerAllHooks } from '../src/hooks/index.js';
import { AgentContext } from '../src/agents/base.js';
import * as fs from 'fs/promises';
import * as path from 'path';

// Mock context for agent tests
const mockContext: AgentContext = {
  projectPath: '.',
  config: {},
  serverContext: {
    config: {
      getAll: () => ({}),
    },
    logger: {
      log: () => {},
    },
  } as any,
};

// Create temporary test files
async function createTempFile(name: string, content: string): Promise<string> {
  const tempDir = './temp-test';
  try {
    await fs.mkdir(tempDir, { recursive: true });
  } catch {}
  const filePath = path.join(tempDir, name);
  await fs.writeFile(filePath, content);
  return filePath;
}

async function cleanupTempFiles(): Promise<void> {
  try {
    await fs.rm('./temp-test', { recursive: true, force: true });
  } catch {}
}

describe('STM32BuildTool Extended', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = './temp-build-test';
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
    await fs.mkdir(tempDir, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch {}
  });

  it('should build CMake project', async () => {
    const tool = new STM32BuildTool();
    // Create CMakeLists.txt to trigger cmake build
    await fs.writeFile(path.join(tempDir, 'CMakeLists.txt'), 'cmake_minimum_required(VERSION 3.10)');

    const result = await tool.handler({
      projectPath: tempDir,
      buildType: 'Release',
      target: 'all',
      verbose: true,
      clean: false,
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.output).toContain('CMake');
  });

  it('should build Makefile project', async () => {
    const tool = new STM32BuildTool();
    // Create Makefile to trigger make build
    await fs.writeFile(path.join(tempDir, 'Makefile'), 'all:\n\techo building');

    const result = await tool.handler({
      projectPath: tempDir,
      buildType: 'Debug',
      target: 'all',
      verbose: false,
      clean: false,
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.output).toContain('Makefile');
  });

  it('should build STM32CubeIDE project', async () => {
    const tool = new STM32BuildTool();
    // Create .project to trigger CubeIDE build
    await fs.writeFile(path.join(tempDir, '.project'), '<?xml version="1.0"?><projectDescription/>');

    const result = await tool.handler({
      projectPath: tempDir,
      buildType: 'MinSizeRel',
      target: 'all',
      verbose: false,
      clean: false,
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.output).toContain('STM32CubeIDE');
  });

  it('should fail for unknown project type', async () => {
    const tool = new STM32BuildTool();
    // Empty directory - no project files

    const result = await tool.handler({
      projectPath: tempDir,
      buildType: 'Debug',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(false);
    expect(data.errors[0].message).toContain('Unable to detect project type');
  });
});

describe('STM32FlashTool Extended', () => {
  let tempFile: string;

  beforeEach(async () => {
    tempFile = await createTempFile('test.elf', 'ELF binary content here');
  });

  afterEach(async () => {
    await cleanupTempFiles();
  });

  it('should flash with J-Link probe', async () => {
    const tool = new STM32FlashTool();
    const result = await tool.handler({
      binaryPath: tempFile,
      probe: 'jlink',
      interface: 'jtag',
      verify: true,
      reset: true,
      eraseType: 'full',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.targetInfo.chipId).toBe('STM32N6570');
  });

  it('should flash with no verification and no reset', async () => {
    const tool = new STM32FlashTool();
    const result = await tool.handler({
      binaryPath: tempFile,
      probe: 'stlink',
      interface: 'swd',
      verify: false,
      reset: false,
      eraseType: 'none',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.verified).toBe(false);
  });

  it('should flash with ULINK probe', async () => {
    const tool = new STM32FlashTool();
    const result = await tool.handler({
      binaryPath: tempFile,
      probe: 'ulink',
      interface: 'swd',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
  });
});

describe('STM32DebugTool Extended', () => {
  let tempFile: string;

  beforeEach(async () => {
    tempFile = await createTempFile('debug.elf', 'ELF with debug symbols');
  });

  afterEach(async () => {
    await cleanupTempFiles();
  });

  it('should start debug session with SWV enabled', async () => {
    const tool = new STM32DebugTool();
    const result = await tool.handler({
      elfPath: tempFile,
      probe: 'stlink',
      interface: 'swd',
      speed: 8000,
      swv: true,
      swvSpeed: 4000,
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.message).toContain('SWV: Enabled');
  });

  it('should start debug session with RTOS awareness', async () => {
    const tool = new STM32DebugTool();
    const result = await tool.handler({
      elfPath: tempFile,
      probe: 'jlink',
      interface: 'jtag',
      speed: 4000,
      swv: false,
      rtosAwareness: 'freertos',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.message).toContain('RTOS Awareness: freertos');
  });

  it('should start debug session with ThreadX awareness', async () => {
    const tool = new STM32DebugTool();
    const result = await tool.handler({
      elfPath: tempFile,
      probe: 'stlink',
      rtosAwareness: 'threadx',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.message).toContain('RTOS Awareness: threadx');
  });

  it('should start debug with init commands', async () => {
    const tool = new STM32DebugTool();
    const result = await tool.handler({
      elfPath: tempFile,
      probe: 'stlink',
      initCommands: ['break main', 'continue'],
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.sessionId).toBeDefined();
  });
});

describe('ModelConvertTool Extended', () => {
  let tempModel: string;

  beforeEach(async () => {
    tempModel = await createTempFile('model.onnx', 'ONNX model binary data');
  });

  afterEach(async () => {
    await cleanupTempFiles();
  });

  it('should convert TensorFlow Lite model', async () => {
    const tool = new ModelConvertTool();
    const result = await tool.handler({
      inputModel: tempModel,
      inputFormat: 'tflite',
      outputFormat: 'stedgeai',
      targetDevice: 'STM32N6570',
      optimizeFor: 'latency',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.modelInfo.framework).toBe('tflite');
  });

  it('should convert PyTorch model', async () => {
    const tool = new ModelConvertTool();
    const result = await tool.handler({
      inputModel: tempModel,
      inputFormat: 'pytorch',
      outputFormat: 'stedgeai',
      optimizeFor: 'memory',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.modelInfo.framework).toBe('pytorch');
  });

  it('should convert Keras model', async () => {
    const tool = new ModelConvertTool();
    const result = await tool.handler({
      inputModel: tempModel,
      inputFormat: 'keras',
      outputFormat: 'tflite_micro',
      optimizeFor: 'balanced',
      useCloud: true,
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.modelInfo.framework).toBe('keras');
  });

  it('should use custom output path', async () => {
    const tool = new ModelConvertTool();
    const result = await tool.handler({
      inputModel: tempModel,
      inputFormat: 'onnx',
      outputPath: '/custom/output/model_converted',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.outputPath).toBe('/custom/output/model_converted');
  });
});

describe('ModelQuantizeTool Extended', () => {
  let tempModel: string;

  beforeEach(async () => {
    tempModel = await createTempFile('model.bin', 'Binary model data for quantization test - needs some size here');
  });

  afterEach(async () => {
    await cleanupTempFiles();
  });

  it('should quantize with int4 scheme', async () => {
    const tool = new ModelQuantizeTool();
    const result = await tool.handler({
      inputModel: tempModel,
      quantizationScheme: 'int4',
      evaluateAccuracy: true,
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.quantizationReport.compressionRatio).toBe(8);
    expect(data.quantizationReport.accuracyMetrics.quantizedAccuracy).toBeLessThan(0.92);
  });

  it('should quantize with mixed scheme', async () => {
    const tool = new ModelQuantizeTool();
    const result = await tool.handler({
      inputModel: tempModel,
      quantizationScheme: 'mixed',
      evaluateAccuracy: true,
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.quantizationReport.compressionRatio).toBe(3);
  });

  it('should quantize with fp16 scheme', async () => {
    const tool = new ModelQuantizeTool();
    const result = await tool.handler({
      inputModel: tempModel,
      quantizationScheme: 'fp16',
      evaluateAccuracy: true,
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.quantizationReport.compressionRatio).toBe(2);
  });

  it('should quantize without accuracy evaluation', async () => {
    const tool = new ModelQuantizeTool();
    const result = await tool.handler({
      inputModel: tempModel,
      quantizationScheme: 'int8',
      evaluateAccuracy: false,
      calibrationData: '/path/to/calibration',
      calibrationSamples: 200,
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.quantizationReport.accuracyMetrics).toBeUndefined();
  });

  it('should use custom output path', async () => {
    const tool = new ModelQuantizeTool();
    const result = await tool.handler({
      inputModel: tempModel,
      outputPath: '/custom/quantized_model',
      quantizationScheme: 'int8',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.outputPath).toBe('/custom/quantized_model');
  });

  it('should include layer analysis', async () => {
    const tool = new ModelQuantizeTool();
    const result = await tool.handler({
      inputModel: tempModel,
      quantizationScheme: 'int8',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.layerAnalysis).toBeDefined();
    expect(data.layerAnalysis.length).toBeGreaterThan(0);
    expect(data.layerAnalysis[0]).toHaveProperty('layer');
    expect(data.layerAnalysis[0]).toHaveProperty('quantizedSize');
  });
});

describe('TraceAnalyzeTool Extended', () => {
  let tempTrace: string;

  beforeEach(async () => {
    tempTrace = await createTempFile('trace.bin', 'Binary trace data');
  });

  afterEach(async () => {
    await cleanupTempFiles();
  });

  it('should analyze timing', async () => {
    const tool = new TraceAnalyzeTool();
    const result = await tool.handler({
      traceFile: tempTrace,
      analysisType: ['timing'],
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.analysisReport.timing).toBeDefined();
    expect(data.analysisReport.timing.functions.length).toBeGreaterThan(0);
  });

  it('should analyze coverage', async () => {
    const tool = new TraceAnalyzeTool();
    const result = await tool.handler({
      traceFile: tempTrace,
      analysisType: ['coverage'],
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.analysisReport.coverage).toBeDefined();
    expect(data.analysisReport.coverage.lineCoverage).toBe(78.5);
  });

  it('should analyze exceptions', async () => {
    const tool = new TraceAnalyzeTool();
    const result = await tool.handler({
      traceFile: tempTrace,
      analysisType: ['exceptions'],
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.analysisReport.exceptions).toBeDefined();
  });

  it('should analyze multiple types', async () => {
    const tool = new TraceAnalyzeTool();
    const result = await tool.handler({
      traceFile: tempTrace,
      analysisType: ['timing', 'coverage', 'exceptions', 'data', 'pc-sampling', 'itm'],
      elfFile: '/path/to/firmware.elf',
      timeRange: { start: 0, end: 1000 },
      outputFormat: 'html',
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    expect(data.analysisReport.timing).toBeDefined();
    expect(data.analysisReport.coverage).toBeDefined();
    expect(data.analysisReport.exceptions).toBeDefined();
    expect(data.recommendations.length).toBeGreaterThan(0);
  });

  it('should generate slow function recommendations', async () => {
    const tool = new TraceAnalyzeTool();
    const result = await tool.handler({
      traceFile: tempTrace,
      analysisType: ['timing'],
    }, {} as any);

    const data = JSON.parse(result.content[0]?.text as string);
    expect(data.success).toBe(true);
    // The recommendations should mention slow functions
    const slowFuncRec = data.recommendations.find((r: string) => r.includes('slow functions'));
    expect(slowFuncRec).toBeDefined();
  });
});

describe('AIEngineerAgent Extended', () => {
  it('should handle model conversion task', async () => {
    const agent = new AIEngineerAgent();
    const result = await agent.execute({ task: 'convert my ONNX' }, mockContext);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.steps).toBeDefined();
    expect(result.data.steps.length).toBe(5);
  });

  it('should handle quantization task', async () => {
    const agent = new AIEngineerAgent();
    // Use task that doesn't include 'model' or 'convert' keyword
    const result = await agent.execute({ task: 'quantiz to int8' }, mockContext);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.schemes).toBeDefined();
    // int8 scheme exists and has expected properties
    expect(result.data.schemes.int8).toBeDefined();
    expect(result.data.schemes.int8.compression).toBe('4x');
  });

  it('should handle deployment task', async () => {
    const agent = new AIEngineerAgent();
    // Use task that doesn't include 'model' or 'convert' keyword
    const result = await agent.execute({ task: 'deploy for inference' }, mockContext);
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
    expect(result.data.steps).toBeDefined();
    // codeTemplate is defined in the response
    expect(result.data.codeTemplate).toBeDefined();
  });
});

describe('TemplateEngine Extended', () => {
  it('should render with upper helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('upper-test', '{{upper name}}');
    const result = engine.render('upper-test', { name: 'test' });
    expect(result).toBe('TEST');
  });

  it('should render with lower helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('lower-test', '{{lower name}}');
    const result = engine.render('lower-test', { name: 'TEST' });
    expect(result).toBe('test');
  });

  it('should render with camel helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('camel-test', '{{camel name}}');
    const result = engine.render('camel-test', { name: 'my-variable_name' });
    expect(result).toBe('myVariableName');
  });

  it('should render with pascal helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('pascal-test', '{{pascal name}}');
    const result = engine.render('pascal-test', { name: 'my-variable_name' });
    expect(result).toBe('MyVariableName');
  });

  it('should render with snake helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('snake-test', '{{snake name}}');
    const result = engine.render('snake-test', { name: 'MyVariableName' });
    expect(result).toBe('my_variable_name');
  });

  it('should render with eq helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('eq-test', '{{#if (eq value 1)}}yes{{else}}no{{/if}}');
    const result = engine.render('eq-test', { value: 1 });
    expect(result).toBe('yes');
  });

  it('should render with ne helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('ne-test', '{{#if (ne value 1)}}yes{{else}}no{{/if}}');
    const result = engine.render('ne-test', { value: 2 });
    expect(result).toBe('yes');
  });

  it('should render with json helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('json-test', '{{json data}}');
    const result = engine.render('json-test', { data: { key: 'value' } });
    // Handlebars escapes HTML entities by default
    expect(result).toContain('key');
    expect(result).toContain('value');
  });

  it('should render with hex helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('hex-test', '{{hex value}}');
    const result = engine.render('hex-test', { value: 255 });
    expect(result).toBe('0xFF');
  });

  it('should render with shift helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('shift-test', '{{shift value bits}}');
    const result = engine.render('shift-test', { value: 1, bits: 4 });
    expect(result).toBe('16');
  });

  it('should render with comment helper', async () => {
    const engine = new TemplateEngine('./templates');
    engine.registerTemplate('comment-test', '{{comment text}}');
    const result = engine.render('comment-test', { text: 'Test comment' });
    expect(result).toContain('/**');
    expect(result).toContain('Test comment');
  });
});

describe('Hooks Extended', () => {
  it('should execute validate_project hook', async () => {
    const engine = new HookEngine();
    registerAllHooks(engine);

    const result = await engine.execute('pre', 'tool', 'stm32_build', {
      trigger: 'tool',
      target: 'stm32_build',
      params: { projectPath: '/test/project' },
      result: null,
    });

    expect(result.proceed).toBe(true);
  });

  it('should fail validate_project hook without path', async () => {
    const engine = new HookEngine();
    registerAllHooks(engine);

    const result = await engine.execute('pre', 'tool', 'stm32_build', {
      trigger: 'tool',
      target: 'stm32_build',
      params: {},
      result: null,
    });

    expect(result.proceed).toBe(false);
    expect(result.error).toContain('Project path is required');
  });

  it('should execute analyze_build_output hook with warnings', async () => {
    const engine = new HookEngine();
    registerAllHooks(engine);

    const result = await engine.execute('post', 'tool', 'stm32_build', {
      trigger: 'tool',
      target: 'stm32_build',
      params: {},
      result: { success: true, warnings: ['Unused variable', 'Implicit conversion'] },
    });

    expect(result.proceed).toBe(true);
    expect(result.suggestions).toBeDefined();
    expect(result.suggestions![0]).toContain('2 warnings');
  });

  it('should execute check_target_connection hook for flash', async () => {
    const engine = new HookEngine();
    registerAllHooks(engine);

    const result = await engine.execute('pre', 'tool', 'stm32_flash', {
      trigger: 'tool',
      target: 'stm32_flash',
      params: {},
      result: null,
    });

    expect(result.proceed).toBe(true);
    expect(result.metadata?.probeStatus).toBe('connected');
  });

  it('should execute log_flash_result hook', async () => {
    const engine = new HookEngine();
    registerAllHooks(engine);

    const result = await engine.execute('post', 'tool', 'stm32_flash', {
      trigger: 'tool',
      target: 'stm32_flash',
      params: {},
      result: { success: true, bytesWritten: 65536 },
    });

    expect(result.proceed).toBe(true);
  });

  it('should match regex target for debug', async () => {
    const engine = new HookEngine();
    registerAllHooks(engine);

    // The check_target_connection hook should match both stm32_flash and stm32_debug via regex
    const result = await engine.execute('pre', 'tool', 'stm32_debug', {
      trigger: 'tool',
      target: 'stm32_debug',
      params: {},
      result: null,
    });

    expect(result.proceed).toBe(true);
    expect(result.metadata?.probeStatus).toBe('connected');
  });

  it('should call hook handler directly for coverage', async () => {
    // Test individual hooks by accessing them via listAll
    const engine = new HookEngine();
    registerAllHooks(engine);

    const hooks = engine.listAll();

    // Find and test the validate_project hook handler directly
    const validateHook = hooks.find(h => h.name === 'validate_project');
    expect(validateHook).toBeDefined();

    const resultWithProject = await validateHook!.handler({
      trigger: 'tool',
      target: 'stm32_build',
      params: { projectPath: '/test' },
      result: null,
    });
    expect(resultWithProject.proceed).toBe(true);

    const resultWithoutProject = await validateHook!.handler({
      trigger: 'tool',
      target: 'stm32_build',
      params: {},
      result: null,
    });
    expect(resultWithoutProject.proceed).toBe(false);

    // Find and test analyze_build_output hook
    const analyzeHook = hooks.find(h => h.name === 'analyze_build_output');
    const analyzeResultNoWarnings = await analyzeHook!.handler({
      trigger: 'tool',
      target: 'stm32_build',
      params: {},
      result: { success: true },
    });
    expect(analyzeResultNoWarnings.proceed).toBe(true);

    // Find and test log_flash_result hook
    const logHook = hooks.find(h => h.name === 'log_flash_result');
    const logResultFail = await logHook!.handler({
      trigger: 'tool',
      target: 'stm32_flash',
      params: {},
      result: { success: false },
    });
    expect(logResultFail.proceed).toBe(true);
  });
});
