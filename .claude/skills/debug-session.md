# debug-session - Start Debug Session

Launch comprehensive debugging session with GDB/OpenOCD integration.

## Purpose
Start a full-featured debugging session for STM32N6 development.

## Usage
```
/debug-session [elf_path] [options]
```

## Options
- `--probe stlink|jlink|ulink` - Debug probe
- `--interface swd|jtag` - Debug interface
- `--speed <kHz>` - Debug speed
- `--swv` - Enable Serial Wire Viewer
- `--etm` - Enable ETM trace
- `--rtos freertos|threadx` - RTOS awareness
- `--script <path>` - Custom GDB script

## Features

### Target Connection
- Auto-detect debug probe
- Configure debug interface
- Halt on connect option

### Breakpoint Management
- Software breakpoints (unlimited in RAM)
- Hardware breakpoints (6 max in Flash)
- Conditional breakpoints
- Watchpoints (data breakpoints)

### Memory Inspection
- Memory dump
- Peripheral register view
- RTOS object inspection
- Stack analysis

### Trace Features
- ITM stimulus ports
- SWV data trace
- PC sampling
- Exception tracing

### RTOS Awareness
- Task list
- Stack usage per task
- Queue/semaphore status
- Runtime statistics

## Debug Workflow
1. Start OpenOCD/GDB server
2. Connect to target
3. Load symbols
4. Reset and halt
5. Set initial breakpoints
6. Begin debugging

## Example Session
```
/debug-session project.elf --probe stlink --swv --rtos freertos

# GDB commands available:
(gdb) break main
(gdb) continue
(gdb) info tasks          # RTOS task list
(gdb) info stack          # Stack usage
(gdb) monitor swv start   # Start SWV
```

## Agents Used
- Debug Engineer (debugging)

## Tools Used
- `stm32_debug` - Debug session
- `register_inspect` - Register access
- `trace_analyze` - Trace analysis
