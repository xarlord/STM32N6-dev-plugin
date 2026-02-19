# /clock - Configure Clock Tree

Configure the STM32N6 clock tree for optimal performance.

## Usage
```
/clock [frequency] [options]
```

## Arguments
- `frequency`: Target SYSCLK frequency in MHz (max 800)

## Options
- `--source hsi|hse|pll` - Clock source (default: pll)
- `--hse <MHz>` - HSE frequency
- `--apb1 <div>` - APB1 prescaler
- `--apb2 <div>` - APB2 prescaler

## Examples
```
/clock 800                    # Configure for 800 MHz
/clock 400 --source hse       # 400 MHz from HSE
/clock 800 --apb1 4 --apb2 2  # Custom prescalers
```

## Clock Architecture

```
         HSI (64 MHz) ───┐
                         ├──> PLL ──> SYSCLK (max 800 MHz)
         HSE (25 MHz) ───┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              v               v               v
            AHB           APB1           APB2
         (max 800)      (max 200)      (max 400)
```

## Clock Domains

| Domain | Max Frequency | Usage |
|--------|---------------|-------|
| SYSCLK | 800 MHz | CPU, NPU interface |
| AHB | 800 MHz | Memory, DMA |
| APB1 | 200 MHz | Low-speed peripherals |
| APB2 | 400 MHz | High-speed peripherals |
| NPU | 1000 MHz | Neural-ART accelerator |

## Output
- Clock frequencies for all domains
- PLL configuration parameters
- Generated SystemClock_Config() code

## Related Commands
- `/peripheral` - Configure peripheral clocks
- `/build` - Build with new clock config

## Tools Used
- `clock_config` - MCP tool for clock configuration
