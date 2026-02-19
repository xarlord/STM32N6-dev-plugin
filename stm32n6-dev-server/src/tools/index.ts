/**
 * Tools Index
 * Register all MCP tools
 */

import type { ToolManager } from './manager.js';
import type { ConfigManager } from '../config/manager.js';
import { STM32BuildTool } from './stm32-build.js';
import { STM32FlashTool } from './stm32-flash.js';
import { STM32DebugTool } from './stm32-debug.js';
import { PeripheralConfigTool } from './peripheral-config.js';
import { ClockConfigTool } from './clock-config.js';
import { ModelConvertTool } from './model-convert.js';
import { ModelQuantizeTool } from './model-quantize.js';
import { TraceAnalyzeTool } from './trace-analyze.js';
import { RegisterInspectTool } from './register-inspect.js';
import { MemoryMapTool } from './memory-map.js';

/**
 * Register all available tools
 */
export function registerAllTools(manager: ToolManager, config: ConfigManager): void {
  // Build tools
  manager.register(new STM32BuildTool());

  // Deploy tools
  manager.register(new STM32FlashTool());
  manager.register(new STM32DebugTool());

  // Code generation tools
  manager.register(new PeripheralConfigTool());
  manager.register(new ClockConfigTool());

  // AI/ML tools
  manager.register(new ModelConvertTool());
  manager.register(new ModelQuantizeTool());

  // Analysis tools
  manager.register(new TraceAnalyzeTool());
  manager.register(new MemoryMapTool());

  // Debug tools
  manager.register(new RegisterInspectTool());
}

// Re-export all tools
export {
  STM32BuildTool,
  STM32FlashTool,
  STM32DebugTool,
  PeripheralConfigTool,
  ClockConfigTool,
  ModelConvertTool,
  ModelQuantizeTool,
  TraceAnalyzeTool,
  RegisterInspectTool,
  MemoryMapTool,
};
