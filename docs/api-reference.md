# STM32N6-Dev-Team Plugin - API Reference

**Document Version:** 1.0
**Date:** 2026-02-18
**Status:** Phase 2 - Architecture Design

---

## Table of Contents

1. [MCP Tools API](#1-mcp-tools-api)
2. [Agent API](#2-agent-api)
3. [Command API](#3-command-api)
4. [Hook API](#4-hook-api)
5. [Configuration API](#5-configuration-api)
6. [Integration API](#6-integration-api)
7. [Type Definitions](#7-type-definitions)
8. [Error Codes](#8-error-codes)

---

## 1. MCP Tools API

### 1.1 stm32_build

Build STM32N6 project using GCC ARM toolchain.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "projectPath": {
      "type": "string",
      "description": "Path to STM32CubeIDE or Makefile project"
    },
    "buildType": {
      "type": "string",
      "enum": ["Debug", "Release", "MinSizeRel"],
      "default": "Debug"
    },
    "target": {
      "type": "string",
      "description": "Build target (all, clean, specific binary)",
      "default": "all"
    },
    "verbose": {
      "type": "boolean",
      "default": false
    },
    "clean": {
      "type": "boolean",
      "default": false
    }
  },
  "required": ["projectPath"]
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "output": { "type": "string" },
    "binaryPath": { "type": "string" },
    "errors": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "file": { "type": "string" },
          "line": { "type": "integer" },
          "column": { "type": "integer" },
          "message": { "type": "string" },
          "code": { "type": "string" }
        }
      }
    },
    "warnings": {
      "type": "array",
      "items": { "$ref": "#/properties/errors/items" }
    },
    "sizeReport": {
      "type": "object",
      "properties": {
        "text": { "type": "integer" },
        "data": { "type": "integer" },
        "bss": { "type": "integer" },
        "flash": { "type": "integer" },
        "ram": { "type": "integer" }
      }
    }
  }
}
```

#### Example

```json
// Request
{
  "projectPath": "/home/user/my_project",
  "buildType": "Debug",
  "verbose": true
}

// Response
{
  "success": true,
  "output": "Build finished: 0 errors, 2 warnings",
  "binaryPath": "/home/user/my_project/Debug/my_project.elf",
  "errors": [],
  "warnings": [
    {
      "file": "main.c",
      "line": 42,
      "column": 5,
      "message": "unused variable 'temp'",
      "code": "W001"
    }
  ],
  "sizeReport": {
    "text": 45678,
    "data": 1024,
    "bss": 8192,
    "flash": 46702,
    "ram": 9216
  }
}
```

---

### 1.2 stm32_flash

Program target device via ST-Link/J-Link.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "binaryPath": {
      "type": "string",
      "description": "Path to binary file (.elf, .bin, .hex)"
    },
    "address": {
      "type": "string",
      "description": "Flash address (hex)",
      "default": "0x08000000"
    },
    "probe": {
      "type": "string",
      "enum": ["stlink", "jlink", "ulink"],
      "default": "stlink"
    },
    "interface": {
      "type": "string",
      "enum": ["swd", "jtag"],
      "default": "swd"
    },
    "verify": {
      "type": "boolean",
      "default": true
    },
    "reset": {
      "type": "boolean",
      "default": true
    },
    "eraseType": {
      "type": "string",
      "enum": ["full", "sector", "none"],
      "default": "sector"
    }
  },
  "required": ["binaryPath"]
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "bytesWritten": { "type": "integer" },
    "duration": { "type": "number" },
    "verified": { "type": "boolean" },
    "targetInfo": {
      "type": "object",
      "properties": {
        "chipId": { "type": "string" },
        "flashSize": { "type": "integer" },
        "ramSize": { "type": "integer" }
      }
    }
  }
}
```

#### Example

```json
// Request
{
  "binaryPath": "/home/user/project/Debug/project.elf",
  "probe": "stlink",
  "verify": true,
  "reset": true
}

// Response
{
  "success": true,
  "bytesWritten": 46702,
  "duration": 1.234,
  "verified": true,
  "targetInfo": {
    "chipId": "STM32N6570",
    "flashSize": 2097152,
    "ramSize": 4404019
  }
}
```

---

### 1.3 stm32_debug

Start GDB debug session with target.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "elfPath": {
      "type": "string",
      "description": "Path to ELF file with debug symbols"
    },
    "probe": {
      "type": "string",
      "enum": ["stlink", "jlink", "ulink"],
      "default": "stlink"
    },
    "interface": {
      "type": "string",
      "enum": ["swd", "jtag"],
      "default": "swd"
    },
    "speed": {
      "type": "integer",
      "description": "Debug speed in kHz",
      "default": 4000
    },
    "swv": {
      "type": "boolean",
      "description": "Enable Serial Wire Viewer",
      "default": false
    },
    "swvSpeed": {
      "type": "integer",
      "description": "SWV speed in kHz",
      "default": 2000
    },
    "rtosAwareness": {
      "type": "string",
      "enum": ["none", "freertos", "threadx"],
      "default": "none"
    },
    "initCommands": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Additional GDB init commands"
    }
  },
  "required": ["elfPath"]
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "sessionId": { "type": "string" },
    "gdbPort": { "type": "integer" },
    "telnetPort": { "type": "integer" },
    "targetStatus": {
      "type": "string",
      "enum": ["halted", "running", "reset"]
    },
    "message": { "type": "string" }
  }
}
```

---

### 1.4 peripheral_config

Generate peripheral initialization code.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "peripheral": {
      "type": "string",
      "enum": ["I2C1", "I2C2", "I2C3", "SPI1", "SPI2", "SPI3", "USART1", "USART2", "USART3", "CAN", "CANFD", "ETH", "DSI", "CSI", "ADC1", "ADC2", "DAC", "TIM1", "TIM2", "TIM3"]
    },
    "mode": {
      "type": "string",
      "description": "Operating mode (master, slave, tx, rx, etc.)"
    },
    "config": {
      "type": "object",
      "description": "Peripheral-specific configuration",
      "additionalProperties": true
    },
    "outputPath": {
      "type": "string",
      "description": "Output directory for generated files"
    },
    "useDma": {
      "type": "boolean",
      "default": true
    },
    "useInterrupts": {
      "type": "boolean",
      "default": true
    },
    "driverType": {
      "type": "string",
      "enum": ["HAL", "LL"],
      "default": "HAL"
    },
    "generateExample": {
      "type": "boolean",
      "default": true
    }
  },
  "required": ["peripheral", "mode", "config"]
}
```

