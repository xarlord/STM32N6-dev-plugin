# STM32N6 Sample Project

A minimal blinky example for STM32N6570-DK to test the MCP plugin.

## Project Structure

```
sample-project/
├── CMakeLists.txt      # CMake build configuration
├── include/
│   └── stm32n6xx_it.h  # Interrupt handler declarations
├── linker/
│   └── STM32N6570_FLASH.ld  # Linker script
└── src/
    ├── main.c          # Main application
    ├── stm32n6xx_it.c  # Interrupt handlers
    └── system_stm32n6xx.c  # System initialization
```

## Building with Claude Code

```bash
# Using the /build command
/build Debug

# Or via MCP tool
claude> Use stm32_build tool with projectPath: sample-project
```

## Expected Output

- Binary: `build/project.elf`
- Hex: `build/project.hex`
- Bin: `build/project.bin`

## Hardware Configuration

- LED on GPIOB Pin 0
- SysTick configured for 1ms interrupts
- LED toggles every 500ms

## Notes

This is a minimal example for testing. For real projects, you would need:
- STM32CubeN6 HAL library
- CMSIS headers
- GCC ARM toolchain installed
