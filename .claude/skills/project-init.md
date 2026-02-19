# project-init - Initialize STM32N6 Project

Create a new STM32N6 project with proper structure, BSP integration, and initial configuration.

## Purpose
Initialize a complete STM32N6 development project ready for development.

## Usage
```
/project-init <project_name> [options]
```

## Options
- `--template base|freertos|aiml|graphics|networking` - Project template
- `--bsp` - Enable BSP integration (default: true)
- `--ide cubeide|makefile|cmake` - Build system
- `--mcu STM32N6570` - Target MCU

## Templates

### base
Minimal project with:
- HAL drivers
- System initialization
- Basic main loop

### freertos
FreeRTOS-based project with:
- FreeRTOS kernel
- Task templates
- Queue and semaphore examples

### aiml
AI/ML-focused project with:
- ST Edge AI integration
- Neural-ART support
- Camera/display pipeline

### graphics
Graphics-focused project with:
- TouchGFX integration
- DSI display support
- GUI templates

### networking
Network-focused project with:
- LwIP stack
- Ethernet driver
- TCP/UDP examples

## Workflow
1. Create project directory structure
2. Copy STM32CubeN6 HAL/LL drivers
3. Initialize BSP for STM32N6570-DK
4. Generate startup code
5. Create linker script
6. Set up build configuration
7. Generate main.c with basic initialization
8. Create CLAUDE.md with project context

## Output Structure
```
project_name/
├── Core/
│   ├── Inc/
│   │   ├── main.h
│   │   ├── stm32n6xx_hal_conf.h
│   │   └── stm32n6xx_it.h
│   ├── Src/
│   │   ├── main.c
│   │   ├── stm32n6xx_it.c
│   │   └── system_stm32n6xx.c
│   └── Startup/
│       └── startup_stm32n6570.s
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

## Agents Used
- STM32 Architect (system design)
- Driver Developer (initialization code)

## Tools Used
- `clock_config` - Clock initialization
- `peripheral_config` - GPIO setup

## Example
```
/project-init my_ai_project --template aiml --ide cmake
```