#### I2C Config Example

```json
{
  "peripheral": "I2C1",
  "mode": "master",
  "config": {
    "clockSpeed": 400000,
    "addressingMode": "7bit",
    "dualAddress": false,
    "generalCall": false,
    "noStretchMode": false
  },
  "outputPath": "/home/user/project/Core/Src",
  "useDma": true,
  "useInterrupts": true,
  "driverType": "HAL"
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "files": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "path": { "type": "string" },
          "type": { "enum": ["header", "source", "example"] }
        }
      }
    },
    "pinConfig": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "pin": { "type": "string" },
          "mode": { "type": "string" },
          "alternate": { "type": "integer" },
          "pull": { "type": "string" }
        }
      }
    },
    "dmaConfig": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "stream": { "type": "string" },
          "channel": { "type": "integer" },
          "direction": { "type": "string" }
        }
      }
    },
    "interruptConfig": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "irq": { "type": "string" },
          "priority": { "type": "integer" },
          "subPriority": { "type": "integer" }
        }
      }
    }
  }
}
```

---

### 1.5 clock_config

Generate clock tree configuration code.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "sysclk": {
      "type": "integer",
      "description": "Target system clock frequency in Hz (max 800000000)"
    },
    "source": {
      "type": "string",
      "enum": ["HSI", "HSE", "PLL"],
      "default": "PLL"
    },
    "hseFrequency": {
      "type": "integer",
      "description": "HSE frequency in Hz (if using external crystal)"
    },
    "pllConfig": {
      "type": "object",
      "properties": {
        "m": { "type": "integer" },
        "n": { "type": "integer" },
        "p": { "type": "integer" },
        "q": { "type": "integer" },
        "r": { "type": "integer" }
      }
    },
    "busPrescalers": {
      "type": "object",
      "properties": {
        "ahb": { "type": "integer" },
        "apb1": { "type": "integer" },
        "apb2": { "type": "integer" },
        "apb3": { "type": "integer" }
      }
    },
    "outputPath": {
      "type": "string",
      "description": "Output directory"
    }
  },
  "required": ["sysclk"]
}
```

#### Example

```json
{
  "sysclk": 800000000,
  "source": "PLL",
  "hseFrequency": 25000000,
  "pllConfig": {
    "m": 5,
    "n": 160,
    "p": 2,
    "q": 2,
    "r": 2
  },
  "busPrescalers": {
    "ahb": 1,
    "apb1": 4,
    "apb2": 2,
    "apb3": 2
  }
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "frequencies": {
      "type": "object",
      "properties": {
        "sysclk": { "type": "integer" },
        "hclk": { "type": "integer" },
        "pclk1": { "type": "integer" },
        "pclk2": { "type": "integer" }
      }
    },
    "files": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "path": { "type": "string" },
          "content": { "type": "string" }
        }
      }
    },
    "warnings": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

