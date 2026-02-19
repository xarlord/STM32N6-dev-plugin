/**
 * Tool Manager for STM32N6 Development Server
 */

import type { ServerContext } from '../index.js';
import { BaseTool, ToolCategory, ToolExecutionContext } from './base.js';

/**
 * Tool registration info
 */
interface ToolRegistration {
  tool: BaseTool;
  enabled: boolean;
}

/**
 * Tool Manager
 * Handles tool registration, discovery, and execution
 */
export class ToolManager {
  private tools: Map<string, ToolRegistration> = new Map();

  /**
   * Register a tool
   */
  register(tool: BaseTool): void {
    if (this.tools.has(tool.name)) {
      throw new Error(`Tool already registered: ${tool.name}`);
    }
    this.tools.set(tool.name, { tool, enabled: true });
  }

  /**
   * Unregister a tool
   */
  unregister(name: string): boolean {
    return this.tools.delete(name);
  }

  /**
   * Enable or disable a tool
   */
  setEnabled(name: string, enabled: boolean): void {
    const registration = this.tools.get(name);
    if (registration) {
      registration.enabled = enabled;
    }
  }

  /**
   * Check if a tool is registered and enabled
   */
  isAvailable(name: string): boolean {
    const registration = this.tools.get(name);
    return registration !== undefined && registration.enabled;
  }

  /**
   * Get a tool by name
   */
  get(name: string): BaseTool | undefined {
    const registration = this.tools.get(name);
    return registration?.tool;
  }

  /**
   * List all registered tools
   */
  listAll(): BaseTool[] {
    return Array.from(this.tools.values()).map((r) => r.tool);
  }

  /**
   * List tools by category
   */
  listByCategory(category: ToolCategory): BaseTool[] {
    return Array.from(this.tools.values())
      .filter((r) => r.tool.category === category && r.enabled)
      .map((r) => r.tool);
  }

  /**
   * List enabled tools
   */
  listEnabled(): BaseTool[] {
    return Array.from(this.tools.values())
      .filter((r) => r.enabled)
      .map((r) => r.tool);
  }

  /**
   * Execute a tool by name
   */
  async execute(
    name: string,
    params: Record<string, unknown>,
    serverContext: ServerContext
  ): Promise<unknown> {
    const registration = this.tools.get(name);

    if (!registration) {
      return {
        success: false,
        error: {
          code: '1002',
          message: `Unknown tool: ${name}`,
          category: 'validation',
          suggestions: [`Available tools: ${Array.from(this.tools.keys()).join(', ')}`],
        },
      };
    }

    if (!registration.enabled) {
      return {
        success: false,
        error: {
          code: '1003',
          message: `Tool is disabled: ${name}`,
          category: 'validation',
        },
      };
    }

    const context: ToolExecutionContext = {
      workingDirectory: process.cwd(),
      environment: process.env as Record<string, string>,
      timeout: serverContext.config.get('server').timeout,
      serverContext,
    };

    const result = await registration.tool.handler(params, context);

    // Parse the result content
    if (result.content.length > 0 && result.content[0]?.type === 'text' && result.content[0].text) {
      try {
        return JSON.parse(result.content[0].text);
      } catch {
        return result.content[0].text;
      }
    }

    return { success: true };
  }

  /**
   * Get tool count
   */
  get count(): number {
    return this.tools.size;
  }

  /**
   * Get tools grouped by category
   */
  getByCategory(): Record<ToolCategory, BaseTool[]> {
    const result: Record<ToolCategory, BaseTool[]> = {
      [ToolCategory.BUILD]: [],
      [ToolCategory.DEPLOY]: [],
      [ToolCategory.CODE_GEN]: [],
      [ToolCategory.AI_ML]: [],
      [ToolCategory.ANALYSIS]: [],
      [ToolCategory.DEBUG]: [],
    };

    for (const registration of this.tools.values()) {
      if (registration.enabled) {
        result[registration.tool.category].push(registration.tool);
      }
    }

    return result;
  }
}
