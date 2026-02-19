# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-02-19

### Added

#### MCP Server
- **10 MCP Tools** for STM32N6 development:
  - `stm32_build` - Build projects with GCC ARM toolchain
  - `stm32_flash` - Program target via ST-Link/J-Link
  - `stm32_debug` - GDB debug sessions
  - `peripheral_config` - Generate peripheral drivers
  - `clock_config` - Clock tree configuration
  - `model_convert` - Convert ML models for Neural-ART
  - `model_quantize` - Quantize models (int8, int4, mixed, fp16)
  - `trace_analyze` - SWV/ETM trace analysis
  - `register_inspect` - Read/write peripheral registers
  - `memory_map` - Memory usage analysis

#### Agents
- **7 Specialized Agents**:
  - Project Lead - Workflow orchestration
  - STM32 Architect - System design, memory, clocks
  - Driver Developer - Peripheral drivers (I2C, SPI, UART, CAN)
  - AI Engineer - Neural-ART NPU, model deployment
  - RTOS Specialist - FreeRTOS configuration
  - Debug Engineer - GDB, SWV, ETM trace
  - Test Engineer - Unity framework, coverage

#### Commands & Skills
- **8 Slash Commands**: `/build`, `/flash`, `/debug`, `/peripheral`, `/clock`, `/model`, `/test`, `/analyze`
- **8 Skills**: `project-init`, `driver-create`, `rtos-setup`, `model-deploy`, `debug-session`, `bsp-configure`, `filesystem-setup`, `clock-wizard`

#### Infrastructure
- Hook Engine with 4 built-in hooks (pre-build validation, post-build analysis, target connection check, flash logging)
- Template Engine with Handlebars helpers (upper, lower, camel, pascal, snake, hex, json, etc.)
- Configuration Manager with environment variable support
- Logger utility with multiple log levels

#### Testing
- 186 tests with 100% pass rate
- 86.62% code coverage
- 10 test suites covering all components

#### Documentation
- Architecture design document
- API reference document
- STM32N6 reference architecture
- Plugin manifest (`plugin.json`)
- Marketplace manifest (`marketplace.json`)

### Hardware Support
- **Target**: STM32N6570-DK evaluation board
- **CPU**: ARM Cortex-M55 @ 800 MHz
- **NPU**: Neural-ART @ 1 GHz (600 GOPS)
- **GPU**: NeoChrom Accelerator
- **RAM**: 4.2 MB contiguous

### Requirements
- Node.js 18+
- GCC ARM Toolchain (optional)
- STM32CubeIDE (optional)
- STM32CubeProgrammer (optional)
- ST-Link or J-Link debug probe (optional)

---

## Future Releases

### [1.1.0] - Planned
- Additional BSP component templates
- Display driver patterns
- Camera driver patterns
- SD Card driver patterns
- Ethernet driver patterns
- QSPI Flash driver patterns

### [1.2.0] - Planned
- Additional skills (pin-mux-wizard, memory-optimizer, boot-sequence, security-config)
- Power management templates
- Trace capture integration
- USB device support

---

[1.0.0]: https://github.com/xarlord/STM32N6-dev-plugin/releases/tag/v1.0.0
