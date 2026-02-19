# STM32N6 Development MCP Server

MCP Server providing Claude Code with specialized capabilities for STM32N6570-DK development.

## Features

- **10 MCP Tools** for build, deploy, debug, and analysis
- **7 Specialized Agents** for different development domains
- **8 Slash Commands** for common workflows
- **8 Skills** for complex tasks
- **Hook System** for extensibility
- **Template Engine** for code generation

## Installation

```bash
cd stm32n6-dev-server
npm install
npm run build
```

## Usage with Claude Code

Add to your Claude Code settings:

```json
{
  "mcpServers": {
    "stm32n6-dev": {
      "command": "node",
      "args": ["path/to/stm32n6-dev-server/dist/index.js"]
    }
  }
}
```

## Available Tools

| Tool | Description |
|------|-------------|
| `stm32_build` | Build STM32N6 projects |
| `stm32_flash` | Program target device |
| `stm32_debug` | Start debug session |
| `peripheral_config` | Generate peripheral drivers |
| `clock_config` | Configure clock tree |
| `model_convert` | Convert ML models |
| `model_quantize` | Quantize models |
| `trace_analyze` | Analyze trace data |
| `register_inspect` | Read/write registers |
| `memory_map` | Memory analysis |

## Available Agents

| Agent | Expertise |
|-------|-----------|
| Project Lead | Workflow orchestration |
| STM32 Architect | System design, memory, clocks |
| Driver Developer | Peripheral drivers |
| AI Engineer | Neural-ART, ML deployment |
| RTOS Specialist | FreeRTOS |
| Debug Engineer | GDB, trace analysis |
| Test Engineer | Unity, coverage |

## Development

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Development mode
npm run dev

# Build
npm run build
```

## Quality Targets

- **Code Coverage**: 100%
- **Test Pass Rate**: 100%
- **Documentation**: 100%

## License

MIT
