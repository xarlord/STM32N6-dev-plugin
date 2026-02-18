# STM32N6-Dev-Team Plugin - Detailed Requirements Specification

**Document Version:** 1.0
**Date:** 2026-02-18
**Status:** Phase 1 - Requirements Generation

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [STM32N6570-DK Technical Overview](#2-stm32n6570-dk-technical-overview)
3. [Plugin Architecture Requirements](#3-plugin-architecture-requirements)
4. [Agent Definitions](#4-agent-definitions)
5. [Tool Specifications](#5-tool-specifications)
6. [Command Specifications](#6-command-specifications)
7. [Skill Specifications](#7-skill-specifications)
8. [Hook Definitions](#8-hook-definitions)
9. [Integration Points](#9-integration-points)
10. [Board Support Package (BSP)](#10-board-support-package-bsp)
11. [File System Support](#11-file-system-support)
12. [Quality Requirements](#12-quality-requirements)
13. [Implementation Phases](#13-implementation-phases)

---

## 1. Executive Summary

### 1.1 Purpose

The STM32N6-Dev-Team plugin provides specialized Claude Code capabilities for developing software on the STM32N6570-DK evaluation board. It combines embedded systems expertise, AI/ML workflow support, and hardware-specific knowledge to accelerate STM32N6 development.

### 1.2 Scope

| Area | Coverage |
|------|----------|
| **Target Hardware** | STM32N6570-DK evaluation board |
| **Processing Units** | Cortex-M55 (CPU), Neural-ART (NPU), NeoChrom (GPU) |
| **Peripherals** | I2C, DSI, CSI, Ethernet, CAN bus |
| **Software Stack** | FreeRTOS, STM32CubeN6, ST Edge AI Suite |
| **Languages** | C, C++, Python (for tooling) |
| **Toolchain** | GCC ARM, STM32CubeIDE |

### 1.3 Key Features

- Specialized agents for CPU/NPU/GPU development
- Peripheral driver code generation and debugging
- ML model deployment pipeline support
- Hardware debugging integration
- Reference architecture templates

---

## 2. STM32N6570-DK Technical Overview

### 2.1 Hardware Specifications

Based on STMicroelectronics official documentation:

| Component | Specification |
|-----------|--------------|
| **CPU Core** | ARM Cortex-M55 @ 800 MHz |
| **NPU** | ST Neural-ART Accelerator @ 1 GHz (up to 600 GOPS) |
| **GPU** | NeoChrom Accelerator (graphics) |
| **DSP** | ARM Helium vector processing |
| **RAM** | 4.2 Mbytes contiguous embedded RAM |
| **External Memory** | Hexa-SPI, OCTOSPI, FMC |
| **Video** | H.264 hardware encoder, MIPI CSI-2, ISP |
| **Security** | SESIP Level 3, PSA Level 3 target |
| **Packages** | 169 to 264 pins, 0.4-0.8mm pitch |
| **Temperature** | Up to 125C ambient |

### 2.2 Product Lines

| Line | Features |
|------|----------|
| **STM32N6x7 (AI Line)** | Neural-ART, 4.2MB RAM, graphics accelerators, ISP, camera interfaces |
| **STM32N6x5 (GP Line)** | 4.2MB RAM, graphics accelerators, ISP, camera interfaces (no NPU) |

### 2.3 Key Peripherals

```
Peripheral Matrix:
+------------------+-------------------+------------------+
| Interface        | Type              | Use Case         |
+------------------+-------------------+------------------+
| MIPI CSI-2       | Camera Serial     | Vision/AI input  |
| DSI              | Display Serial    | LCD displays     |
| I2C (multiple)   | Serial Bus        | Sensors, EEPROM  |
| Ethernet         | 10/100/1000       | Networking       |
| CAN FD           | Automotive Bus    | Motor control    |
| SPI/QuadSPI/OCTO | Serial Flash      | External memory  |
| FMC              | Parallel          | SDRAM, SRAM      |
| USB OTG          | USB 2.0           | Host/Device      |
+------------------+-------------------+------------------+
```

### 2.4 Development Tools Ecosystem

| Tool | Purpose |
|------|---------|
| **STM32CubeN6** | MCU embedded software package |
| **STM32CubeMX** | Configuration and code generation |
| **STM32CubeIDE** | Integrated development environment |
| **ST Edge AI Suite** | ML model deployment and optimization |
| **STM32CubeProgrammer** | Flash programming and debugging |
| **TouchGFX** | Graphics framework |

---

## 3. Plugin Architecture Requirements

### 3.1 Plugin Configuration Structure

The plugin will be configured through Claude Code's settings system using MCP (Model Context Protocol) for tool integration.

```json
{
  "mcpServers": {
    "stm32n6-dev": {
      "command": "stm32n6-dev-server",
      "args": [],
      "env": {
        "STM32CUBE_PATH": "${STM32Cube_installation_path}",
        "ST_EDGE_AI_PATH": "${STEdgeAI_installation_path}"
      }
    }
  }
}
```

### 3.2 Plugin Directory Structure

```
stm32n6-dev-team/
+-- .claude/
|   +-- commands/           # Custom slash commands
|   |   +-- build.md
|   |   +-- debug.md
|   |   +-- peripheral.md
|   |   +-- model-deploy.md
|   +-- CLAUDE.md           # Project context
+-- agents/
|   +-- project-lead.md
|   +-- stm32-architect.md
|   +-- driver-developer.md
|   +-- ai-engineer.md
|   +-- rtos-specialist.md
|   +-- debug-engineer.md
|   +-- test-engineer.md
+-- tools/
|   +-- mcp-server/         # MCP server implementation
|   |   +-- src/
|   |   +-- package.json
|   +-- cli-tools/
+-- templates/
|   +-- projects/
|   +-- drivers/
|   +-- rtos/
|   +-- ml-pipelines/
+-- docs/
    +-- requirements.md
    +-- architecture.md
    +-- api-reference.md
```

### 3.3 Technology Stack

| Layer | Technology |
|-------|------------|
| **MCP Server** | TypeScript/Node.js |
| **CLI Tools** | Python 3.10+ |
| **Templates** | Jinja2 / Handlebars |
| **Configuration** | YAML/JSON |

---

## 4. Agent Definitions

### 4.1 Agent Capability Matrix

| Agent | Primary Role | Expertise Areas |
|-------|-------------|-----------------|
| **Project Lead** | Workflow orchestration | DevFlow process, coordination |
| **STM32 Architect** | System design | Memory maps, boot sequences, HAL |
| **Driver Developer** | Peripheral code | I2C, SPI, CAN, DSI, CSI, Ethernet |
| **AI/ML Engineer** | Edge AI | Model quantization, NPU programming, ST Edge AI |
| **RTOS Specialist** | Real-time OS | FreeRTOS, task management, synchronization |
| **Debug Engineer** | Debugging | GDB, STM32CubeProgrammer, trace analysis |
| **Test Engineer** | Testing | Unit tests, integration tests, hardware-in-loop |

### 4.2 Detailed Agent Specifications

#### 4.2.1 STM32 Architect Agent

```yaml
name: stm32-architect
description: System and software architecture expert for STM32N6
capabilities:
  - Memory layout design (SRAM, Flash, external memory)
  - Boot sequence configuration
  - Clock tree optimization
  - Power management strategies
  - HAL/LL driver selection
  - Middleware integration
knowledge_base:
  - STM32CubeN6 reference manual
  - STM32N6 datasheet
  - ST reference designs
  - AN/application notes
tools:
  - memory_map_analyzer
  - clock_config_generator
  - pin_mux_validator
```

#### 4.2.2 Driver Developer Agent

```yaml
name: driver-developer
description: Peripheral driver development specialist
capabilities:
  - I2C master/slave driver development
  - DSI display driver integration
  - CSI camera interface configuration
  - Ethernet PHY management
  - CAN/CAN-FD communication
  - DMA configuration
  - Interrupt handling
code_patterns:
  - HAL-based drivers
  - LL (Low-Layer) optimization
  - DMA circular buffers
  - Interrupt-safe queues
templates:
  - i2c_driver_template.c
  - spi_driver_template.c
  - can_driver_template.c
  - ethernet_driver_template.c
```

#### 4.2.3 AI/ML Engineer Agent

```yaml
name: ai-engineer
description: Edge AI and Neural-ART NPU specialist
capabilities:
  - Model conversion for STM32N6
  - ST Edge AI Suite integration
  - Neural-ART accelerator programming
  - Model quantization (int8, int4)
  - Computer vision pipelines
  - ISP configuration
  - Camera interface setup
workflows:
  - model_training_to_deployment
  - quantization_optimization
  - performance_profiling
tools:
  - stedgeai_cli_wrapper
  - model_zoo_browser
  - quantization_analyzer
```

#### 4.2.4 RTOS Specialist Agent

```yaml
name: rtos-specialist
description: FreeRTOS and real-time systems expert
capabilities:
  - FreeRTOS task design
  - Priority assignment strategies
  - Inter-task communication
  - Resource management
  - Real-time scheduling analysis
  - Memory pool management
patterns:
  - Producer-consumer queues
  - Event-driven tasks
  - Priority inheritance
  - Stack overflow detection
templates:
  - freertos_config_template.h
  - task_template.c
  - queue_template.c
```

#### 4.2.5 Debug Engineer Agent

```yaml
name: debug-engineer
description: Hardware debugging and troubleshooting specialist
capabilities:
  - GDB debugging sessions
  - SWD/JTAG interface configuration
  - Serial Wire Viewer (SWV) usage
  - ETM trace analysis
  - Hard fault diagnosis
  - Memory corruption detection
  - Peripheral register inspection
tools:
  - stm32cube_programmer_cli
  - openocd_wrapper
  - gdb_dashboard
  - trace_analyzer
```

#### 4.2.6 Test Engineer Agent

```yaml
name: test-engineer
description: Embedded testing and validation specialist
capabilities:
  - Unity test framework
  - CMock mocking
  - Hardware-in-loop testing
  - Code coverage analysis
  - Static analysis integration
  - CI/CD pipeline setup
frameworks:
  - Unity
  - CMock
  - Ceedling
  - Gcov
tools:
  - test_generator
  - coverage_reporter
  - mock_generator
```

---

## 5. Tool Specifications

### 5.1 MCP Tools Overview

| Tool Name | Category | Description |
|-----------|----------|-------------|
| `stm32_build` | Build | Compile STM32 projects with GCC/STM32CubeIDE |
| `stm32_flash` | Deploy | Program target via ST-Link |
| `stm32_debug` | Debug | Start GDB debug session |
| `peripheral_config` | Code Gen | Generate peripheral initialization code |
| `clock_config` | Code Gen | Generate clock tree configuration |
| `model_convert` | AI/ML | Convert models for Neural-ART |
| `model_quantize` | AI/ML | Quantize models for deployment |
| `trace_analyze` | Debug | Analyze SWV/ETM traces |
| `register_inspect` | Debug | Read/write peripheral registers |
| `memory_map` | Analysis | Generate memory map visualization |

### 5.2 Detailed Tool Specifications

#### 5.2.1 stm32_build

```typescript
interface STM32BuildTool {
  name: "stm32_build";
  description: "Build STM32N6 project using GCC ARM toolchain";
  inputSchema: {
    type: "object";
    properties: {
      projectPath: {
        type: "string";
        description: "Path to STM32CubeIDE or Makefile project";
      };
      buildType: {
        type: "string";
        enum: ["Debug", "Release", "MinSizeRel"];
        default: "Debug";
      };
      target: {
        type: "string";
        description: "Build target (all, clean, specific binary)";
        default: "all";
      };
      verbose: {
        type: "boolean";
        default: false;
      };
    };
    required: ["projectPath"];
  };
  returns: {
    success: boolean;
    output: string;
    binaryPath?: string;
    errors?: BuildError[];
    warnings?: BuildWarning[];
    sizeReport?: MemoryUsage;
  };
}
```

#### 5.2.2 peripheral_config

```typescript
interface PeripheralConfigTool {
  name: "peripheral_config";
  description: "Generate peripheral initialization code for STM32N6";
  inputSchema: {
    type: "object";
    properties: {
      peripheral: {
        type: "string";
        enum: ["I2C1", "I2C2", "SPI1", "SPI2", "USART1", "CAN", "ETH", "DSI", "CSI"];
      };
      mode: {
        type: "string";
        description: "Operating mode (master/slave, etc.)";
      };
      config: {
        type: "object";
        description: "Peripheral-specific configuration";
      };
      useDma: {
        type: "boolean";
        default: true;
      };
      useInterrupts: {
        type: "boolean";
        default: true;
      };
      driverType: {
        type: "string";
        enum: ["HAL", "LL"];
        default: "HAL";
      };
    };
    required: ["peripheral", "mode", "config"];
  };
  returns: {
    headerCode: string;
    sourceCode: string;
    pinConfig: PinConfiguration[];
    dmaConfig?: DMAConfiguration[];
    interruptConfig?: InterruptConfiguration[];
  };
}
```

#### 5.2.3 model_convert

```typescript
interface ModelConvertTool {
  name: "model_convert";
  description: "Convert ML models for STM32N6 Neural-ART deployment";
  inputSchema: {
    type: "object";
    properties: {
      inputModel: {
        type: "string";
        description: "Path to input model (ONNX, TFLite, PyTorch)";
      };
      inputFormat: {
        type: "string";
        enum: ["onnx", "tflite", "pytorch", "keras"];
      };
      outputFormat: {
        type: "string";
        enum: ["stedgeai", "tflite_micro"];
        default: "stedgeai";
      };
      targetDevice: {
        type: "string";
        default: "STM32N6570";
      };
      optimizeFor: {
        type: "string";
        enum: ["latency", "memory", "balanced"];
        default: "balanced";
      };
    };
    required: ["inputModel", "inputFormat"];
  };
  returns: {
    outputPath: string;
    modelInfo: {
      inputShape: number[];
      outputShape: number[];
      parameterCount: number;
      estimatedRAM: number;
      estimatedFlash: number;
    };
    report: ConversionReport;
  };
}
```

#### 5.2.4 model_quantize

```typescript
interface ModelQuantizeTool {
  name: "model_quantize";
  description: "Quantize models for efficient Neural-ART execution";
  inputSchema: {
    type: "object";
    properties: {
      inputModel: {
        type: "string";
        description: "Path to converted model";
      };
      quantizationScheme: {
        type: "string";
        enum: ["int8", "int4", "mixed"];
        default: "int8";
      };
      calibrationData: {
        type: "string";
        description: "Path to calibration dataset";
      };
      calibrationSamples: {
        type: "number";
        default: 100;
      };
      evaluateAccuracy: {
        type: "boolean";
        default: true;
      };
    };
    required: ["inputModel", "quantizationScheme"];
  };
  returns: {
    outputPath: string;
    quantizationReport: {
      originalSize: number;
      quantizedSize: number;
      compressionRatio: number;
      estimatedLatency: number;
      accuracyMetrics?: AccuracyMetrics;
    };
  };
}
```

#### 5.2.5 register_inspect

```typescript
interface RegisterInspectTool {
  name: "register_inspect";
  description: "Read or write peripheral registers on connected target";
  inputSchema: {
    type: "object";
    properties: {
      action: {
        type: "string";
        enum: ["read", "write", "modify"];
      };
      peripheral: {
        type: "string";
        description: "Peripheral name (e.g., I2C1, GPIOA)";
      };
      register: {
        type: "string";
        description: "Register name or offset";
      };
      value?: {
        type: "number";
        description: "Value to write (for write/modify)";
      };
      mask?: {
        type: "number";
        description: "Bit mask for modify operation";
      };
    };
    required: ["action", "peripheral", "register"];
  };
  returns: {
    value: number;
    hexValue: string;
    bits: BitField[];
    description: string;
  };
}
```

#### 5.2.6 trace_analyze

```typescript
interface TraceAnalyzeTool {
  name: "trace_analyze";
  description: "Analyze SWV/ETM trace data for performance debugging";
  inputSchema: {
    type: "object";
    properties: {
      traceFile: {
        type: "string";
        description: "Path to trace capture file";
      };
      analysisType: {
        type: "array";
        items: {
          type: "string";
          enum: ["timing", "coverage", "exceptions", "data", "pc-sampling"];
        };
      };
      timeRange?: {
        type: "object";
        properties: {
          start: { type: "number" };
          end: { type: "number" };
        };
      };
    };
    required: ["traceFile", "analysisType"];
  };
  returns: {
    analysisReport: TraceAnalysisReport;
    visualizations: string[];
    recommendations: string[];
  };
}
```

---

## 6. Command Specifications

### 6.1 Custom Slash Commands

| Command | Description | Usage |
|---------|-------------|-------|
| `/build` | Build STM32 project | `/build [Debug|Release]` |
| `/debug` | Start debug session | `/debug [ELF_path]` |
| `/flash` | Program target | `/flash [binary_path]` |
| `/peripheral` | Configure peripheral | `/peripheral I2C1 master` |
| `/clock` | Configure clock tree | `/clock 800MHz` |
| `/model` | Deploy ML model | `/model deploy model.tflite` |
| `/test` | Run tests | `/test [target]` |
| `/analyze` | Analyze code/performance | `/analyze [memory|timing]` |

### 6.2 Command Implementation Details

#### 6.2.1 /build Command

```markdown
# /build - Build STM32N6 Project

## Description
Build the STM32N6 project using the configured toolchain.

## Usage
/build [build_type]

## Arguments
- build_type: Debug (default), Release, MinSizeRel

## Examples
/build                    # Build with Debug configuration
/build Release            # Build with Release configuration

## Workflow
1. Validate project structure
2. Check toolchain availability
3. Execute build command
4. Parse build output
5. Report results with size analysis

## Related Commands
- /flash: Flash the built binary
- /debug: Start debugging session
- /analyze: Analyze memory usage
```

#### 6.2.2 /peripheral Command

```markdown
# /peripheral - Configure Peripheral

## Description
Generate initialization code for STM32N6 peripherals.

## Usage
/peripheral <peripheral_name> <mode> [options]

## Arguments
- peripheral_name: I2C1, I2C2, SPI1, SPI2, USART1, CAN, ETH, DSI, CSI
- mode: master, slave, tx, rx, etc.
- options: dma, polling, interrupt

## Examples
/peripheral I2C1 master 400kHz dma
/peripheral SPI1 master interrupt
/peripheral CAN fd interrupt

## Generated Files
- peripheral_name_hal.c/h (HAL implementation)
- peripheral_name_config.h (Configuration header)

## Workflow
1. Parse peripheral requirements
2. Generate pin mux configuration
3. Create initialization code
4. Add DMA/Interrupt handlers if needed
5. Generate example usage code
```

#### 6.2.3 /model Command

```markdown
# /model - ML Model Deployment

## Description
Convert and deploy ML models for Neural-ART execution.

## Usage
/model <action> <model_path> [options]

## Actions
- convert: Convert model to ST Edge AI format
- quantize: Apply quantization for size optimization
- deploy: Deploy model to target
- profile: Profile model performance
- validate: Validate model accuracy

## Examples
/model convert model.onnx --format onnx --output model_stedgeai
/model quantize model.tflite --scheme int8 --calibrate data.npy
/model profile model_quantized.tflite --target STM32N6570

## Workflow
1. Load and validate input model
2. Convert to intermediate representation
3. Optimize for Neural-ART
4. Apply quantization if requested
5. Generate C code for deployment
6. Create inference wrapper
```

---

## 7. Skill Specifications

Skills are user-invocable capabilities that provide specialized workflows and automation. Similar to devflow-enforcer's skill system, these are defined as markdown files in the `.claude/skills/` directory.

### 7.1 Skills Overview

| Skill Name | Category | Description |
|------------|----------|-------------|
| `project-init` | Setup | Initialize new STM32N6 project with BSP |
| `driver-create` | Development | Generate peripheral driver from template |
| `rtos-setup` | RTOS | Configure FreeRTOS for project |
| `model-deploy` | AI/ML | Full ML model deployment workflow |
| `debug-session` | Debugging | Start comprehensive debug session |
| `test-generate` | Testing | Generate unit tests for module |
| `bsp-configure` | BSP | Configure Board Support Package |
| `filesystem-setup` | Storage | Set up file system on storage media |
| `clock-wizard` | Configuration | Interactive clock tree configuration |
| `pin-mux-wizard` | Configuration | Interactive pin mux configuration |
| `memory-optimizer` | Optimization | Analyze and optimize memory usage |
| `boot-sequence` | System | Configure boot sequence and options |
| `security-config` | Security | Configure security features |
| `power-profile` | Power | Create power consumption profile |
| `trace-capture` | Debugging | Capture and analyze trace data |

### 7.2 Detailed Skill Specifications

#### 7.2.1 project-init Skill

```markdown
# project-init - Initialize STM32N6 Project

## Purpose
Create a new STM32N6 project with proper structure, BSP integration, and initial configuration.

## Usage
/project-init <project_name> [options]

## Options
- --template: base | freertos | ai-ml | graphics | networking
- --bsp: Enable BSP integration (default: true)
- --ide: cubeide | makefile | cmake
- --mcu: STM32N6570 (default)

## Workflow
1. Create project directory structure
2. Copy STM32CubeN6 HAL/LL drivers
3. Initialize BSP for STM32N6570-DK
4. Generate startup code (system_stm32n6xx.c)
5. Create linker script for target
6. Set up build configuration
7. Generate main.c with basic initialization

## Output Structure
project_name/
├── Core/
│   ├── Inc/
│   ├── Src/
│   └── Startup/
├── Drivers/
│   ├── STM32N6xx_HAL_Driver/
│   └── BSP/
│       └── STM32N6570-DK/
├── Middlewares/
├── Project/
│   └── STM32CubeIDE/
└── .claude/
    └── CLAUDE.md
```

#### 7.2.2 driver-create Skill

```markdown
# driver-create - Generate Peripheral Driver

## Purpose
Generate peripheral driver code with HAL/LL abstraction, DMA support, and interrupt handling.

## Usage
/driver-create <peripheral> <mode> [options]

## Peripherals Supported
- I2C (master/slave, DMA/polling/interrupt)
- SPI (master/slave, DMA/polling/interrupt)
- UART/USART (DMA/polling/interrupt)
- CAN/CAN-FD (classic/FD mode)
- Ethernet (PHY management, LwIP integration)
- DSI (display configuration)
- CSI (camera interface)
- ADC (single/multi-channel, DMA)
- DAC (wave generation)
- TIM (PWM, input capture, encoder)

## Options
- --dma: Enable DMA support
- --interrupt: Enable interrupt handlers
- --rtos-safe: Make RTOS thread-safe
- --error-handling: Comprehensive error handling
- --template: minimal | full | production

## Generated Files
- <peripheral>_driver.h
- <peripheral>_driver.c
- <peripheral>_config.h
- <peripheral>_dma.c (if DMA enabled)
- <peripheral>_it.c (if interrupts enabled)
```

#### 7.2.3 rtos-setup Skill

```markdown
# rtos-setup - Configure FreeRTOS

## Purpose
Set up FreeRTOS with proper configuration for STM32N6 including memory allocation and task templates.

## Usage
/rtos-setup [options]

## Options
- --heap-model: heap_1 | heap_2 | heap_3 | heap_4 | heap_5
- --total-heap-size: Size in bytes (default: 128KB)
- --tick-rate: RTOS tick rate Hz (default: 1000)
- --max-priorities: Number of priorities (default: 7)
- --enable-stats: Enable runtime statistics
- --enable-trace: Enable trace recording

## Generated Components
1. FreeRTOSConfig.h - Configuration header
2. Task templates - Common task patterns
3. Queue wrappers - Thread-safe queues
4. Semaphore wrappers - Resource management
5. Timer templates - Software timers

## Task Templates
- sensor_task: Periodic sensor reading
- communication_task: UART/Ethernet handling
- processing_task: Data processing pipeline
- ai_inference_task: ML model inference
- display_task: GUI updates
```

#### 7.2.4 model-deploy Skill

```markdown
# model-deploy - Deploy ML Model

## Purpose
Complete workflow for deploying ML models to Neural-ART NPU.

## Usage
/model-deploy <model_path> [options]

## Options
- --framework: onnx | tflite | pytorch | keras
- --quantize: int8 | int4 | mixed | none
- --calibration-data: Path to calibration dataset
- --optimize: latency | memory | balanced
- --generate-c: Generate C inference code
- --validate: Validate on hardware

## Workflow Steps
1. Model Analysis
   - Input/output shape verification
   - Operator support check
   - Memory estimation

2. Model Conversion
   - Convert to ST Edge AI format
   - Optimize for Neural-ART
   - Generate intermediate representation

3. Quantization (if requested)
   - Calibration with provided data
   - Apply quantization scheme
   - Accuracy evaluation

4. Code Generation
   - Generate C/C++ inference code
   - Create model header/source files
   - Generate input/output buffers

5. Integration
   - Create inference API wrapper
   - Add to build system
   - Generate usage example

## Output Files
- Models/
  ├── model_name.h
  ├── model_name.c
  ├── model_name_data.c
  └── model_name_config.h
```

#### 7.2.5 debug-session Skill

```markdown
# debug-session - Start Debug Session

## Purpose
Launch comprehensive debugging session with GDB/OpenOCD integration.

## Usage
/debug-session [elf_path] [options]

## Options
- --probe: stlink | jlink | ulink
- --interface: swd | jtag
- --speed: Debug speed in kHz
- --swv: Enable Serial Wire Viewer
- --etm: Enable ETM trace
- --rtos: RTOS awareness (FreeRTOS)
- --script: Custom GDB script

## Features
1. Target Connection
   - Auto-detect debug probe
   - Configure debug interface
   - Halt on connect option

2. Breakpoint Management
   - Software breakpoints
   - Hardware breakpoints
   - Conditional breakpoints
   - Watchpoints

3. Memory Inspection
   - Memory dump
   - Peripheral register view
   - RTOS object inspection

4. Trace Features
   - ITM stimulus ports
   - SWV data trace
   - PC sampling
   - Exception tracing

5. RTOS Awareness
   - Task list
   - Stack usage per task
   - Queue/semaphore status
```

#### 7.2.6 bsp-configure Skill

```markdown
# bsp-configure - Configure Board Support Package

## Purpose
Configure and customize BSP components for STM32N6570-DK.

## Usage
/bsp-configure [component] [options]

## BSP Components
- leds: LED control (LED1, LED2, LED3)
- buttons: Button handling (USER, JOY_SEL)
- display: DSI display configuration
- camera: CSI camera interface
- sdcard: SD card interface
- ethernet: Ethernet PHY configuration
- audio: Audio codec (if available)
- qspi: QuadSPI flash memory
- hyperbus: HyperRAM/Flash

## Options
- --list: List available components
- --enable: Enable specific component
- --disable: Disable specific component
- --config: Show current configuration
- --drivers: Include driver initialization

## Generated Files
- bsp.c/h - BSP main interface
- bsp_<component>.c/h - Component-specific drivers
- bsp_conf.h - Configuration header
```

#### 7.2.7 filesystem-setup Skill

```markdown
# filesystem-setup - Set Up File System

## Purpose
Configure file system support (FATFS/LittleFS) on storage media.

## Usage
/filesystem-setup <storage_type> <fs_type> [options]

## Storage Types
- sdcard: SD card via SDMMC
- qspi: QuadSPI flash
- ospi: OctoSPI flash
- usb: USB mass storage
- ram: RAM disk

## File System Types
- fatfs: FAT/exFAT (FATFS by ChaN)
- littlefs: LittleFS (power-safe)
- lwext4: ext4 (advanced)

## Options
- --mount-point: Mount point (default: "/")
- --read-only: Mount read-only
- --format: Format on first mount
- --cache: Enable caching
- --long-filenames: Enable long filenames (FATFS)

## Generated Components
1. Low-level driver (diskio.c)
2. File system configuration
3. Mount/unmount functions
4. File operation wrappers
5. Example usage code
```

#### 7.2.8 clock-wizard Skill

```markdown
# clock-wizard - Clock Tree Configuration

## Purpose
Interactive configuration of STM32N6 clock tree.

## Usage
/clock-wizard [target_freq] [options]

## Options
- --sysclk: System clock frequency (max 800MHz)
- --ahb: AHB prescaler
- --apb1: APB1 clock frequency
- --apb2: APB2 clock frequency
- --pll-config: PLL configuration source
- --output: Generate code only (no interactive)

## Clock Domains
- SYSCLK: Main system clock
- AHB: High-speed bus
- APB1/APB2: Peripheral buses
- PLL1/PLL2/PLL3: PLL configurations
- Kernel clocks: Peripheral-specific

## Generated Files
- clock_config.c: Clock initialization
- clock_config.h: Configuration defines
```

### 7.3 Additional Skills

| Skill | Description |
|-------|-------------|
| `test-generate` | Generate Unity/CMock tests for C modules |
| `pin-mux-wizard` | Interactive GPIO/pin assignment tool |
| `memory-optimizer` | RAM/Flash usage analysis and optimization |
| `boot-sequence` | Configure boot options, vector table, etc. |
| `security-config` | Configure TrustZone, secure boot, keys |
| `power-profile` | Create low-power mode configurations |
| `trace-capture` | Capture SWV/ETM traces and analyze |
| `ethernet-setup` | Configure Ethernet + LwIP stack |
| `usb-device` | Configure USB device classes |
| `usb-host` | Configure USB host functionality |
| `display-setup` | Configure DSI display with TouchGFX |
| `camera-pipeline` | Set up CSI camera with ISP pipeline |

---

## 8. Hook Definitions

### 8.1 Pre-Tool Hooks

| Hook Name | Trigger | Action |
|-----------|---------|--------|
| `validate_project` | Before build | Check project structure |
| `check_target_connection` | Before debug/flash | Verify ST-Link connection |
| `backup_config` | Before peripheral change | Save current configuration |

### 8.2 Post-Tool Hooks

| Hook Name | Trigger | Action |
|-----------|---------|--------|
| `analyze_build_output` | After build | Parse warnings/errors |
| `log_flash_result` | After flash | Record flash statistics |
| `update_memory_map` | After build | Update memory usage display |

### 8.3 Workflow Hooks

| Hook Name | Trigger | Action |
|-----------|---------|--------|
| `on_project_create` | New project | Initialize structure |
| `on_peripheral_add` | Peripheral added | Update pin mux |
| `on_model_deploy` | Model deployed | Generate inference code |

---

## 9. Integration Points

### 8.1 STM32CubeIDE Integration

```yaml
integration:
  tool: STM32CubeIDE
  version: ">=1.15.0"
  features:
    - Project import/export
    - Build configuration sync
    - Debug session integration
    - Peripheral configuration import
  commands:
    import: "stm32cubeide --launcher.suppressErrors -nosplash -application org.eclipse.cdt.managedbuilder.core.headlessbuild -import {project_path}"
    build: "stm32cubeide --launcher.suppressErrors -nosplash -application org.eclipse.cdt.managedbuilder.core.headlessbuild -build {project_name}/{config}"
```

### 8.2 ST Edge AI Suite Integration

```yaml
integration:
  tool: ST_Edge_AI_Suite
  components:
    - ST Edge AI Core
    - ST Edge AI Developer Cloud
    - ST Edge AI Model Zoo
  features:
    - Model conversion
    - Quantization
    - Performance estimation
    - C code generation
  commands:
    convert: "stedgeai convert --model {input} --target STM32N6570 --output {output}"
    quantize: "stedgeai quantize --model {input} --scheme int8 --output {output}"
    analyze: "stedgeai analyze --model {input} --target STM32N6570"
```

### 8.3 STM32CubeProgrammer Integration

```yaml
integration:
  tool: STM32CubeProgrammer_CLI
  version: ">=2.15.0"
  features:
    - Flash programming
    - Debug connection management
    - Register access
    - Memory read/write
    - Option bytes configuration
  commands:
    connect: "STM32_Programmer_CLI -c port=SWD -q"
    flash: "STM32_Programmer_CLI -c port=SWD -w {binary} 0x08000000 -v -rst"
    read: "STM32_Programmer_CLI -c port=SWD -r {address} {size} {output}"
```

### 8.4 Debug Probe Integration

```yaml
supported_probes:
  - name: ST-Link
    versions: [V2, V3]
    features: [SWD, JTAG, SWV]
  - name: J-Link
    manufacturer: SEGGER
    features: [SWD, JTAG, SWO, ETM]
  - name: ULINKplus
    manufacturer: Keil
    features: [SWD, JTAG, SWV]

debug_config:
  interface: SWD
  speed: 4000kHz
  reset_mode: hardware
  swo_enable: true
  swo_speed: 2000kHz
```

---

## 10. Board Support Package (BSP)

### 10.1 BSP Overview

The Board Support Package provides hardware abstraction for the STM32N6570-DK evaluation board. This plugin provides expertise in configuring, customizing, and using the BSP.

### 10.2 BSP Components for STM32N6570-DK

```yaml
bsp_components:
  leds:
    count: 3
    names: [LED1, LED2, LED3]
    colors: [green, orange, red]
    pins: [PI0, PI1, PI2]

  buttons:
    user_button:
      name: USER
      pin: PC13
      active: low
    joystick:
      pins: [PC0, PC1, PC2, PC3, PC4]
      directions: [UP, DOWN, LEFT, RIGHT, SEL]

  display:
    type: DSI
    controller: "FT5336 or similar"
    resolution: "480x800"
    interface: MIPI_DSI
    touch: capacitive

  camera:
    type: CSI
    interface: MIPI_CSI2
    lanes: 2
    sensor: "Supported sensors list"
    max_resolution: "5MP"

  sd_card:
    interface: SDMMC1
    mode: 4-bit
    features:
      - SDHC/SDXC support
      - DMA transfers
      - Write protection detection

  ethernet:
    phy: LAN8742A
    interface: RMII
    speed: 10/100 Mbps
    features:
      - Auto-negotiation
      - Link detection
      - LwIP integration

  qspi_flash:
    type: Macronix MX25LM51245
    size: 512 Mbit
    mode: Quad/Octal SPI
    features:
      - Memory-mapped mode
      - XIP execution

  hyperbus:
    type: HyperRAM
    size: 64 Mbit
    features:
      - Memory-mapped
      - High-speed access
```

### 10.3 BSP API Expertise

```c
// LED Control API
int32_t BSP_LED_Init(Led_TypeDef Led);
int32_t BSP_LED_DeInit(Led_TypeDef Led);
int32_t BSP_LED_On(Led_TypeDef Led);
int32_t BSP_LED_Off(Led_TypeDef Led);
int32_t BSP_LED_Toggle(Led_TypeDef Led);
int32_t BSP_LED_GetState(Led_TypeDef Led);

// Button API
int32_t BSP_PB_Init(Button_TypeDef Button, ButtonMode_TypeDef ButtonMode);
int32_t BSP_PB_DeInit(Button_TypeDef Button);
int32_t BSP_PB_GetState(Button_TypeDef Button);
void    BSP_PB_Callback(Button_TypeDef Button);

// Display API
int32_t BSP_DISPLAY_Init(void);
int32_t BSP_DISPLAY_DeInit(void);
int32_t BSP_DISPLAY_DisplayOn(void);
int32_t BSP_DISPLAY_DisplayOff(void);
int32_t BSP_DISPLAY_SetBrightness(uint32_t Brightness);

// Touch Screen API
int32_t BSP_TS_Init(uint32_t Width, uint32_t Height);
int32_t BSP_TS_DeInit(void);
int32_t BSP_TS_GetState(TS_State_t *TS_State);
int32_t BSP_TS_GestureConfig(FunctionalState Config);

// SD Card API
int32_t BSP_SD_Init(void);
int32_t BSP_SD_DeInit(void);
int32_t BSP_SD_ReadBlocks(uint32_t *pData, uint32_t Addr, uint32_t NumOfBlocks);
int32_t BSP_SD_WriteBlocks(uint32_t *pData, uint32_t Addr, uint32_t NumOfBlocks);
int32_t BSP_SD_Erase(uint32_t StartAddr, uint32_t EndAddr);
uint8_t BSP_SD_GetCardState(void);

// Camera API
int32_t BSP_CAMERA_Init(uint32_t Resolution);
int32_t BSP_CAMERA_DeInit(void);
int32_t BSP_CAMERA_Start(uint32_t buff);
int32_t BSP_CAMERA_Stop(void);
int32_t BSP_CAMERA_Suspend(void);
int32_t BSP_CAMERA_Resume(void);
```

### 10.4 BSP Configuration Expertise

The plugin provides expertise on:

1. **BSP Initialization Sequence**
   - System clock configuration
   - Peripheral clock enablement
   - GPIO configuration for BSP components
   - Interrupt priority setup

2. **BSP Customization**
   - Adding custom components
   - Modifying pin assignments
   - Creating custom BSP drivers

3. **BSP Integration Patterns**
   - Integration with FreeRTOS
   - Integration with LwIP (Ethernet)
   - Integration with USB Device/Host
   - Integration with File Systems

4. **Common BSP Issues**
   - Pin conflicts resolution
   - Clock configuration for peripherals
   - DMA channel assignment
   - Interrupt handler implementation

### 10.5 BSP Templates

```c
// BSP Configuration Header Template
// bsp_conf.h

#ifndef BSP_CONF_H
#define BSP_CONF_H

// LED Configuration
#define BSP_LED_COUNT             3
#define BSP_LED1_PIN              GPIO_PIN_0
#define BSP_LED1_GPIO_PORT        GPIOI

// Button Configuration
#define BSP_BUTTON_USER_PIN       GPIO_PIN_13
#define BSP_BUTTON_USER_GPIO_PORT GPIOC
#define BSP_BUTTON_USER_IRQ       EXTI15_10_IRQn

// Display Configuration
#define BSP_DISPLAY_WIDTH         480
#define BSP_DISPLAY_HEIGHT        800
#define BSP_DISPLAY_DSI_LANE      2

// SD Card Configuration
#define BSP_SD_DETECT_PIN         GPIO_PIN_8
#define BSP_SD_DETECT_GPIO_PORT   GPIOI

// Camera Configuration
#define BSP_CAMERA_RESOLUTION     CAMERA_R160x120
#define BSP_CAMERA_DATA_FORMAT    CAMERA_PF_RGB565

#endif /* BSP_CONF_H */
```

---

## 11. File System Support

### 11.1 Supported File Systems

| File System | Type | Use Case | ST Support |
|-------------|------|----------|------------|
| **FATFS** | FAT12/16/32/exFAT | SD cards, USB mass storage | STM32Cube middleware |
| **LittleFS** | Wear-leveled | SPI flash, power-safe | Community supported |
| **lwext4** | ext4 | Advanced requirements | Community port |

### 11.2 FATFS Integration (Primary)

FATFS is the primary file system supported by ST's middleware stack.

```yaml
fatfs_integration:
  version: "R0.15"
  features:
    - FAT12/FAT16/FAT32/exFAT support
    - Long filename support (LFN)
    - Unicode support
    - Multiple volume support
    - RTOS-safe with re-entrancy

  storage_media:
    - SD card (SDMMC interface)
    - USB mass storage
    - QSPI flash (memory-mapped)
    - RAM disk

  configuration:
    _FS_READONLY: 0      # Read-write mode
    _FS_MINIMIZE: 0      # Full functionality
    _USE_STRFUNC: 1      # String functions enabled
    _USE_FIND: 1         # f_find function
    _USE_MKFS: 1         # f_mkfs function
    _USE_FASTSEEK: 1     # Fast seek
    _USE_EXPAND: 1       # f_expand function
    _USE_CHMOD: 1        # f_chmod function
    _USE_LABEL: 1        # Volume label
    _USE_FORWARD: 1      # f_forward function
    _CODE_PAGE: 437      # Code page (US)
    _USE_LFN: 2          # LFN with dynamic allocation
    _MAX_LFN: 255        # Max LFN length
    _LFN_UNICODE: 0      # ANSI/OEM encoding
    _STRF_ENCODE: 0      # UTF-8 encoding
    _FS_RPATH: 2         # Relative path enabled
    _VOLUMES: 2          # Number of volumes
    _STR_VOLUME_ID: 1    # String volume ID
    _VOLUME_STRS: "SD,USB"
    _MULTI_PARTITION: 0  # Single partition
    _MIN_SS: 512         # Min sector size
    _MAX_SS: 512         # Max sector size
    _USE_TRIM: 0         # TRIM disabled
    _FS_NOFSINFO: 0      # Use FSINFO
    _FS_TINY: 0          # Normal mode
    _FS_EXFAT: 1         # exFAT enabled
    _FS_NORTC: 0         # Use RTC
    _NORTC_MON: 1        # Default month
    _NORTC_MDAY: 1       # Default day
    _NORTC_YEAR: 2024    # Default year
    _FS_LOCK: 0          # File lock disabled
    _FS_REENTRANT: 1     # Re-entrant enabled
    _FS_TIMEOUT: 1000    # Timeout (ms)
    _SYNC_t: HANDLE      # Sync object type
```

### 11.3 FATFS Low-Level Driver (diskio)

The plugin provides expertise in implementing the diskio interface:

```c
// diskio.h - Low-level disk I/O interface

// Status codes
#define STA_NOINIT      0x01    // Drive not initialized
#define STA_NODISK      0x02    // No medium in drive
#define STA_PROTECT     0x04    // Write protected

// Required functions to implement
DSTATUS disk_initialize(BYTE pdrv);
DSTATUS disk_status(BYTE pdrv);
DRESULT disk_read(BYTE pdrv, BYTE* buff, LBA_t sector, UINT count);
DRESULT disk_write(BYTE pdrv, const BYTE* buff, LBA_t sector, UINT count);
DRESULT disk_ioctl(BYTE pdrv, BYTE cmd, void* buff);

// IOCTL commands
#define CTRL_SYNC           0   // Flush disk cache
#define GET_SECTOR_COUNT    1   // Get number of sectors
#define GET_SECTOR_SIZE     2   // Get sector size
#define GET_BLOCK_SIZE      3   // Get erase block size
#define CTRL_TRIM           4   // Inform erased sectors
```

### 11.4 SD Card Integration with FATFS

```c
// Example SD Card + FATFS integration

#include "ff.h"
#include "ff_gen_drv.h"
#include "sd_diskio.h"

// File system objects
FATFS SDFatFs;      // File system object for SD
FIL MyFile;         // File object
char SDPath[4];     // SD logical drive path

// Initialize SD card with FATFS
void SD_FatFs_Init(void)
{
    FRESULT res;

    // Link FATFS driver
    res = FATFS_LinkDriver(&SD_Driver, SDPath);
    if (res != FR_OK) {
        // Handle error
        return;
    }

    // Mount file system
    res = f_mount(&SDFatFs, (TCHAR const*)SDPath, 1);
    if (res != FR_OK) {
        // Handle mount error
        return;
    }

    // File system ready
}

// Example file write
void Write_To_SD(void)
{
    FRESULT res;
    UINT bytesWritten;

    // Create/overwrite file
    res = f_open(&MyFile, "test.txt", FA_CREATE_ALWAYS | FA_WRITE);
    if (res == FR_OK) {
        // Write data
        res = f_write(&MyFile, "Hello STM32N6!", 14, &bytesWritten);

        // Close file
        f_close(&MyFile);
    }
}

// Example directory listing
void List_Directory(void)
{
    FRESULT res;
    DIR dir;
    FILINFO fno;

    res = f_opendir(&dir, SDPath);
    if (res == FR_OK) {
        while (1) {
            res = f_readdir(&dir, &fno);
            if (res != FR_OK || fno.fname[0] == 0) break;
            // Process fno.fname
        }
        f_closedir(&dir);
    }
}
```

### 11.5 LittleFS Integration

For power-safe, wear-leveled flash storage:

```yaml
littlefs_integration:
  version: "2.9"
  features:
    - Power-loss resilience
    - Wear leveling
    - Dynamic block allocation
    - POSIX-like API

  use_cases:
    - QSPI/OCTOSPI flash
    - External SPI flash
    - Critical data storage

  api_functions:
    - lfs_mount
    - lfs_unmount
    - lfs_format
    - lfs_file_open/close/read/write
    - lfs_dir_open/close/read
    - lfs_stat/remove/rename
```

### 11.6 File System Configuration Tool

The plugin provides a skill for file system setup:

```typescript
interface FileSystemConfig {
  storageType: "sdcard" | "qspi" | "ospi" | "usb" | "ram";
  fileSystem: "fatfs" | "littlefs" | "lwext4";
  mountPoint: string;
  readOnly: boolean;
  formatOnFirstMount: boolean;
  cacheConfig: {
    readAhead: boolean;
    writeBehind: boolean;
    bufferSize: number;
  };
  fatfsConfig?: {
    longFilenames: boolean;
    unicodeSupport: boolean;
    maxVolumes: number;
  };
  littlefsConfig?: {
    blockSize: number;
    blockCount: number;
    cacheSize: number;
    lookaheadSize: number;
  };
}
```

### 11.7 File System Agent Expertise

The AI/ML Engineer and Driver Developer agents have expertise in:

1. **FATFS Configuration**
   - Optimal configuration for different media
   - RTOS integration and thread safety
   - Performance tuning
   - Error handling patterns

2. **Low-Level Driver Implementation**
   - SD card DMA-based diskio
   - QSPI flash diskio implementation
   - USB MSC diskio implementation

3. **Common Issues Resolution**
   - Write protection handling
   - Card detection and hot-plug
   - DMA transfer alignment
   - Cache coherency (Cortex-M55)

4. **Performance Optimization**
   - Multi-block read/write
   - Cache configuration
   - Pre-allocation strategies

---

## 12. Quality Requirements

### 12.1 Performance Requirements

| Metric | Target |
|--------|--------|
| Build time (clean) | < 30 seconds |
| Peripheral config generation | < 2 seconds |
| Model conversion | < 60 seconds |
| Flash programming | < 5 seconds |

### 12.2 Reliability Requirements

| Requirement | Target |
|-------------|--------|
| Build success rate | > 99% |
| Generated code compilation | 100% |
| Tool crash rate | < 0.1% |

### 12.3 Usability Requirements

| Feature | Requirement |
|---------|-------------|
| Error messages | Clear, actionable suggestions |
| Documentation | Inline help for all commands |
| Templates | Working examples for common use cases |
| Debugging | Step-by-step troubleshooting guides |

---

## 13. Implementation Phases

### Phase 1: Core Infrastructure (Weeks 1-3)

- [ ] MCP server framework setup
- [ ] Basic command structure
- [ ] Agent definitions
- [ ] Configuration system

### Phase 2: Development Tools (Weeks 4-6)

- [ ] Build tool implementation
- [ ] Flash/debug tool integration
- [ ] Peripheral configuration tool
- [ ] Clock configuration tool

### Phase 3: AI/ML Integration (Weeks 7-9)

- [ ] ST Edge AI Suite integration
- [ ] Model conversion tools
- [ ] Quantization workflow
- [ ] Neural-ART code generation

### Phase 4: Advanced Features (Weeks 10-12)

- [ ] Trace analysis tools
- [ ] Register inspection
- [ ] Memory map visualization
- [ ] Performance profiling

### Phase 5: Testing & Documentation (Weeks 13-15)

- [ ] Integration testing
- [ ] Documentation completion
- [ ] Example projects
- [ ] Release preparation

---

## Appendix A: STM32N6570-DK Pin Reference

```
Key Pin Assignments (STM32N6570-DK):
+-----------------+------------------+------------------+
| Function        | Pin              | Alternate        |
+-----------------+------------------+------------------+
| DEBUG_SWDIO     | PA13             | -                |
| DEBUG_SWCLK     | PA14             | -                |
| DEBUG_SWO       | PB3              | -                |
| I2C1_SCL        | PB6              | I2C1             |
| I2C1_SDA        | PB7              | I2C1             |
| SPI1_SCK        | PA5              | SPI1             |
| SPI1_MISO       | PA6              | SPI1             |
| SPI1_MOSI       | PA7              | SPI1             |
| USART1_TX       | PA9              | USART1           |
| USART1_RX       | PA10             | USART1           |
| CAN1_TX         | PA12             | CAN1             |
| CAN1_RX         | PA11             | CAN1             |
| ETH_MDC         | PC1              | ETH              |
| ETH_MDIO        | PA2              | ETH              |
+-----------------+------------------+------------------+
```

## Appendix B: ST Edge AI Model Zoo Models

| Model | Category | Input Size | Parameters | Notes |
|-------|----------|------------|------------|-------|
| MobileNet V2 | Image Classification | 224x224 | 3.4M | Pre-quantized available |
| SSD MobileNet | Object Detection | 300x300 | 6.8M | Real-time capable |
| DeepLab V3 | Segmentation | 257x257 | 11.2M | Memory optimized |
| YAMNet | Audio Classification | 1D (96x64) | 3.7M | Audio event detection |
| Whisper Tiny | Speech Recognition | Variable | 37M | Keyword spotting |

---

## Appendix C: Reference Documentation

### Official STMicroelectronics Resources

1. [STM32N6 Series Product Page](https://www.st.com/en/microcontrollers-microprocessors/stm32n6-series.html)
2. [STM32CubeN6 MCU Package](https://www.st.com/en/embedded-software/stm32cuben6.html)
3. [ST Edge AI Developer Zone](https://www.st.com/en/developer-zone/st-edge-ai-developer-zone.html)
4. [STM32N6570-DK Discovery Kit](https://www.st.com/en/evaluation-tools/stm32n6570-dk.html)

### Claude Code Resources

1. [Claude Code Documentation](https://docs.anthropic.com/en/docs/claude-code)
2. [Model Context Protocol](https://modelcontextprotocol.io/)
3. [MCP Server Development](https://modelcontextprotocol.io/quickstart)

---

*Document Status: Phase 1 Complete - Ready for Architecture Design*
*Next Phase: High Level Architecture Design*
