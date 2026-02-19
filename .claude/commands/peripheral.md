# /peripheral - Configure Peripheral

Generate peripheral initialization code for STM32N6.

## Usage
```
/peripheral <name> <mode> [options]
```

## Arguments
- `name`: Peripheral name (I2C1, SPI1, USART1, CAN, ETH, etc.)
- `mode`: Operating mode (master, slave, tx, rx, etc.)

## Options
- `--dma` - Enable DMA transfers
- `--interrupt` - Enable interrupt handlers
- `--hal` - Use HAL driver (default)
- `--ll` - Use LL (low-layer) driver

## Supported Peripherals

| Peripheral | Modes | DMA | Interrupts |
|------------|-------|-----|------------|
| I2C1-3 | master, slave | Yes | Yes |
| SPI1-3 | master, slave | Yes | Yes |
| USART1-3 | tx, rx, duplex | Yes | Yes |
| CAN/CAN-FD | classic, fd | Yes | Yes |
| ETH | rmii, mii | Yes | Yes |
| ADC1-2 | single, multi | Yes | Yes |
| TIM1-5 | pwm, capture | Yes | Yes |

## Examples
```
/peripheral I2C1 master 400kHz
/peripheral SPI1 master --dma --interrupt
/peripheral USART1 tx rx 115200
/peripheral CAN fd --interrupt
/peripheral ETH rmii --dma
```

## Generated Files
- `<peripheral>_driver.h` - Driver header
- `<peripheral>_driver.c` - Driver implementation
- `<peripheral>_config.h` - Configuration header
- `<peripheral>_example.c` - Usage example

## Output
- Generated code files
- Pin configuration
- DMA channel assignments
- Interrupt priorities

## Related Commands
- `/clock` - Configure peripheral clocks
- `/build` - Build after generating

## Tools Used
- `peripheral_config` - MCP tool for code generation
