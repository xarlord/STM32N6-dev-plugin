# STM32N6-Dev-Team Plugin - Architecture Design Document

**Document Version:** 1.0
**Date:** 2026-02-18
**Status:** Phase 2 - Architecture Design

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [MCP Server Architecture](#2-mcp-server-architecture)
3. [Agent System Architecture](#3-agent-system-architecture)
4. [Tool Architecture](#4-tool-architecture)
5. [Command System Architecture](#5-command-system-architecture)
6. [Hook System Architecture](#6-hook-system-architecture)
7. [Template System Architecture](#7-template-system-architecture)
8. [Configuration Management](#8-configuration-management)
9. [Integration Architecture](#9-integration-architecture)
10. [Data Flow Diagrams](#10-data-flow-diagrams)
11. [Security Architecture](#11-security-architecture)
12. [Error Handling Architecture](#12-error-handling-architecture)

---

## 1. Architecture Overview

### 1.1 High-Level Architecture

```
+------------------------------------------------------------------+
|                        Claude Code Host                           |
+------------------------------------------------------------------+
                                |
                                | MCP Protocol
                                v
+------------------------------------------------------------------+
|                    STM32N6-Dev MCP Server                         |
|  +------------------------------------------------------------+  |
|  |                    Transport Layer                          |  |
|  |              (stdio / HTTP SSE / WebSocket)                 |  |
|  +------------------------------------------------------------+  |
|                                |                                  |
|  +------------------------------------------------------------+  |
|  |                    Core Services Layer                      |  |
|  |  +--------------+  +--------------+  +------------------+  |  |
|  |  | Tool Manager |  |Agent Manager |  | Command Router   |  |  |
|  |  +--------------+  +--------------+  +------------------+  |  |
|  |  +--------------+  +--------------+  +------------------+  |  |
|  |  | Hook Engine  |  |Template Engine| | Config Manager  |  |  |
|  |  +--------------+  +--------------+  +------------------+  |  |
|  +------------------------------------------------------------+  |
|                                |                                  |
|  +------------------------------------------------------------+  |
|  |                    Integration Layer                        |  |
|  |  +----------------+  +----------------+  +---------------+ |  |
|  |  | STM32CubeIDE   |  | ST Edge AI     |  | STM32Prog CLI | |  |
|  |  | Integration    |  | Integration    |  | Integration   | |  |
|  |  +----------------+  +----------------+  +---------------+ |  |
|  |  +----------------+  +----------------+  +---------------+ |  |
|  |  | OpenOCD/GDB    |  | QEMU/Simulator |  | File Systems  | |  |
|  |  | Integration    |  | Integration    |  | Integration   | |  |
|  |  +----------------+  +----------------+  +---------------+ |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
                                |
                                v
+------------------------------------------------------------------+
|                    External Tools & Services                      |
|  | STM32CubeIDE | ST Edge AI | STM32CubeProg | OpenOCD | GDB |   |
+------------------------------------------------------------------+
```

### 1.2 Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| Runtime | Node.js 20+ | Server execution |
| Language | TypeScript 5.x | Type-safe development |
| Protocol | MCP SDK | Model Context Protocol |
| Validation | Zod | Schema validation |
| Templates | Handlebars | Code generation |
| Testing | Vitest | Unit/integration tests |
| Build | tsup | TypeScript bundling |

### 1.3 Design Principles

1. **Modularity**: Each tool, agent, and command is independently deployable
2. **Extensibility**: Plugin system for custom tools and agents
3. **Fail-Safe**: Graceful degradation when external tools unavailable
4. **Stateless**: Core server is stateless, state managed by Claude Code
5. **Async-First**: All I/O operations are asynchronous

---

## 2. MCP Server Architecture

### 2.1 Server Structure

```typescript
// src/server/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

export class STM32N6DevServer {
  private server: Server;
  private toolManager: ToolManager;
  private agentManager: AgentManager;
  private commandRouter: CommandRouter;
  private hookEngine: HookEngine;
  private configManager: ConfigManager;

  constructor(config: ServerConfig) {
    this.server = new Server({
      name: 'stm32n6-dev',
      version: '1.0.0',
    }, {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    });

    this.initializeManagers(config);
    this.registerHandlers();
  }

  private initializeManagers(config: ServerConfig): void {
    this.configManager = new ConfigManager(config);
    this.toolManager = new ToolManager(this.configManager);
    this.agentManager = new AgentManager(this.configManager);
    this.commandRouter = new CommandRouter(this.toolManager, this.agentManager);
    this.hookEngine = new HookEngine(this.configManager);
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}
```

### 2.2 Directory Structure

```
stm32n6-dev-server/
├── src/
│   ├── index.ts                    # Entry point
│   ├── server/
│   │   ├── index.ts                # Server class
│   │   └── types.ts                # Server types
│   ├── tools/
│   │   ├── index.ts                # Tool exports
│   │   ├── base-tool.ts            # Base tool class
│   │   ├── stm32-build.ts          # Build tool
│   │   ├── stm32-flash.ts          # Flash tool
│   │   ├── stm32-debug.ts          # Debug tool
│   │   ├── peripheral-config.ts    # Peripheral config
│   │   ├── clock-config.ts         # Clock config
│   │   ├── model-convert.ts        # Model conversion
│   │   ├── model-quantize.ts       # Model quantization
│   │   ├── trace-analyze.ts        # Trace analysis
│   │   ├── register-inspect.ts     # Register inspection
│   │   └── memory-map.ts           # Memory mapping
│   ├── agents/
│   │   ├── index.ts                # Agent exports
│   │   ├── base-agent.ts           # Base agent class
│   │   ├── project-lead.ts         # Project lead agent
│   │   ├── stm32-architect.ts      # STM32 architect
│   │   ├── driver-developer.ts     # Driver developer
│   │   ├── ai-engineer.ts          # AI/ML engineer
│   │   ├── rtos-specialist.ts      # RTOS specialist
│   │   ├── debug-engineer.ts       # Debug engineer
│   │   └── test-engineer.ts        # Test engineer
│   ├── commands/
│   │   ├── index.ts                # Command exports
│   │   └── router.ts               # Command router
│   ├── hooks/
│   │   ├── index.ts                # Hook exports
│   │   └── engine.ts               # Hook engine
│   ├── templates/
│   │   ├── index.ts                # Template manager
│   │   ├── projects/               # Project templates
│   │   ├── drivers/                # Driver templates
│   │   ├── rtos/                   # RTOS templates
│   │   └── ml-pipelines/           # ML templates
│   ├── integrations/
│   │   ├── stm32cube-ide.ts        # IDE integration
│   │   ├── st-edge-ai.ts           # ST Edge AI integration
│   │   ├── stm32cube-prog.ts       # Programmer integration
│   │   └── openocd.ts              # OpenOCD integration
│   ├── utils/
│   │   ├── logger.ts               # Logging utility
│   │   ├── validator.ts            # Input validation
│   │   ├── executor.ts             # Command execution
│   │   └── parser.ts               # Output parsing
│   └── config/
│       ├── index.ts                # Config manager
│       ├── schema.ts               # Configuration schema
│       └── defaults.ts             # Default values
├── templates/                      # Template files (Handlebars)
├── tests/                          # Test files
├── package.json
├── tsconfig.json
└── README.md
```

### 2.3 Server Capabilities

```typescript
// Server capabilities exposed via MCP
const capabilities = {
  tools: {
    listChanged: true,  // Support tools/list_changed notification
  },
  resources: {
    subscribe: true,    // Support resource subscriptions
    listChanged: true,  // Support resources/list_changed
  },
  prompts: {
    listChanged: true,  // Support prompts/list_changed
  },
  logging: {},          // Support logging
};
```

---

## 3. Agent System Architecture

### 3.1 Agent Base Class

```typescript
// src/agents/base-agent.ts
import { z } from 'zod';

export interface AgentContext {
  projectPath: string;
  config: Record<string, unknown>;
  tools: ToolRegistry;
  logger: Logger;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  recommendations?: string[];
  nextSteps?: string[];
}

export abstract class BaseAgent {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly capabilities: string[];

  protected context: AgentContext;

  constructor(context: AgentContext) {
    this.context = context;
  }

  abstract execute(input: unknown): Promise<AgentResult>;

  protected log(level: 'info' | 'warn' | 'error', message: string): void {
    this.context.logger.log(level, `[${this.name}] ${message}`);
  }
}
```

### 3.2 Agent Interaction Patterns

```
+------------------+     +------------------+     +------------------+
|   User Request   |---->|   Claude Code    |---->|  MCP Server      |
+------------------+     +------------------+     +------------------+
                                                          |
                                                          v
                         +--------------------------------+
                         |        Agent Manager           |
                         |  +--------------------------+  |
                         |  | 1. Analyze request       |  |
                         |  | 2. Select appropriate    |  |
                         |  |    agent(s)              |  |
                         |  | 3. Load agent context    |  |
                         |  | 4. Execute agent         |  |
                         |  | 5. Return result         |  |
                         |  +--------------------------+  |
                         +--------------------------------+
                                    |
                    +---------------+---------------+
                    |               |               |
                    v               v               v
             +----------+   +----------+   +----------+
             | Agent A  |   | Agent B  |   | Agent C  |
             +----------+   +----------+   +----------+
```

### 3.3 Agent Collaboration Patterns

#### Sequential Collaboration
```
Request --> [Architect] --> [Driver Dev] --> [RTOS Specialist] --> Result
```

#### Parallel Collaboration
```
           +--> [AI Engineer] --+
Request -->|                    |--> Merge --> Result
           +--> [Debug Eng] ----+
```

#### Hierarchical Collaboration
```
                    +-- [Driver Dev]
Request --> [Lead] --+-- [RTOS Spec]
                    +-- [Test Eng]
```

### 3.4 Agent Context Injection

```typescript
// src/agents/agent-manager.ts
export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();

  async executeAgent(
    agentName: string,
    input: unknown,
    context: Partial<AgentContext>
  ): Promise<AgentResult> {
    const agent = this.agents.get(agentName);
    if (!agent) {
      throw new Error(`Agent not found: ${agentName}`);
    }

    // Inject context
    const fullContext: AgentContext = {
      projectPath: context.projectPath ?? process.cwd(),
      config: context.config ?? {},
      tools: this.toolRegistry,
      logger: this.logger,
    };

    // Execute with timeout
    return await Promise.race([
      agent.execute(input),
      this.timeout(30000, 'Agent execution timed out'),
    ]);
  }

  selectAgentsForTask(task: string): BaseAgent[] {
    // Analyze task and select appropriate agents
    const keywords = this.extractKeywords(task);
    return this.matchAgentsToKeywords(keywords);
  }
}
```

---

## 4. Tool Architecture

### 4.1 Tool Base Class

```typescript
// src/tools/base-tool.ts
import { z } from 'zod';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface ToolExecutionContext {
  workingDirectory: string;
  environment: Record<string, string>;
  timeout: number;
}

export interface ToolResult {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export abstract class BaseTool implements Tool {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly inputSchema: z.ZodType;

  async handler(
    params: unknown,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    // Validate input
    const validated = this.inputSchema.parse(params);

    // Execute tool
    const result = await this.execute(validated, context);

    // Format response
    return this.formatResult(result);
  }

  protected abstract execute(
    params: z.infer<this['inputSchema']>,
    context: ToolExecutionContext
  ): Promise<unknown>;

  protected formatResult(result: unknown): ToolResult {
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result, null, 2),
      }],
    };
  }
}
```

### 4.2 Tool Categories

```typescript
// Tool category definitions
export enum ToolCategory {
  BUILD = 'build',           // Compilation tools
  DEPLOY = 'deploy',         // Flash/debug tools
  CODE_GEN = 'codegen',      // Code generation tools
  AI_ML = 'aiml',            // AI/ML tools
  ANALYSIS = 'analysis',     // Analysis tools
  DEBUG = 'debug',           // Debugging tools
}

// Tool registry with categories
export const toolRegistry = {
  [ToolCategory.BUILD]: ['stm32_build'],
  [ToolCategory.DEPLOY]: ['stm32_flash', 'stm32_debug'],
  [ToolCategory.CODE_GEN]: ['peripheral_config', 'clock_config'],
  [ToolCategory.AI_ML]: ['model_convert', 'model_quantize'],
  [ToolCategory.ANALYSIS]: ['trace_analyze', 'memory_map'],
  [ToolCategory.DEBUG]: ['register_inspect'],
};
```

### 4.3 Tool Execution Pipeline

```
+-------------+     +---------------+     +---------------+
| MCP Request |---->| Tool Manager  |---->| Pre-Hooks     |
+-------------+     +---------------+     +---------------+
                                                |
+-------------+     +---------------+          v
| MCP Response|<----| Result Format |<---+----------+
+-------------+     +---------------+    |          |
                                         | Tool     |
+-------------+     +---------------+    | Execution|
| Post-Hooks  |<----| Tool Output   |<---+          |
+-------------+     +---------------+                |
```

### 4.4 Example Tool Implementation

```typescript
// src/tools/stm32-build.ts
import { z } from 'zod';
import { BaseTool, ToolCategory } from './base-tool.js';
import { executeCommand } from '../utils/executor.js';

const BuildInputSchema = z.object({
  projectPath: z.string().describe('Path to STM32 project'),
  buildType: z.enum(['Debug', 'Release', 'MinSizeRel']).default('Debug'),
  target: z.string().default('all'),
  verbose: z.boolean().default(false),
  clean: z.boolean().default(false),
});

type BuildInput = z.infer<typeof BuildInputSchema>;

export class STM32BuildTool extends BaseTool {
  readonly name = 'stm32_build';
  readonly description = 'Build STM32N6 project using GCC ARM toolchain';
  readonly inputSchema = BuildInputSchema;
  readonly category = ToolCategory.BUILD;

  protected async execute(
    params: BuildInput,
    context: ToolExecutionContext
  ): Promise<BuildResult> {
    // Detect project type (Makefile, CMake, STM32CubeIDE)
    const projectType = await this.detectProjectType(params.projectPath);

    // Build command based on project type
    const command = this.buildCommand(params, projectType);

    // Execute build
    const result = await executeCommand(command, {
      cwd: params.projectPath,
      timeout: context.timeout,
      env: { ...context.environment, ...this.getBuildEnv() },
    });

    // Parse output
    return this.parseBuildResult(result, params);
  }

  private detectProjectType(projectPath: string): Promise<ProjectType> {
    // Check for .project file (STM32CubeIDE)
    // Check for CMakeLists.txt (CMake)
    // Check for Makefile (Make)
  }

  private buildCommand(params: BuildInput, type: ProjectType): string[] {
    switch (type) {
      case 'cubeide':
        return [
          'stm32cubeide',
          '-nosplash',
          '-application', 'org.eclipse.cdt.managedbuilder.core.headlessbuild',
          '-build', params.buildType,
        ];
      case 'cmake':
        return ['cmake', '--build', 'build', '--config', params.buildType];
      case 'make':
        return ['make', params.target, `BUILD_TYPE=${params.buildType}`];
    }
  }
}
```

---

## 5. Command System Architecture

### 5.1 Command Router

```typescript
// src/commands/router.ts
export class CommandRouter {
  private commands: Map<string, CommandHandler> = new Map();

  registerCommand(command: string, handler: CommandHandler): void {
    this.commands.set(command, handler);
  }

  async route(command: string, args: string[]): Promise<CommandResult> {
    const handler = this.commands.get(command);
    if (!handler) {
      return {
        success: false,
        error: `Unknown command: ${command}`,
        availableCommands: Array.from(this.commands.keys()),
      };
    }

    return await handler.execute(args);
  }
}
```

### 5.2 Command Structure

```
.claude/commands/
├── build.md          # /build command
├── debug.md          # /debug command
├── flash.md          # /flash command
├── peripheral.md     # /peripheral command
├── clock.md          # /clock command
├── model.md          # /model command
├── test.md           # /test command
└── analyze.md        # /analyze command
```

### 5.3 Command Workflow

```typescript
// Example command implementation: /build
// .claude/commands/build.md content would expand to:

interface BuildCommandWorkflow {
  steps: [
    { action: 'validate', target: 'project_structure' },
    { action: 'check', target: 'toolchain_availability' },
    { action: 'execute', tool: 'stm32_build' },
    { action: 'parse', target: 'build_output' },
    { action: 'report', target: 'results_with_size_analysis' },
  ];

  errorHandling: {
    onToolchainNotFound: 'prompt_install',
    onBuildFailure: 'show_errors_and_suggestions',
    onWarning: 'display_but_continue',
  };

  hooks: {
    pre: ['validate_project'],
    post: ['analyze_build_output', 'update_memory_map'],
  };
}
```

---

## 6. Hook System Architecture

### 6.1 Hook Engine

```typescript
// src/hooks/engine.ts
export type HookTiming = 'pre' | 'post';
export type HookTrigger = 'tool' | 'command' | 'agent';

interface HookDefinition {
  name: string;
  timing: HookTiming;
  trigger: HookTrigger;
  target: string | RegExp;
  handler: HookHandler;
  priority: number;
}

export class HookEngine {
  private hooks: HookDefinition[] = [];

  registerHook(hook: HookDefinition): void {
    this.hooks.push(hook);
    this.hooks.sort((a, b) => b.priority - a.priority);
  }

  async executeHooks(
    timing: HookTiming,
    trigger: HookTrigger,
    target: string,
    context: HookContext
  ): Promise<HookResult> {
    const matchingHooks = this.hooks.filter(
      h => h.timing === timing &&
           h.trigger === trigger &&
           this.matchesTarget(h.target, target)
    );

    let result: HookResult = { proceed: true };

    for (const hook of matchingHooks) {
      const hookResult = await hook.handler(context);
      result = this.mergeResults(result, hookResult);

      if (!result.proceed) {
        break;
      }
    }

    return result;
  }

  private matchesTarget(pattern: string | RegExp, target: string): boolean {
    if (typeof pattern === 'string') {
      return pattern === target || pattern === '*';
    }
    return pattern.test(target);
  }
}
```

### 6.2 Hook Definitions

| Hook Name | Timing | Trigger | Target | Purpose |
|-----------|--------|---------|--------|---------|
| `validate_project` | pre | tool | stm32_build | Check project structure |
| `check_target_connection` | pre | tool | stm32_flash, stm32_debug | Verify debug probe |
| `backup_config` | pre | tool | peripheral_config | Save current config |
| `analyze_build_output` | post | tool | stm32_build | Parse warnings/errors |
| `log_flash_result` | post | tool | stm32_flash | Record statistics |
| `update_memory_map` | post | tool | stm32_build | Update usage display |

### 6.3 Hook Implementation Example

```typescript
// src/hooks/validate-project.ts
export const validateProjectHook: HookDefinition = {
  name: 'validate_project',
  timing: 'pre',
  trigger: 'tool',
  target: 'stm32_build',
  priority: 100,
  handler: async (context: HookContext): Promise<HookResult> => {
    const projectPath = context.params.projectPath;

    // Check for required files
    const requiredFiles = [
      'Core/Src/main.c',
      'Core/Inc/main.h',
    ];

    const missing = await checkFiles(projectPath, requiredFiles);

    if (missing.length > 0) {
      return {
        proceed: false,
        error: `Missing required files: ${missing.join(', ')}`,
        suggestions: [
          'Run /project-init to create a new project',
          'Verify the project path is correct',
        ],
      };
    }

    return { proceed: true };
  },
};
```

---

## 7. Template System Architecture

### 7.1 Template Engine

```typescript
// src/templates/index.ts
import Handlebars from 'handlebars';
import { readFile } from 'fs/promises';
import { glob } from 'glob';

export class TemplateEngine {
  private templates: Map<string, HandlebarsTemplateDelegate> = new Map();
  private partials: Map<string, string> = new Map();

  async loadTemplates(templateDir: string): Promise<void> {
    const files = await glob(`${templateDir}/**/*.hbs`);

    for (const file of files) {
      const content = await readFile(file, 'utf-8');
      const name = this.getTemplateName(file, templateDir);
      this.templates.set(name, Handlebars.compile(content));
    }
  }

  render(templateName: string, context: TemplateContext): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }
    return template(context);
  }
}
```

### 7.2 Template Categories

```
templates/
├── projects/
│   ├── base/
│   │   ├── main.c.hbs
│   │   ├── main.h.hbs
│   │   ├── system_stm32n6xx.c.hbs
│   │   └── linker.ld.hbs
│   ├── freertos/
│   │   ├── FreeRTOSConfig.h.hbs
│   │   ├── freertos.c.hbs
│   │   └── task_template.c.hbs
│   ├── ai-ml/
│   │   ├── ai_main.c.hbs
│   │   └── model_wrapper.c.hbs
│   └── networking/
│       ├── lwip.c.hbs
│       └── ethernetif.c.hbs
├── drivers/
│   ├── i2c/
│   │   ├── i2c_driver.h.hbs
│   │   └── i2c_driver.c.hbs
│   ├── spi/
│   ├── can/
│   ├── ethernet/
│   ├── dsi/
│   └── csi/
├── rtos/
│   ├── task.c.hbs
│   ├── queue.c.hbs
│   └── semaphore.c.hbs
└── ml-pipelines/
    ├── image_classification.c.hbs
    ├── object_detection.c.hbs
    └── inference_wrapper.c.hbs
```

### 7.3 Template Context Schema

```typescript
interface TemplateContext {
  // Project metadata
  projectName: string;
  targetMCU: string;
  author: string;
  date: string;

  // Clock configuration
  sysclk: number;
  ahbPrescaler: number;
  apb1Prescaler: number;
  apb2Prescaler: number;

  // Peripheral configuration
  peripherals: PeripheralConfig[];

  // RTOS configuration
  rtos?: {
    enabled: boolean;
    tickRate: number;
    totalHeapSize: number;
    maxPriorities: number;
  };

  // Custom user data
  custom?: Record<string, unknown>;
}

interface PeripheralConfig {
  name: string;
  type: string;
  mode: string;
  pins: PinConfig[];
  dma?: DMAConfig;
  interrupts?: InterruptConfig[];
}
```

---

## 8. Configuration Management

### 8.1 Configuration Schema

```typescript
// src/config/schema.ts
import { z } from 'zod';

export const STM32N6ConfigSchema = z.object({
  // Server configuration
  server: z.object({
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    timeout: z.number().default(60000),
  }),

  // Toolchain paths
  toolchain: z.object({
    stm32cubeIdePath: z.string().optional(),
    gccArmPath: z.string().optional(),
    stm32cubeProgPath: z.string().optional(),
    stEdgeAiPath: z.string().optional(),
    openocdPath: z.string().optional(),
  }),

  // Target configuration
  target: z.object({
    mcu: z.string().default('STM32N6570'),
    board: z.string().default('STM32N6570-DK'),
    flashBase: z.string().default('0x08000000'),
    ramBase: z.string().default('0x20000000'),
  }),

  // Debug configuration
  debug: z.object({
    probe: z.enum(['stlink', 'jlink', 'ulink']).default('stlink'),
    interface: z.enum(['swd', 'jtag']).default('swd'),
    speed: z.number().default(4000),
    swoEnabled: z.boolean().default(true),
  }),

  // Build configuration
  build: z.object({
    defaultBuildType: z.enum(['Debug', 'Release', 'MinSizeRel']).default('Debug'),
    parallelJobs: z.number().default(4),
    warningsAsErrors: z.boolean().default(false),
  }),

  // ST Edge AI configuration
  edgeAi: z.object({
    developerCloudApi: z.string().optional(),
    defaultQuantization: z.enum(['int8', 'int4', 'mixed']).default('int8'),
    optimizeFor: z.enum(['latency', 'memory', 'balanced']).default('balanced'),
  }),
});

export type STM32N6Config = z.infer<typeof STM32N6ConfigSchema>;
```

### 8.2 Configuration Resolution Order

```
1. Default values (hardcoded)
2. Global config (~/.stm32n6-dev/config.json)
3. Project config (.stm32n6-dev/config.json)
4. Environment variables (STM32N6_*)
5. Command-line arguments (highest priority)
```

### 8.3 Configuration Manager

```typescript
// src/config/manager.ts
export class ConfigManager {
  private config: STM32N6Config;

  constructor(options: Partial<STM32N6Config> = {}) {
    this.config = this.resolveConfig(options);
  }

  private resolveConfig(options: Partial<STM32N6Config>): STM32N6Config {
    const defaults = this.getDefaults();
    const global = this.loadGlobalConfig();
    const project = this.loadProjectConfig();
    const env = this.loadFromEnvironment();

    return {
      ...defaults,
      ...global,
      ...project,
      ...env,
      ...options,
    };
  }

  get<K extends keyof STM32N6Config>(key: K): STM32N6Config[K] {
    return this.config[key];
  }

  set<K extends keyof STM32N6Config>(
    key: K,
    value: STM32N6Config[K]
  ): void {
    this.config[key] = value;
  }
}
```

---

## 9. Integration Architecture

### 9.1 STM32CubeIDE Integration

```typescript
// src/integrations/stm32cube-ide.ts
export class STM32CubeIDEIntegration {
  private idePath: string;

  constructor(idePath: string) {
    this.idePath = idePath;
  }

  async importProject(projectPath: string): Promise<ImportResult> {
    const command = [
      this.getExecutable(),
      '--launcher.suppressErrors',
      '-nosplash',
      '-application', 'org.eclipse.cdt.managedbuilder.core.headlessbuild',
      '-import', projectPath,
    ];

    return await this.execute(command);
  }

  async buildProject(
    projectName: string,
    config: string
  ): Promise<BuildResult> {
    const command = [
      this.getExecutable(),
      '--launcher.suppressErrors',
      '-nosplash',
      '-application', 'org.eclipse.cdt.managedbuilder.core.headlessbuild',
      '-build', `${projectName}/${config}`,
    ];

    return await this.execute(command);
  }

  private getExecutable(): string {
    return process.platform === 'win32'
      ? `${this.idePath}/stm32cubeidec.exe`
      : `${this.idePath}/stm32cubeide`;
  }
}
```

### 9.2 ST Edge AI Integration

```typescript
// src/integrations/st-edge-ai.ts
export class STEdgeAIIntegration {
  private cliPath: string;
  private cloudApiUrl?: string;

  async convertModel(params: ConvertParams): Promise<ConvertResult> {
    // Use local CLI or cloud API based on availability
    if (this.cloudApiUrl) {
      return await this.convertViaCloud(params);
    }
    return await this.convertViaCLI(params);
  }

  private async convertViaCLI(params: ConvertParams): Promise<ConvertResult> {
    const command = [
      this.cliPath,
      'convert',
      '--model', params.inputModel,
      '--target', 'STM32N6570',
      '--output', params.outputPath,
      '--format', params.outputFormat,
    ];

    const result = await executeCommand(command);
    return this.parseConvertResult(result);
  }

  private async convertViaCloud(params: ConvertParams): Promise<ConvertResult> {
    // REST API call to ST Edge AI Developer Cloud
    const response = await fetch(`${this.cloudApiUrl}/convert`, {
      method: 'POST',
      body: createMultipartForm(params),
    });

    return await response.json();
  }
}
```

### 9.3 STM32CubeProgrammer Integration

```typescript
// src/integrations/stm32cube-prog.ts
export class STM32CubeProgrammerIntegration {
  private cliPath: string;

  async connect(options: ConnectOptions): Promise<ConnectResult> {
    const command = [
      this.cliPath,
      '-c',
      `port=${options.interface}`,
      `speed=${options.speed}`,
      '-q',  // Quiet mode
    ];

    return await this.executeWithRetry(command, options.retries);
  }

  async flash(binaryPath: string, options: FlashOptions): Promise<FlashResult> {
    const command = [
      this.cliPath,
      '-c', `port=${options.interface}`,
      '-w', binaryPath, options.address ?? '0x08000000',
      '-v',  // Verify
      options.reset ? '-rst' : '',
    ].filter(Boolean);

    return await this.execute(command);
  }

  async readMemory(
    address: string,
    size: number,
    outputPath: string
  ): Promise<ReadResult> {
    const command = [
      this.cliPath,
      '-c', 'port=SWD',
      '-r', address, size.toString(), outputPath,
    ];

    return await this.execute(command);
  }

  async readRegister(peripheral: string, register: string): Promise<number> {
    // Read peripheral register via CLI
    const address = this.getPeripheralAddress(peripheral, register);
    const result = await this.readMemory(address, 4, '-');
    return parseInt(result.data, 16);
  }
}
```

### 9.4 Debug Probe Integration

```typescript
// src/integrations/openocd.ts
export class OpenOCDIntegration {
  private openocdPath: string;
  private configDir: string;

  async startGDBServer(options: GDBServerOptions): Promise<GDBServerResult> {
    const configFiles = this.getConfigFiles(options);

    const command = [
      this.openocdPath,
      '-f', configFiles.interface,
      '-f', configFiles.target,
      '-c', `adapter speed ${options.speed}`,
      '-c', 'gdb_port 3333',
      '-c', 'telnet_port 4444',
    ];

    // Start as background process
    return await this.startBackground(command);
  }

  async attachDebugger(options: AttachOptions): Promise<void> {
    // Configure GDB to connect to OpenOCD
    const gdbCommands = [
      'target remote localhost:3333',
      'monitor reset halt',
      'load',
      'break main',
      'continue',
    ];

    await this.executeGDB(gdbCommands, options.elfPath);
  }

  private getConfigFiles(options: GDBServerOptions): ConfigFiles {
    const probe = options.probe === 'stlink' ? 'stlink' : 'jlink';
    return {
      interface: `${this.configDir}/interface/${probe}.cfg`,
      target: `${this.configDir}/target/stm32n6x.cfg`,
    };
  }
}
```

---

## 10. Data Flow Diagrams

### 10.1 Build Workflow

```
User Request: /build Debug
        |
        v
+-------------------+
| Command Router    |
| Parse: build=Debug|
+-------------------+
        |
        v
+-------------------+     +------------------+
| Pre-Hook Engine   |---->| validate_project |
+-------------------+     +------------------+
        |
        v
+-------------------+
| Tool Manager      |
| Select: stm32_build|
+-------------------+
        |
        v
+-------------------+     +------------------+
| STM32BuildTool    |---->| Detect Project   |
+-------------------+     +------------------+
        |                        |
        v                        v
+-------------------+     +------------------+
| Build Command     |---->| Execute Build    |
| Generation        |     | (CubeIDE/Make)   |
+-------------------+     +------------------+
        |                        |
        v                        v
+-------------------+     +------------------+
| Parse Build       |---->| Size Analysis    |
| Output            |     +------------------+
+-------------------+
        |
        v
+-------------------+     +------------------+
| Post-Hook Engine  |---->| analyze_output   |
+-------------------+     | update_memory_map|
                          +------------------+
        |
        v
+-------------------+
| Format Result     |
| Return to Claude  |
+-------------------+
```

### 10.2 Model Deployment Workflow

```
User Request: /model deploy model.onnx --quantize int8
        |
        v
+-------------------+
| Command Router    |
| Parse: action=deploy|
|       model=model.onnx |
|       quantize=int8 |
+-------------------+
        |
        v
+-------------------+
| Agent Manager     |
| Select: AI Engineer|
+-------------------+
        |
        v
+-------------------+
| AI Engineer Agent |
| Step 1: Analyze   |
+-------------------+
        | --> model_convert tool
        v
+-------------------+
| Model Convert     |
| ONNX -> ST Edge AI|
+-------------------+
        |
        v
+-------------------+
| AI Engineer Agent |
| Step 2: Quantize  |
+-------------------+
        | --> model_quantize tool
        v
+-------------------+
| Model Quantize    |
| int8 quantization |
| with calibration  |
+-------------------+
        |
        v
+-------------------+
| AI Engineer Agent |
| Step 3: Generate  |
+-------------------+
        | --> Template Engine
        v
+-------------------+
| Generate C Code   |
| model_wrapper.c/h |
| inference_api.c/h |
+-------------------+
        |
        v
+-------------------+
| Return Result     |
| Files generated   |
| Integration guide |
+-------------------+
```

### 10.3 Debug Session Workflow

```
User Request: /debug firmware.elf --probe stlink --swv
        |
        v
+-------------------+
| Pre-Hook Engine   |
| check_target_conn |
+-------------------+
        |
        v
+-------------------+
| Debug Engineer    |
| Agent             |
+-------------------+
        |
        +-----> OpenOCD Integration
        |       Start GDB server
        |
        +-----> GDB Integration
        |       Connect to target
        |       Load symbols
        |
        v
+-------------------+
| Debug Session     |
| Active            |
+-------------------+
        |
        | User commands:
        | - break main
        | - continue
        | - step
        | - inspect variable
        |
        v
+-------------------+
| SWV/Trace Capture |
| (if enabled)      |
+-------------------+
        |
        v
+-------------------+
| trace_analyze tool|
| Performance report|
+-------------------+
```

---

## 11. Security Architecture

### 11.1 Input Validation

```typescript
// All tool inputs are validated using Zod schemas
const validatedInput = InputSchema.parse(rawInput);

// Path traversal prevention
function sanitizePath(path: string): string {
  const resolved = resolve(path);
  if (!resolved.startsWith(ALLOWED_BASE_DIR)) {
    throw new SecurityError('Path traversal detected');
  }
  return resolved;
}

// Command injection prevention
function sanitizeCommand(args: string[]): string[] {
  return args.map(arg => {
    if (/[;&|`$()]/.test(arg)) {
      throw new SecurityError('Potential command injection');
    }
    return arg;
  });
}
```

### 11.2 Secure Credential Handling

```typescript
// API keys and credentials are never logged or stored in plain text
class CredentialManager {
  private keytar: typeof import('keytar');

  async storeCredential(service: string, key: string, value: string): Promise<void> {
    await this.keytar.setPassword(service, key, value);
  }

  async getCredential(service: string, key: string): Promise<string | null> {
    return await this.keytar.getPassword(service, key);
  }
}
```

### 11.3 Process Isolation

```typescript
// External tools run in isolated subprocesses
const result = await spawn(toolPath, args, {
  cwd: workingDirectory,
  env: sanitizedEnvironment,
  timeout: timeout,
  // No shell interpretation
  shell: false,
});
```

---

## 12. Error Handling Architecture

### 12.1 Error Categories

```typescript
enum ErrorCategory {
  VALIDATION = 'validation',     // Input validation errors
  TOOLCHAIN = 'toolchain',       // Tool not found, version mismatch
  BUILD = 'build',               // Compilation errors
  CONNECTION = 'connection',     // Debug probe, network errors
  INTEGRATION = 'integration',   // External tool errors
  INTERNAL = 'internal',         // Plugin internal errors
}

class STM32N6Error extends Error {
  constructor(
    public category: ErrorCategory,
    message: string,
    public suggestions: string[] = [],
    public cause?: Error
  ) {
    super(message);
  }
}
```

### 12.2 Error Recovery Strategies

```typescript
const recoveryStrategies: Record<ErrorCategory, RecoveryStrategy> = {
  [ErrorCategory.VALIDATION]: {
    action: 'prompt_user',
    message: 'Please provide valid input',
  },
  [ErrorCategory.TOOLCHAIN]: {
    action: 'suggest_install',
    message: 'Tool not found. Would you like to install it?',
  },
  [ErrorCategory.BUILD]: {
    action: 'show_errors',
    message: 'Build failed. Showing errors...',
    parser: parseBuildErrors,
  },
  [ErrorCategory.CONNECTION]: {
    action: 'retry_with_backoff',
    maxRetries: 3,
    backoffMs: 1000,
  },
  [ErrorCategory.INTEGRATION]: {
    action: 'fallback',
    alternatives: ['use_cloud_api', 'use_local_tool'],
  },
};
```

### 12.3 Error Response Format

```typescript
interface ErrorResponse {
  success: false;
  error: {
    category: ErrorCategory;
    code: string;
    message: string;
    details?: unknown;
    suggestions: string[];
    documentation?: string;
  };
}

// Example error response
const errorResponse: ErrorResponse = {
  success: false,
  error: {
    category: ErrorCategory.BUILD,
    code: 'COMPILATION_ERROR',
    message: 'Compilation failed with 3 errors',
    details: {
      errors: [
        { file: 'main.c', line: 42, message: 'undefined variable' },
        { file: 'driver.c', line: 15, message: 'type mismatch' },
      ],
    },
    suggestions: [
      'Check that all variables are declared before use',
      'Verify function return types match their declarations',
    ],
    documentation: 'https://docs.example.com/errors/compilation',
  },
};
```

---

## Appendix A: Type Definitions

```typescript
// src/types/index.ts

// Build types
export interface BuildResult {
  success: boolean;
  output: string;
  binaryPath?: string;
  errors: BuildError[];
  warnings: BuildWarning[];
  sizeReport?: MemoryUsage;
}

export interface BuildError {
  file: string;
  line: number;
  column: number;
  message: string;
  code?: string;
}

export interface MemoryUsage {
  text: number;
  data: number;
  bss: number;
  total: number;
  flash: number;
  ram: number;
}

// Debug types
export interface DebugSession {
  id: string;
  elfPath: string;
  probe: DebugProbe;
  status: DebugStatus;
  breakpoints: Breakpoint[];
}

export interface Breakpoint {
  id: number;
  file?: string;
  line?: number;
  address?: number;
  condition?: string;
  enabled: boolean;
}

// Model types
export interface ModelInfo {
  name: string;
  framework: 'onnx' | 'tflite' | 'pytorch' | 'keras';
  inputShape: number[];
  outputShape: number[];
  parameters: number;
  operations: string[];
}

export interface QuantizationResult {
  outputPath: string;
  originalSize: number;
  quantizedSize: number;
  compressionRatio: number;
  accuracyMetrics?: AccuracyMetrics;
}

// Peripheral types
export interface PeripheralConfig {
  name: string;
  instance: string;
  mode: string;
  pins: PinAssignment[];
  clock: ClockConfig;
  dma?: DMAChannel;
  interrupts?: InterruptConfig[];
}

export interface PinAssignment {
  pin: string;
  mode: string;
  pull?: 'none' | 'up' | 'down';
  speed?: 'low' | 'medium' | 'high' | 'very_high';
  alternate?: number;
}
```

---

## Appendix B: API Versioning Strategy

| Component | Version Format | Compatibility |
|-----------|---------------|---------------|
| MCP Server | Semantic (1.0.0) | Backward compatible |
| Tools | Per-tool versioning | Independent evolution |
| Templates | Git-based versioning | Branch per major version |
| Config Schema | Schema version field | Migration on change |

---

*Document Status: Phase 2 - Architecture Design*
*Next Phase: API Reference Documentation*