---

### 1.6 model_convert

Convert ML models for STM32N6 Neural-ART deployment.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "inputModel": {
      "type": "string",
      "description": "Path to input model file"
    },
    "inputFormat": {
      "type": "string",
      "enum": ["onnx", "tflite", "pytorch", "keras"]
    },
    "outputPath": {
      "type": "string",
      "description": "Output directory"
    },
    "outputFormat": {
      "type": "string",
      "enum": ["stedgeai", "tflite_micro"],
      "default": "stedgeai"
    },
    "targetDevice": {
      "type": "string",
      "default": "STM32N6570"
    },
    "optimizeFor": {
      "type": "string",
      "enum": ["latency", "memory", "balanced"],
      "default": "balanced"
    },
    "useCloud": {
      "type": "boolean",
      "description": "Use ST Edge AI Developer Cloud",
      "default": false
    }
  },
  "required": ["inputModel", "inputFormat"]
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "outputPath": { "type": "string" },
    "modelInfo": {
      "type": "object",
      "properties": {
        "inputShape": {
          "type": "array",
          "items": { "type": "integer" }
        },
        "outputShape": {
          "type": "array",
          "items": { "type": "integer" }
        },
        "parameterCount": { "type": "integer" },
        "macOperations": { "type": "integer" },
        "supportedOperators": {
          "type": "array",
          "items": { "type": "string" }
        },
        "unsupportedOperators": {
          "type": "array",
          "items": { "type": "string" }
        }
      }
    },
    "memoryEstimate": {
      "type": "object",
      "properties": {
        "weightsRAM": { "type": "integer" },
        "activationsRAM": { "type": "integer" },
        "totalRAM": { "type": "integer" },
        "flash": { "type": "integer" }
      }
    },
    "report": {
      "type": "object",
      "properties": {
        "path": { "type": "string" },
        "summary": { "type": "string" }
      }
    }
  }
}
```

---

### 1.7 model_quantize

Quantize models for efficient Neural-ART execution.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "inputModel": {
      "type": "string",
      "description": "Path to converted model"
    },
    "outputPath": {
      "type": "string",
      "description": "Output path for quantized model"
    },
    "quantizationScheme": {
      "type": "string",
      "enum": ["int8", "int4", "mixed", "fp16"],
      "default": "int8"
    },
    "calibrationData": {
      "type": "string",
      "description": "Path to calibration dataset (numpy .npy file)"
    },
    "calibrationSamples": {
      "type": "integer",
      "default": 100,
      "description": "Number of calibration samples to use"
    },
    "evaluateAccuracy": {
      "type": "boolean",
      "default": true
    },
    "evaluationData": {
      "type": "string",
      "description": "Path to evaluation dataset"
    },
    "targetAccuracy": {
      "type": "number",
      "description": "Target accuracy threshold (0-1)"
    }
  },
  "required": ["inputModel", "quantizationScheme"]
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "outputPath": { "type": "string" },
    "quantizationReport": {
      "type": "object",
      "properties": {
        "originalSize": { "type": "integer" },
        "quantizedSize": { "type": "integer" },
        "compressionRatio": { "type": "number" },
        "estimatedLatency": {
          "type": "number",
          "description": "Estimated inference time in ms"
        },
        "accuracyMetrics": {
          "type": "object",
          "properties": {
            "originalAccuracy": { "type": "number" },
            "quantizedAccuracy": { "type": "number" },
            "accuracyDrop": { "type": "number" }
          }
        }
      }
    },
    "layerAnalysis": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "layer": { "type": "string" },
          "type": { "type": "string" },
          "originalSize": { "type": "integer" },
          "quantizedSize": { "type": "integer" },
          "dynamicRange": { "type": "array" }
        }
      }
    }
  }
}
```

