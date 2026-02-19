# STM32N6 Development Plugin for Claude Code

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/xarlord/STM32N6-dev-plugin/releases/tag/v1.0.0)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Tests](https://img.shields.io/badge/tests-186%20passing-brightgreen.svg)]()
[![Coverage](https://img.shields.io/badge/coverage-86.62%25-green.svg)]()
[![GitHub release](https://img.shields.io/github/release/xarlord/STM32N6-dev-plugin.svg)](https://github.com/xarlord/STM32N6-dev-plugin/releases/latest)

A comprehensive Claude Code plugin for developing software on the **STM32N6570-DK** evaluation board, featuring MCP server integration, specialized agents, and tools for embedded AI development.

## Quick Start

```bash
# Clone the repository
git clone https://github.com/xarlord/STM32N6-dev-plugin.git
cd STM32N6-dev-plugin/stm32n6-dev-server

# Install dependencies and build
npm install
npm run build

# Add to Claude Code
claude mcp add stm32n6-dev -- node $(pwd)/dist/index.js
```

## Features

- **10 MCP Tools** for build, deploy, debug, and analysis
- **7 Specialized Agents** for different development domains
- **8 Slash Commands** for common workflows
- **8 Skills** for complex multi-step tasks
- **Hook System** for extensibility
- **Template Engine** for code generation

## Target Hardware

| Component | Specification |
|-----------|---------------|
| CPU | ARM Cortex-M55 @ 800 MHz |
| NPU | Neural-ART @ 1 GHz (600 GOPS) |
| GPU | NeoChrom Accelerator |
| RAM | 4.2 MB contiguous |
| Security | SESIP Level 3, PSA Level 3 |

## Installation

### Option 1: Clone and Install

```bash
git clone https://github.com/xarlord/STM32N6-dev-plugin.git
cd STM32N6-dev-plugin/stm32n6-dev-server
npm install
npm run build
```

### Option 2: Install via Claude Code

```bash
# Add to your Claude Code MCP settings
claude mcp add stm32n6-dev -- node /path/to/STM32N6-dev-plugin/stm32n6-dev-server/dist/index.js
```

## Available Tools

| Tool | Description |
|------|-------------|
| `stm32_build` | Build STM32N6 projects using GCC ARM toolchain |
| `stm32_flash` | Program target device via ST-Link/J-Link |
| `stm32_debug` | Start GDB debug session with target |
| `peripheral_config` | Generate peripheral drivers (I2C, SPI, UART, etc.) |
| `clock_config` | Configure clock tree and generate code |
| `model_convert` | Convert ML models for Neural-ART deployment |
| `model_quantize` | Quantize models (int8, int4, mixed, fp16) |
| `trace_analyze` | Analyze SWV/ETM trace data |
| `register_inspect` | Read/write peripheral registers |
| `memory_map` | Memory usage analysis |

## Available Agents

| Agent | Expertise |
|-------|-----------|
| Project Lead | Workflow orchestration and coordination |
| STM32 Architect | System design, memory layout, clocks |
| Driver Developer | Peripheral drivers (I2C, SPI, CAN, DSI, CSI) |
| AI Engineer | Neural-ART NPU, model quantization |
| RTOS Specialist | FreeRTOS configuration and tasks |
| Debug Engineer | GDB, SWV, ETM trace analysis |
| Test Engineer | Unity framework, code coverage |

## Slash Commands

| Command | Description |
|---------|-------------|
| `/build` | Build the project |
| `/flash` | Flash to target device |
| `/debug` | Start debug session |
| `/peripheral` | Configure peripheral |
| `/clock` | Clock configuration wizard |
| `/model` | ML model operations |
| `/test` | Run tests |
| `/analyze` | Analyze trace/performance |

## Skills

| Skill | Description |
|-------|-------------|
| `project-init` | Initialize new STM32N6 project |
| `driver-create` | Generate peripheral driver |
| `rtos-setup` | Configure FreeRTOS |
| `model-deploy` | Deploy ML model to Neural-ART |
| `debug-session` | Start interactive debug session |
| `bsp-configure` | Configure Board Support Package |
| `filesystem-setup` | Set up FATFS/LittleFS |
| `clock-wizard` | Interactive clock tree configuration |

## Usage Example

```
User: /build Debug
Claude: Building STM32N6 project in Debug configuration...

User: /flash build/output.elf
Claude: Flashing to STM32N6570-DK via ST-Link...

User: Help me create an I2C driver for a temperature sensor
Claude: I'll use the Driver Developer agent to create an I2C driver...
```

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

## Project Structure

```
STM32N6-dev-plugin/
├── .claude/
│   ├── commands/     # Slash commands
│   └── skills/       # Skill definitions
├── docs/
│   ├── architecture.md
│   ├── api-reference.md
│   └── stm32n6-reference.md
├── stm32n6-dev-server/
│   ├── src/
│   │   ├── agents/   # Specialized agents
│   │   ├── tools/    # MCP tools
│   │   ├── hooks/    # Hook engine
│   │   ├── templates/# Code templates
│   │   └── config/   # Configuration
│   └── tests/        # Test suites
├── plugin.json       # Plugin manifest
└── README.md
```

## Requirements

- Node.js 18+
- STM32CubeIDE (optional, for CubeIDE projects)
- GCC ARM Toolchain
- STM32CubeProgrammer (for flashing)
- ST-Link or J-Link debug probe

## License

MIT License - see [LICENSE](LICENSE) for details.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `npm test`
5. Submit a pull request

## Support

- [GitHub Issues](https://github.com/xarlord/STM32N6-dev-plugin/issues)
- [Documentation](https://github.com/xarlord/STM32N6-dev-plugin/tree/main/docs)
- [Changelog](CHANGELOG.md)

## Roadmap

See [task_plan.md](task_plan.md) for planned features and development status.

## Acknowledgments

- Built with [MCP SDK](https://github.com/modelcontextprotocol/sdk)
- Inspired by STM32CubeIDE and ST Edge AI Suite
- Target hardware: [STM32N6570-DK](https://www.st.com/en/evaluation-tools/stm32n6570-dk.html)
