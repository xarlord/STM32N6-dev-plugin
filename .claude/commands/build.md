# /build - Build STM32N6 Project

Build the STM32N6 project using the configured toolchain.

## Usage
```
/build [build_type]
```

## Arguments
- `build_type`: Debug (default), Release, MinSizeRel

## Examples
```
/build                    # Build with Debug configuration
/build Release            # Build with Release configuration
/build MinSizeRel         # Build with minimal size
```

## Workflow
1. Validate project structure
2. Check toolchain availability
3. Execute build command using the `stm32_build` MCP tool
4. Parse build output for errors and warnings
5. Report results with memory size analysis

## Build Types

| Type | Optimization | Debug Info | Use Case |
|------|--------------|------------|----------|
| Debug | -O0 | Full | Development, debugging |
| Release | -O3 | None | Production deployment |
| MinSizeRel | -Os | Minimal | Size-constrained applications |

## Output
- Build success/failure status
- Number of errors and warnings
- Memory usage report (Flash, RAM)
- Path to output binary

## Related Commands
- `/flash` - Flash the built binary to target
- `/debug` - Start debugging session
- `/analyze` - Analyze memory usage

## Tools Used
- `stm32_build` - MCP tool for building projects