---

### 1.8 trace_analyze

Analyze SWV/ETM trace data.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "traceFile": {
      "type": "string",
      "description": "Path to trace capture file"
    },
    "analysisType": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["timing", "coverage", "exceptions", "data", "pc-sampling", "itm"]
      }
    },
    "elfFile": {
      "type": "string",
      "description": "ELF file for symbol resolution"
    },
    "timeRange": {
      "type": "object",
      "properties": {
        "start": { "type": "number" },
        "end": { "type": "number" }
      }
    },
    "outputFormat": {
      "type": "string",
      "enum": ["json", "html", "csv"],
      "default": "json"
    }
  },
  "required": ["traceFile", "analysisType"]
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "analysisReport": {
      "type": "object",
      "properties": {
        "duration": { "type": "number" },
        "totalInstructions": { "type": "integer" },
        "timing": {
          "type": "object",
          "properties": {
            "functions": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "name": { "type": "string" },
                  "totalTime": { "type": "number" },
                  "callCount": { "type": "integer" },
                  "avgTime": { "type": "number" }
                }
              }
            }
          }
        },
        "coverage": {
          "type": "object",
          "properties": {
            "lineCoverage": { "type": "number" },
            "functionCoverage": { "type": "number" },
            "uncoveredFunctions": {
              "type": "array",
              "items": { "type": "string" }
            }
          }
        },
        "exceptions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "type": { "type": "string" },
              "timestamp": { "type": "number" },
              "address": { "type": "string" }
            }
          }
        }
      }
    },
    "visualizations": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "type": { "type": "string" },
          "path": { "type": "string" }
        }
      }
    },
    "recommendations": {
      "type": "array",
      "items": { "type": "string" }
    }
  }
}
```

---

### 1.9 register_inspect

Read or write peripheral registers on connected target.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "action": {
      "type": "string",
      "enum": ["read", "write", "modify", "read_all"]
    },
    "peripheral": {
      "type": "string",
      "description": "Peripheral name (e.g., I2C1, GPIOA, RCC)"
    },
    "register": {
      "type": "string",
      "description": "Register name or offset (e.g., CR1, 0x00)"
    },
    "value": {
      "type": "integer",
      "description": "Value to write (for write/modify)"
    },
    "mask": {
      "type": "integer",
      "description": "Bit mask for modify operation"
    },
    "sessionId": {
      "type": "string",
      "description": "Debug session ID (optional, uses active session)"
    }
  },
  "required": ["action", "peripheral", "register"]
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "value": { "type": "integer" },
    "hexValue": { "type": "string" },
    "binaryValue": { "type": "string" },
    "bits": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "position": { "type": "string" },
          "value": { "type": "integer" },
          "description": { "type": "string" }
        }
      }
    },
    "description": { "type": "string" }
  }
}
```

#### Example

```json
// Request - Read I2C1 SR1 register
{
  "action": "read",
  "peripheral": "I2C1",
  "register": "SR1"
}

// Response
{
  "success": true,
  "value": 1,
  "hexValue": "0x0001",
  "binaryValue": "0b0000000000000001",
  "bits": [
    { "name": "SB", "position": "0", "value": 1, "description": "Start bit" },
    { "name": "ADDR", "position": "1", "value": 0, "description": "Address sent" },
    { "name": "BTF", "position": "2", "value": 0, "description": "Byte transfer finished" }
  ],
  "description": "Status Register 1"
}
```

---

### 1.10 memory_map

Generate memory map visualization and analysis.

#### Input Schema

