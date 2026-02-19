# /flash - Program Target Device

Program the STM32N6 target device via debug probe.

## Usage
```
/flash [binary_path] [options]
```

## Arguments
- `binary_path`: Path to binary file (.elf, .bin, .hex)

## Options
- `--probe stlink|jlink|ulink` - Debug probe type (default: stlink)
- `--verify` - Verify after programming (default: true)
- `--reset` - Reset target after programming (default: true)
- `--erase full|sector|none` - Erase type (default: sector)

## Examples
```
/flash                                   # Flash last built binary
/flash Debug/project.elf                 # Flash specific ELF file
/flash project.bin --probe jlink        # Flash using J-Link
```

## Workflow
1. Verify debug probe connection
2. Detect target device
3. Erase flash (if configured)
4. Program binary to flash memory
5. Verify programmed data
6. Reset target (if configured)

## Supported Debug Probes

| Probe | Interface | Speed | Features |
|-------|-----------|-------|----------|
| ST-Link V3 | SWD/JTAG | 24 MHz | SWV, Virtual COM |
| J-Link | SWD/JTAG | 50 MHz | ETM, RTT |
| ULINKplus | SWD/JTAG | 20 MHz | SWV, Power meas. |

## Output
- Bytes written
- Programming duration
- Verification status
- Target device information

## Related Commands
- `/build` - Build before flashing
- `/debug` - Debug after flashing

## Tools Used
- `stm32_flash` - MCP tool for programming
