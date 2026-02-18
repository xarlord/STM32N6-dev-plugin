# STM32N6-Dev-Team - Claude Code Plugin

## Project Overview

**Application Name:** stm32n6-dev-team
**Type:** Claude Code Plugin
**Target Platform:** STM32N6570-DK Evaluation Board

### Mission Statement
Provide a comprehensive Claude Code plugin that brings expertise for developing software on the STM32N6570-DK evaluation board, including CPU/GPU/NPU development, peripheral drivers, RTOS support, ML model integration, and debugging capabilities.

---

## Phase 1: Requirements Generation [COMPLETED]

### 1.1 Plugin Core Requirements
- [x] Define plugin structure following Claude Code plugin specification
- [x] Identify required agents and their capabilities
- [x] Define tools and commands to be exposed
- [x] Document workflow patterns (similar to devflow-enforcer)

### 1.2 STM32N6570-DK Technical Requirements
- [x] CPU development capabilities (Cortex-M55 @ 800MHz)
- [x] NPU development capabilities (Neural-ART @ 1GHz, 600 GOPS)
- [x] GPU development capabilities (NeoChrom Accelerator)
- [x] Peripheral drivers support:
  - [x] I2C
  - [x] DSI (Display Serial Interface)
  - [x] CSI (Camera Serial Interface, MIPI CSI-2)
  - [x] Ethernet
  - [x] CAN bus
- [x] RTOS/OS Tasks support (FreeRTOS)
- [x] System/Software architecture templates

### 1.3 ML/AI Requirements
- [x] ST Edge AI Suite integration
- [x] Model conversion for Neural-ART
- [x] Model quantization support (int8, int4)
- [x] Pipeline examples creation

### 1.4 Development & Debugging Requirements
- [x] C/C++ development expertise
- [x] GCC ARM toolchain integration
- [x] Device driver development patterns
- [x] Debugging interface integration (ST-Link, J-Link)
- [x] Log reading from debugger (SWV, ETM)
- [x] Test writing and execution framework

### 1.5 Skills Requirements
- [x] Define user-invocable skills (similar to devflow-enforcer)
- [x] Project initialization skill
- [x] Driver creation skill
- [x] RTOS setup skill
- [x] Model deployment skill
- [x] Debug session skill
- [x] BSP configuration skill
- [x] File system setup skill
- [x] Clock/Pin configuration wizards

### 1.6 Board Support Package (BSP) Requirements
- [x] STM32N6570-DK BSP expertise
- [x] LED, Button, Display, Camera APIs
- [x] SD Card interface support
- [x] Ethernet PHY configuration
- [x] QSPI Flash support
- [x] BSP initialization sequences
- [x] BSP customization patterns

### 1.7 File System Requirements
- [x] FATFS integration (ST middleware)
- [x] SD Card file system support
- [x] QSPI Flash file system support
- [x] LittleFS support (power-safe)
- [x] Low-level diskio driver implementation
- [x] File system configuration tools

### Deliverables
- [x] **Detailed Requirements Document** - `docs/requirements.md`

---

## Phase 2: Architecture Design [IN PROGRESS]

### 2.1 Plugin Architecture
- [ ] Design MCP server architecture
- [ ] Define agent interaction patterns
- [ ] Design tool interfaces
- [ ] Design command routing
- [ ] Design hook system

### 2.2 Reference Architecture Integration
- [ ] Map ST reference architecture for STM32N6570-DK
- [ ] Document driver codebase patterns
- [ ] Create memory layout templates
- [ ] Document boot sequence patterns

### 2.3 Technical Architecture
- [ ] MCP Server implementation design
- [ ] Tool implementation specifications
- [ ] Agent implementation specifications
- [ ] Template system design
- [ ] Configuration management design

### Deliverables
- [ ] Architecture Design Document - `docs/architecture.md`
- [ ] API Reference Document - `docs/api-reference.md`
- [ ] Data Flow Diagrams

---

## Phase 3: Implementation

### 3.1 Core Plugin Structure
- [ ] Create plugin directory structure
- [ ] Implement MCP server framework
- [ ] Implement configuration system
- [ ] Create base agent classes

### 3.2 Agent Implementations
- [ ] Project Lead Agent
- [ ] STM32 Architect Agent
- [ ] Driver Developer Agent
- [ ] AI/ML Engineer Agent
- [ ] RTOS Specialist Agent
- [ ] Debug Engineer Agent
- [ ] Test Engineer Agent

### 3.3 Tool Implementations
- [ ] stm32_build tool
- [ ] stm32_flash tool
- [ ] stm32_debug tool
- [ ] peripheral_config tool
- [ ] clock_config tool
- [ ] model_convert tool
- [ ] model_quantize tool
- [ ] trace_analyze tool
- [ ] register_inspect tool
- [ ] memory_map tool

### 3.4 Command Implementations
- [ ] /build command
- [ ] /debug command
- [ ] /flash command
- [ ] /peripheral command
- [ ] /clock command
- [ ] /model command
- [ ] /test command
- [ ] /analyze command

### 3.5 Skill Implementations
- [ ] project-init skill
- [ ] driver-create skill
- [ ] rtos-setup skill
- [ ] model-deploy skill
- [ ] debug-session skill
- [ ] bsp-configure skill
- [ ] filesystem-setup skill
- [ ] clock-wizard skill
- [ ] pin-mux-wizard skill
- [ ] memory-optimizer skill
- [ ] boot-sequence skill
- [ ] security-config skill
- [ ] power-profile skill
- [ ] trace-capture skill
- [ ] ethernet-setup skill
- [ ] usb-device skill
- [ ] display-setup skill
- [ ] camera-pipeline skill