```json
{
  "type": "object",
  "properties": {
    "elfPath": {
      "type": "string",
      "description": "Path to ELF file"
    },
    "mapPath": {
      "type": "string",
      "description": "Path to linker map file (alternative)"
    },
    "analysisType": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["sections", "symbols", "peripheral", "usage"]
      },
      "default": ["sections", "usage"]
    },
    "outputFormat": {
      "type": "string",
      "enum": ["json", "svg", "html"],
      "default": "json"
    }
  }
}
```

#### Output Schema

```json
{
  "type": "object",
  "properties": {
    "success": { "type": "boolean" },
    "sections": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "address": { "type": "string" },
          "size": { "type": "integer" },
          "type": { "type": "string" }
        }
      }
    },
    "memoryUsage": {
      "type": "object",
      "properties": {
        "flash": {
          "type": "object",
          "properties": {
            "used": { "type": "integer" },
            "total": { "type": "integer" },
            "percentage": { "type": "number" }
          }
        },
        "ram": {
          "type": "object",
          "properties": {
            "used": { "type": "integer" },
            "total": { "type": "integer" },
            "percentage": { "type": "number" }
          }
        }
      }
    },
    "largestSymbols": {
      "type": "array",
      "items": {
        "type": "object",
        "properties": {
          "name": { "type": "string" },
          "size": { "type": "integer" },
          "section": { "type": "string" }
        }
      }
    },
    "visualizationPath": { "type": "string" }
  }
}
```

---

## 2. Agent API

### 2.1 Agent Base Interface

```typescript
interface Agent {
  readonly name: string;
  readonly description: string;
  readonly capabilities: string[];
  readonly expertise: string[];

  execute(input: AgentInput, context: AgentContext): Promise<AgentResult>;
}
```

### 2.2 Agent Input

```typescript
interface AgentInput {
  task: string;
  parameters?: Record<string, unknown>;
  constraints?: {
    timeout?: number;
    maxOutputSize?: number;
  };
}
```

### 2.3 Agent Context

```typescript
interface AgentContext {
  projectPath: string;
  config: STM32N6Config;
  toolRegistry: ToolRegistry;
  logger: Logger;
  previousResults?: Map<string, unknown>;
}
```

### 2.4 Agent Result

```typescript
interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  recommendations?: string[];
  nextSteps?: string[];
  files?: GeneratedFile[];
  errors?: AgentError[];
}

interface GeneratedFile {
  path: string;
  content: string;
  type: 'source' | 'header' | 'config' | 'documentation';
}

interface AgentError {
  code: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}
```

### 2.5 Available Agents

| Agent Name | Capabilities |
|------------|-------------|
| `project-lead` | Workflow orchestration, task coordination |
| `stm32-architect` | System design, memory layout, clock config |
| `driver-developer` | I2C, SPI, CAN, DSI, CSI, Ethernet drivers |
| `ai-engineer` | Model conversion, quantization, NPU programming |
| `rtos-specialist` | FreeRTOS tasks, queues, synchronization |
| `debug-engineer` | GDB, SWV, trace analysis, hard fault debug |
| `test-engineer` | Unity tests, CMock, coverage, HIL testing |

### 2.6 Agent Selection

```typescript
// Agent selection based on task keywords
const agentKeywords: Record<string, string[]> = {
  'stm32-architect': ['memory', 'clock', 'boot', 'architecture', 'layout'],
  'driver-developer': ['i2c', 'spi', 'can', 'ethernet', 'driver', 'peripheral'],
  'ai-engineer': ['model', 'neural', 'quantize', 'npu', 'inference', 'ai'],
  'rtos-specialist': ['freertos', 'task', 'queue', 'semaphore', 'rtos'],
  'debug-engineer': ['debug', 'breakpoint', 'trace', 'fault', 'gdb'],
  'test-engineer': ['test', 'unit', 'mock', 'coverage', 'verify'],
};
```

---

## 3. Command API

### 3.1 Command Interface

```typescript
interface Command {
  name: string;
  description: string;
  usage: string;
  arguments: CommandArgument[];
  options: CommandOption[];
  execute(args: string[], options: Record<string, unknown>): Promise<CommandResult>;
}

interface CommandArgument {
  name: string;
  description: string;
  required: boolean;
  type: 'string' | 'number' | 'boolean';
}

interface CommandOption {
  name: string;
  alias?: string;
  description: string;
  type: 'string' | 'number' | 'boolean';
  default?: unknown;
}
```

