# /debug - Start Debug Session

Launch a GDB debug session with the STM32N6 target.

## Usage
```
/debug [elf_path] [options]
```

## Arguments
- `elf_path`: Path to ELF file with debug symbols

## Options
- `--probe stlink|jlink|ulink` - Debug probe (default: stlink)
- `--interface swd|jtag` - Debug interface (default: swd)
- `--speed <kHz>` - Debug speed (default: 4000)
- `--swv` - Enable Serial Wire Viewer
- `--rtos freertos|threadx` - RTOS awareness

## Examples
```
/debug                              # Debug last built binary
/debug Debug/project.elf            # Debug specific ELF
/debug project.elf --swv --rtos freertos
```

## Workflow
1. Check debug probe connection
2. Start OpenOCD/GDB server
3. Connect to target
4. Load symbols from ELF
5. Halt at entry point
6. Ready for debugging

## Debug Features

### Breakpoints
- Software breakpoints (unlimited in RAM)
- Hardware breakpoints (6 max in Flash)
- Conditional breakpoints

### Memory Access
- Read/write memory
- Peripheral register access
- RTOS object inspection

### Trace (SWV/ETM)
- ITM stimulus ports
- PC sampling
- Data trace
- Exception trace

## Common GDB Commands
```
break main          # Set breakpoint at main()
continue            # Resume execution
step                # Single step (into)
next                # Single step (over)
finish              # Run until function returns
info registers      # Display CPU registers
x/10x 0x20000000    # Examine memory
```

## Related Commands
- `/build` - Build with debug info
- `/flash` - Flash before debugging

## Tools Used
- `stm32_debug` - MCP tool for debugging
- `register_inspect` - MCP tool for register access
- `trace_analyze` - MCP tool for trace analysis
