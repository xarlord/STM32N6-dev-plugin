# clock-wizard - Clock Tree Configuration

Interactive configuration of STM32N6 clock tree.

## Purpose
Configure optimal clock settings for STM32N6570.

## Usage
```
/clock-wizard [target_freq] [options]
```

## Options
- `--sysclk <Hz>` - System clock frequency (max 800MHz)
- `--ahb <div>` - AHB prescaler
- `--apb1 <div>` - APB1 clock frequency
- `--apb2 <div>` - APB2 clock frequency
- `--pll-config` - PLL configuration source
- `--output` - Generate code only (no interactive)

## Clock Domains
- SYSCLK: Main system clock (max 800 MHz)
- AHB: High-speed bus (max 800 MHz)
- APB1: Peripheral bus 1 (max 200 MHz)
- APB2: Peripheral bus 2 (max 400 MHz)
- PLL1/PLL2/PLL3: PLL configurations
- Kernel clocks: Peripheral-specific

## Generated Files
- `clock_config.c` - Clock initialization
- `clock_config.h` - Configuration defines

## Example
```
/clock-wizard 800MHz
/clock-wizard --sysclk 800000000 --apb1 200000000
```

## Tools Used
- `clock_config` - Clock generation