### 3.2 Available Commands

| Command | Description | Arguments |
|---------|-------------|-----------|
| `/build` | Build project | `[build_type]` |
| `/debug` | Start debug session | `[elf_path]` |
| `/flash` | Program target | `[binary_path]` |
| `/peripheral` | Configure peripheral | `<name> <mode>` |
| `/clock` | Configure clock tree | `[frequency]` |
| `/model` | ML model operations | `<action> <model>` |
| `/test` | Run tests | `[target]` |
| `/analyze` | Analyze performance | `<type>` |

### 3.3 Command Result

```typescript
interface CommandResult {
  success: boolean;
  output: string;
  data?: unknown;
  nextActions?: string[];
  error?: {
    code: string;
    message: string;
    suggestions: string[];
  };
}
```

---

## 4. Hook API

### 4.1 Hook Interface

```typescript
interface Hook {
  name: string;
  timing: 'pre' | 'post';
  trigger: 'tool' | 'command' | 'agent';
  target: string | RegExp;
  priority: number;
  handler: (context: HookContext) => Promise<HookResult>;
}

interface HookContext {
  params: Record<string, unknown>;
  result?: unknown;
  environment: Record<string, string>;
  projectPath: string;
}

interface HookResult {
  proceed: boolean;
  error?: string;
  suggestions?: string[];
  modifiedParams?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}
```

### 4.2 Built-in Hooks

| Hook | Timing | Trigger | Description |
|------|--------|---------|-------------|
| `validate_project` | pre | stm32_build | Validate project structure |
| `check_target_connection` | pre | stm32_flash | Verify debug probe connection |
| `backup_config` | pre | peripheral_config | Save current configuration |
| `analyze_build_output` | post | stm32_build | Parse build warnings/errors |
| `log_flash_result` | post | stm32_flash | Log flash statistics |
| `update_memory_map` | post | stm32_build | Update memory usage |

---

## 5. Configuration API

### 5.1 Configuration Schema

```typescript
interface STM32N6Config {
  server: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    timeout: number;
  };
  toolchain: {
    stm32cubeIdePath?: string;
    gccArmPath?: string;
    stm32cubeProgPath?: string;
    stEdgeAiPath?: string;
    openocdPath?: string;
  };
  target: {
    mcu: string;
    board: string;
    flashBase: string;
    ramBase: string;
  };
  debug: {
    probe: 'stlink' | 'jlink' | 'ulink';
    interface: 'swd' | 'jtag';
    speed: number;
    swoEnabled: boolean;
  };
  build: {
    defaultBuildType: 'Debug' | 'Release' | 'MinSizeRel';
    parallelJobs: number;
    warningsAsErrors: boolean;
  };
  edgeAi: {
    developerCloudApi?: string;
    defaultQuantization: 'int8' | 'int4' | 'mixed';
    optimizeFor: 'latency' | 'memory' | 'balanced';
  };
}
```

### 5.2 Configuration Manager API

```typescript
class ConfigManager {
  // Get configuration value
  get<K extends keyof STM32N6Config>(key: K): STM32N6Config[K];

  // Set configuration value
  set<K extends keyof STM32N6Config>(key: K, value: STM32N6Config[K]): void;

  // Load configuration from file
  load(path: string): Promise<void>;

  // Save configuration to file
  save(path: string): Promise<void>;

  // Validate configuration
  validate(): ValidationResult;

  // Get all configuration
  getAll(): STM32N6Config;
}
```

---

## 6. Integration API

### 6.1 STM32CubeIDE Integration

```typescript
interface STM32CubeIDEAPI {
  importProject(projectPath: string): Promise<ImportResult>;
  buildProject(projectName: string, config: string): Promise<BuildResult>;
  detectInstallation(): Promise<string | null>;
  getVersion(): Promise<string>;
}
```

### 6.2 ST Edge AI Integration

```typescript
interface STEdgeAIAPI {
  convertModel(params: ConvertParams): Promise<ConvertResult>;
  quantizeModel(params: QuantizeParams): Promise<QuantizeResult>;
  analyzeModel(modelPath: string): Promise<ModelAnalysis>;
  estimatePerformance(modelPath: string): Promise<PerformanceEstimate>;
}
```

