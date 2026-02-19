/**
 * Base Tool class for STM32N6 Development Server
 */

import { z } from 'zod';
import type { ServerContext } from '../index.js';

/**
 * Tool execution context
 */
export interface ToolExecutionContext {
  workingDirectory: string;
  environment: Record<string, string>;
  timeout: number;
  serverContext: ServerContext;
}

/**
 * Tool result content
 */
export interface ToolResultContent {
  type: 'text' | 'image' | 'resource';
  text?: string;
  data?: string;
  mimeType?: string;
}

/**
 * Tool result
 */
export interface ToolResult {
  content: ToolResultContent[];
  isError?: boolean;
}

/**
 * Tool definition interface
 */
export interface ToolDefinition {
  name: string;
  description: string;
  inputSchema: z.ZodType;
  category: ToolCategory;
}

/**
 * Tool categories
 */
export enum ToolCategory {
  BUILD = 'build',
  DEPLOY = 'deploy',
  CODE_GEN = 'codegen',
  AI_ML = 'aiml',
  ANALYSIS = 'analysis',
  DEBUG = 'debug',
}

/**
 * Base Tool abstract class
 * All tools must extend this class
 */
export abstract class BaseTool implements ToolDefinition {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly inputSchema: z.ZodType;
  abstract readonly category: ToolCategory;

  /**
   * Main handler called by the MCP server
   */
  async handler(
    params: unknown,
    context: ToolExecutionContext
  ): Promise<ToolResult> {
    try {
      // Validate input
      const validated = this.inputSchema.parse(params);

      // Execute tool
      const result = await this.execute(validated, context);

      // Format and return result
      return this.formatResult(result);
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Tool execution logic - must be implemented by subclasses
   */
  protected abstract execute(
    params: z.infer<this['inputSchema']>,
    context: ToolExecutionContext
  ): Promise<unknown>;

  /**
   * Format result for MCP response
   */
  protected formatResult(result: unknown): ToolResult {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
      isError: this.isErrorResult(result),
    };
  }

  /**
   * Check if result indicates an error
   */
  protected isErrorResult(result: unknown): boolean {
    if (typeof result === 'object' && result !== null) {
      return 'success' in result && result.success === false;
    }
    return false;
  }

  /**
   * Handle errors during execution
   */
  protected handleError(error: unknown): ToolResult {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              success: false,
              error: {
                code: '1001',
                message: 'Invalid input parameters',
                category: 'validation',
                details: error.errors.map((e) => ({
                  path: e.path.join('.'),
                  message: e.message,
                })),
              },
            }),
          },
        ],
        isError: true,
      };
    }

    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            success: false,
            error: {
              code: '9001',
              message: errorMessage,
              category: 'internal',
            },
          }),
        },
      ],
      isError: true,
    };
  }

  /**
   * Get JSON Schema representation for MCP
   */
  getJsonSchema(): Record<string, unknown> {
    // Convert Zod schema to JSON Schema
    return zodToJsonSchema(this.inputSchema);
  }
}

/**
 * Simple Zod to JSON Schema converter
 */
function zodToJsonSchema(schema: z.ZodType): Record<string, unknown> {
  if (schema instanceof z.ZodObject) {
    const properties: Record<string, unknown> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(schema.shape)) {
      properties[key] = zodToJsonSchema(value as z.ZodType);
      // Check if field is optional
      if (!(value instanceof z.ZodOptional)) {
        required.push(key);
      }
    }

    return {
      type: 'object',
      properties,
      required: required.length > 0 ? required : undefined,
    };
  }

  if (schema instanceof z.ZodString) {
    return { type: 'string' };
  }

  if (schema instanceof z.ZodNumber) {
    return { type: 'number' };
  }

  if (schema instanceof z.ZodBoolean) {
    return { type: 'boolean' };
  }

  if (schema instanceof z.ZodArray) {
    return {
      type: 'array',
      items: zodToJsonSchema(schema.element),
    };
  }

  if (schema instanceof z.ZodEnum) {
    return {
      type: 'string',
      enum: schema.options,
    };
  }

  if (schema instanceof z.ZodNativeEnum) {
    return {
      type: 'string',
      enum: Object.values(schema.enum),
    };
  }

  if (schema instanceof z.ZodOptional) {
    return zodToJsonSchema(schema.unwrap());
  }

  if (schema instanceof z.ZodDefault) {
    const inner = zodToJsonSchema(schema._def.innerType);
    return {
      ...inner,
      default: schema._def.defaultValue(),
    };
  }

  if (schema instanceof z.ZodLiteral) {
    return {
      type: typeof schema.value as 'string' | 'number' | 'boolean',
      const: schema.value,
    };
  }

  // Fallback
  return { type: 'object' };
}