### 3.6 BSP Integration
- [ ] BSP API wrappers
- [ ] BSP component templates
- [ ] BSP configuration helpers
- [ ] BSP initialization sequences
- [ ] LED/Button driver patterns
- [ ] Display driver patterns
- [ ] Camera driver patterns
- [ ] SD Card driver patterns
- [ ] Ethernet driver patterns
- [ ] QSPI Flash driver patterns

### 3.7 File System Integration
- [ ] FATFS configuration tool
- [ ] FATFS diskio driver templates
- [ ] SD Card FATFS integration
- [ ] QSPI FATFS integration
- [ ] LittleFS integration
- [ ] File system API wrappers
- [ ] File operation examples

### 3.8 Templates
- [ ] Project templates
- [ ] Driver templates
- [ ] RTOS task templates
- [ ] ML pipeline templates
- [ ] BSP component templates
- [ ] File system templates
- [ ] Boot sequence templates
- [ ] Security templates
- [ ] Power management templates

### 3.9 Documentation
- [ ] User guide
- [ ] Developer guide
- [ ] API reference
- [ ] Example projects

---

## Phase 4: Testing & Validation

### 4.1 Unit Testing
- [ ] MCP server tests
- [ ] Tool tests
- [ ] Agent tests
- [ ] Command tests

### 4.2 Integration Testing
- [ ] STM32CubeIDE integration tests
- [ ] ST Edge AI Suite integration tests
- [ ] STM32CubeProgrammer integration tests
- [ ] Debug probe integration tests

### 4.3 End-to-End Testing
- [ ] Build workflow tests
- [ ] Debug workflow tests
- [ ] ML deployment workflow tests
- [ ] Peripheral configuration workflow tests

### 4.4 Documentation Review
- [ ] Technical accuracy review
- [ ] Completeness review
- [ ] Usability review

---

## Phase 5: Release

### 5.1 Version Management
- [ ] Define versioning scheme
- [ ] Create changelog
- [ ] Tag release

### 5.2 Distribution
- [ ] Package for npm/PyPI
- [ ] Create installation guide
- [ ] Publish to registry

### 5.3 Post-Release
- [ ] Monitor issues
- [ ] Gather feedback
- [ ] Plan next iteration

---

## Technical Summary

### Hardware Target

| Component | Specification |
|-----------|--------------|
| CPU | ARM Cortex-M55 @ 800 MHz |
| NPU | Neural-ART @ 1 GHz (600 GOPS) |
| GPU | NeoChrom Accelerator |
| RAM | 4.2 MB contiguous |
| Security | SESIP Level 3, PSA Level 3 |

### BSP Components (STM32N6570-DK)

| Component | Type | Description |
|-----------|------|-------------|
| LEDs | 3x GPIO | LED1 (green), LED2 (orange), LED3 (red) |
| Buttons | USER + Joystick | PC13 user button, 5-way joystick |
| Display | DSI | 480x800 MIPI DSI with capacitive touch |
| Camera | CSI | MIPI CSI-2 camera interface |
| SD Card | SDMMC1 | SD/SDHC/SDXC support |
| Ethernet | RMII | LAN8742A PHY, 10/100 Mbps |
| QSPI Flash | Quad/Octal | 512 Mbit Macronix flash |
| HyperRAM | HyperBus | 64 Mbit external RAM |

### File Systems Supported

| File System | Storage | Features |
|-------------|---------|----------|
| FATFS | SD Card, USB, QSPI | FAT12/16/32/exFAT, ST middleware |
| LittleFS | QSPI, SPI Flash | Power-safe, wear-leveled |

### Agent Matrix

| Agent | Expertise |
|-------|-----------|
| STM32 Architect | System design, memory, clocks |
| Driver Developer | I2C, SPI, CAN, DSI, CSI, Ethernet |
| AI/ML Engineer | Neural-ART, model quantization |
| RTOS Specialist | FreeRTOS, task management |
| Debug Engineer | GDB, SWV, ETM trace |
| Test Engineer | Unity, CMock, HIL testing |

### Skills Matrix

| Skill | Category | Purpose |
|-------|----------|---------|
| project-init | Setup | Initialize new STM32N6 project |
| driver-create | Development | Generate peripheral drivers |
| rtos-setup | RTOS | Configure FreeRTOS |
| model-deploy | AI/ML | Deploy ML models to NPU |
| debug-session | Debug | Start debug session |
| bsp-configure | BSP | Configure Board Support Package |
| filesystem-setup | Storage | Set up FATFS/LittleFS |
| clock-wizard | Config | Clock tree configuration |
| pin-mux-wizard | Config | Pin assignment tool |
| memory-optimizer | Optimization | Memory analysis |
| test-generate | Testing | Generate unit tests |

### Tool Categories

1. **Build Tools**: stm32_build
2. **Deploy Tools**: stm32_flash, stm32_debug
3. **Code Gen Tools**: peripheral_config, clock_config
4. **AI/ML Tools**: model_convert, model_quantize
5. **Analysis Tools**: trace_analyze, register_inspect, memory_map

---

## Status: **PHASE 2 - ARCHITECTURE DESIGN**

*Last Updated: 2026-02-18*