### 6.3 STM32CubeProgrammer Integration

```typescript
interface STM32CubeProgrammerAPI {
  connect(options: ConnectOptions): Promise<ConnectResult>;
  flash(binaryPath: string, options: FlashOptions): Promise<FlashResult>;
  read(address: string, size: number): Promise<Buffer>;
  write(address: string, data: Buffer): Promise<void>;
  readRegister(peripheral: string, register: string): Promise<number>;
  writeRegister(peripheral: string, register: string, value: number): Promise<void>;
  erase(type: 'full' | 'sector', address?: string): Promise<void>;
  getTargetInfo(): Promise<TargetInfo>;
}
```

### 6.4 OpenOCD Integration

```typescript
interface OpenOCDAPI {
  startGDBServer(options: GDBServerOptions): Promise<GDBServerResult>;
  stopGDBServer(): Promise<void>;
  executeCommand(command: string): Promise<string>;
  configureInterface(probe: string, interface: string): Promise<void>;
}
```

---

## 7. Type Definitions

### 7.1 Common Types

```typescript
// Build types
type BuildType = 'Debug' | 'Release' | 'MinSizeRel';

// Debug probe types
type DebugProbe = 'stlink' | 'jlink' | 'ulink';
type DebugInterface = 'swd' | 'jtag';

// Peripheral types
type PeripheralType =
  | 'I2C' | 'SPI' | 'USART' | 'CAN' | 'CANFD'
  | 'ETH' | 'DSI' | 'CSI' | 'ADC' | 'DAC' | 'TIM';

// Model formats
type ModelFormat = 'onnx' | 'tflite' | 'pytorch' | 'keras';
type QuantizationScheme = 'int8' | 'int4' | 'mixed' | 'fp16';

// Driver types
type DriverType = 'HAL' | 'LL';
```

### 7.2 Result Types

```typescript
interface SuccessResult<T> {
  success: true;
  data: T;
}

interface ErrorResult {
  success: false;
  error: {
    code: string;
    message: string;
    category: ErrorCategory;
    suggestions?: string[];
  };
}

type Result<T> = SuccessResult<T> | ErrorResult;
```

---

## 8. Error Codes

### 8.1 Error Categories

| Category | Code Range | Description |
|----------|------------|-------------|
| Validation | 1000-1999 | Input validation errors |
| Toolchain | 2000-2999 | Tool not found, version errors |
| Build | 3000-3999 | Compilation, linking errors |
| Connection | 4000-4999 | Debug probe, network errors |
| Integration | 5000-5999 | External tool errors |
| Internal | 9000-9999 | Plugin internal errors |

### 8.2 Common Error Codes

| Code | Name | Description | Resolution |
|------|------|-------------|------------|
| 1001 | INVALID_PATH | Path does not exist | Check path validity |
| 1002 | INVALID_PERIPHERAL | Unknown peripheral name | Use valid peripheral |
| 2001 | TOOLCHAIN_NOT_FOUND | GCC ARM not found | Install toolchain |
| 2002 | IDE_NOT_FOUND | STM32CubeIDE not found | Install IDE |
| 3001 | COMPILATION_ERROR | Build failed | Check error messages |
| 3002 | LINKER_ERROR | Linking failed | Check memory layout |
| 4001 | PROBE_NOT_FOUND | Debug probe not detected | Connect probe |
| 4002 | TARGET_NOT_RESPONDING | Target not responding | Reset target |
| 5001 | ST_EDGE_AI_ERROR | ST Edge AI tool failed | Check model format |
| 5002 | OPENOCD_ERROR | OpenOCD failed | Check configuration |
| 9001 | INTERNAL_ERROR | Internal plugin error | Report issue |

### 8.3 Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "3001",
    "name": "COMPILATION_ERROR",
    "category": "build",
    "message": "Build failed with 3 errors",
    "details": {
      "errors": [
        {
          "file": "main.c",
          "line": 42,
          "message": "undefined reference to 'foo'"
        }
      ]
    },
    "suggestions": [
      "Check that function 'foo' is defined",
      "Verify all source files are included in build"
    ],
    "documentation": "https://docs.example.com/errors/3001"
  }
}
```

---

*Document Status: Phase 2 - Architecture Design*
*Next Phase: Implementation Planning*
