# driver-create - Generate Peripheral Driver

Generate complete peripheral driver code with HAL/LL abstraction, DMA support, and interrupt handling.

## Purpose
Create production-ready peripheral drivers for STM32N6.

## Usage
```
/driver-create <peripheral> <mode> [options]
```

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
- `--dma` - Enable DMA support
- `--interrupt` - Enable interrupt handlers
- `--rtos-safe` - Make RTOS thread-safe
- `--error-handling` - Comprehensive error handling
- `--template minimal|full|production` - Code template

## Workflow
1. Analyze peripheral requirements
2. Generate pin configuration
3. Create initialization code
4. Implement transfer functions
5. Add DMA configuration (if enabled)
6. Add interrupt handlers (if enabled)
7. Generate example usage code
8. Create unit test template

## Generated Files
```
drivers/<peripheral>/
├── <peripheral>_driver.h
├── <peripheral>_driver.c
├── <peripheral>_config.h
├── <peripheral>_dma.c (if DMA enabled)
├── <peripheral>_it.c (if interrupts enabled)
├── <peripheral>_example.c
└── tests/
    └── test_<peripheral>.c
```

## Example
```
/driver-create I2C1 master --dma --interrupt --template production
```

This generates a complete I2C master driver with:
- DMA-based transfers
- Interrupt-driven operation
- Error recovery
- Thread-safe operations
- Example code

## Agents Used
- Driver Developer (code generation)
- STM32 Architect (pin configuration)

## Tools Used
- `peripheral_config` - Code generation

## Quality Targets
- MISRA-C compliant (where applicable)
- 100% branch coverage
- All error paths tested
