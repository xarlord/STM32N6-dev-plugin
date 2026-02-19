#!/usr/bin/env node

/**
 * STM32N6 Development MCP Server
 *
 * Provides Claude Code with specialized capabilities for STM32N6570-DK development
 * including CPU/NPU/GPU programming, peripheral drivers, RTOS, and ML deployment.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { ConfigManager } from './config/manager.js';
import { ToolManager } from './tools/manager.js';
import { AgentManager } from './agents/manager.js';
import { HookEngine } from './hooks/engine.js';
import { TemplateEngine } from './templates/engine.js';
import { Logger } from './utils/logger.js';
import { registerAllTools } from './tools/index.js';
import { registerAllAgents } from './agents/index.js';
import { registerAllHooks } from './hooks/index.js';

// Server version
const SERVER_VERSION = '1.0.0';

export interface ServerContext {
  config: ConfigManager;
  tools: ToolManager;
  agents: AgentManager;
  hooks: HookEngine;
  templates: TemplateEngine;
  logger: Logger;
}

export class STM32N6DevServer {
  private server: Server;
  private context: ServerContext;

  constructor() {
    this.server = new Server(
      {
        name: 'stm32n6-dev',
        version: SERVER_VERSION,
      },
      {
        capabilities: {
          tools: {},
          resources: {},
          prompts: {},
        },
      }
    );

    this.context = this.initializeContext();
    this.registerHandlers();
  }

  private initializeContext(): ServerContext {
    const logger = new Logger('info');
    const config = new ConfigManager();
    const tools = new ToolManager();
    const agents = new AgentManager();
    const hooks = new HookEngine();
    const templates = new TemplateEngine();

    // Register all components
    registerAllTools(tools, config);
    registerAllAgents(agents, config);
    registerAllHooks(hooks);

    return {
      config,
      tools,
      agents,
      hooks,
      templates,
      logger,
    };
  }

  private registerHandlers(): void {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      const tools = this.context.tools.listAll();
      return {
        tools: tools.map((tool) => ({
          name: tool.name,
          description: tool.description,
          inputSchema: tool.inputSchema,
        })),
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        // Execute pre-hooks
        const preResult = await this.context.hooks.execute('pre', 'tool', name, {
          params: args ?? {},
          environment: process.env as Record<string, string>,
          projectPath: process.cwd(),
        });

        if (!preResult.proceed) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify({
                  success: false,
                  error: preResult.error ?? 'Pre-hook blocked execution',
                  suggestions: preResult.suggestions ?? [],
                }),
              },
            ],
            isError: true,
          };
        }

        // Execute tool
        const result = await this.context.tools.execute(name, args ?? {}, this.context);

        // Execute post-hooks
        await this.context.hooks.execute('post', 'tool', name, {
          params: args ?? {},
          result,
          environment: process.env as Record<string, string>,
          projectPath: process.cwd(),
        });

        const typedResult = result as { success?: boolean };
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
          isError: typedResult.success === false,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        this.context.logger.error(`Tool execution failed: ${errorMessage}`);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                success: false,
                error: errorMessage,
                category: 'internal',
              }),
            },
          ],
          isError: true,
        };
      }
    });

    // List resources handler
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      return {
        resources: [
          {
            uri: 'stm32n6://config',
            name: 'STM32N6 Configuration',
            mimeType: 'application/json',
          },
          {
            uri: 'stm32n6://templates',
            name: 'Available Templates',
            mimeType: 'application/json',
          },
          {
            uri: 'stm32n6://agents',
            name: 'Available Agents',
            mimeType: 'application/json',
          },
        ],
      };
    });

    // Read resource handler
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;

      switch (uri) {
        case 'stm32n6://config':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.context.config.getAll(), null, 2),
              },
            ],
          };
        case 'stm32n6://templates':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.context.templates.listAll(), null, 2),
              },
            ],
          };
        case 'stm32n6://agents':
          return {
            contents: [
              {
                uri,
                mimeType: 'application/json',
                text: JSON.stringify(this.context.agents.listAll(), null, 2),
              },
            ],
          };
        default:
          throw new Error(`Unknown resource: ${uri}`);
      }
    });

    // List prompts handler
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => {
      return {
        prompts: [
          {
            name: 'stm32n6-project-setup',
            description: 'Initialize a new STM32N6 project with proper structure',
            arguments: [
              {
                name: 'projectName',
                description: 'Name of the project',
                required: true,
              },
              {
                name: 'template',
                description: 'Project template (base, freertos, aiml, graphics, networking)',
                required: false,
              },
            ],
          },
          {
            name: 'stm32n6-driver-create',
            description: 'Generate peripheral driver code',
            arguments: [
              {
                name: 'peripheral',
                description: 'Peripheral type (I2C, SPI, UART, CAN, etc.)',
                required: true,
              },
              {
                name: 'mode',
                description: 'Operating mode (master, slave, etc.)',
                required: true,
              },
            ],
          },
          {
            name: 'stm32n6-model-deploy',
            description: 'Deploy ML model to Neural-ART NPU',
            arguments: [
              {
                name: 'modelPath',
                description: 'Path to the model file',
                required: true,
              },
              {
                name: 'quantize',
                description: 'Quantization scheme (int8, int4, mixed)',
                required: false,
              },
            ],
          },
        ],
      };
    });

    // Get prompt handler
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'stm32n6-project-setup':
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Initialize a new STM32N6 project named "${args?.projectName ?? 'my_project'}" using the ${args?.template ?? 'base'} template. Create the directory structure, copy HAL drivers, and generate startup code for STM32N6570-DK.`,
                },
              },
            ],
          };
        case 'stm32n6-driver-create':
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Generate a ${args?.peripheral ?? 'I2C'} driver for STM32N6 in ${args?.mode ?? 'master'} mode. Include DMA support and interrupt handlers.`,
                },
              },
            ],
          };
        case 'stm32n6-model-deploy':
          return {
            messages: [
              {
                role: 'user',
                content: {
                  type: 'text',
                  text: `Deploy the ML model at "${args?.modelPath ?? 'model.onnx'}" to STM32N6 Neural-ART NPU. Apply ${args?.quantize ?? 'int8'} quantization for optimal performance.`,
                },
              },
            ],
          };
        default:
          throw new Error(`Unknown prompt: ${name}`);
      }
    });
  }

  async start(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    this.context.logger.info('STM32N6 Development MCP Server started');
  }
}

// Main entry point
async function main(): Promise<void> {
  const server = new STM32N6DevServer();
  await server.start();
}

main().catch((error) => {
  console.error('Server failed to start:', error);
  process.exit(1);
});
