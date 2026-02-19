# /analyze - Analyze Performance

Analyze STM32N6 project for performance and memory optimization.

## Usage
```
/analyze <type> [options]
```

## Types
- `memory` - Memory usage analysis
- `timing` - Execution timing analysis
- `trace` - Trace data analysis
- `coverage` - Code coverage analysis

## Examples
```
/analyze memory                # Memory usage analysis
/analyze timing --elf project.elf
/analyze trace trace.bin --elf project.elf
/analyze coverage
```

## Memory Analysis
Shows detailed memory breakdown:
- Flash usage by section
- RAM usage by section
- Stack/heap estimation
- Largest symbols

## Timing Analysis
Analyzes execution timing:
- Function execution times
- Call counts
- Hot paths
- Optimization opportunities

## Trace Analysis
Analyzes SWV/ETM trace data:
- Instruction trace
- Data access patterns
- Exception events
- RTOS task switches

## Output
- Analysis report
- Visualizations
- Recommendations
- Optimization suggestions

## Related Commands
- `/build` - Build before analysis
- `/debug` - Capture traces

## Tools Used
- `memory_map` - MCP tool for memory analysis
- `trace_analyze` - MCP tool for trace analysis
