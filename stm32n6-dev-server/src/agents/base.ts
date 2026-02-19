/**
 * Base Agent class for STM32N6 Development Server
 */

import type { ServerContext } from '../index.js';
import type { AgentResult, GeneratedFile } from '../types/index.js';

/**
 * Agent definition interface
 */
export interface AgentDefinition {
  name: string;
  description: string;
  capabilities: string[];
  expertise: string[];
}

/**
 * Agent input
 */
export interface AgentInput {
  task: string;
  parameters?: Record<string, unknown>;
  constraints?: {
    timeout?: number;
    maxOutputSize?: number;
  };
}

/**
 * Agent context passed to execute
 */
export interface AgentContext {
  projectPath: string;
  config: Record<string, unknown>;
  serverContext: ServerContext;
}

/**
 * Base Agent abstract class
 */
export abstract class BaseAgent implements AgentDefinition {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly capabilities: string[];
  abstract readonly expertise: string[];

  /**
   * Execute the agent's task
   */
  abstract execute(input: AgentInput, context: AgentContext): Promise<AgentResult>;

  /**
   * Log helper
   */
  protected log(context: AgentContext, level: 'info' | 'warn' | 'error', message: string): void {
    context.serverContext.logger.log(level, `[${this.name}] ${message}`);
  }

  /**
   * Create success result
   */
  protected success(message: string, data?: unknown, files?: GeneratedFile[]): AgentResult {
    return {
      success: true,
      data,
      message,
      files,
    };
  }

  /**
   * Create error result
   */
  protected error(message: string, recommendations?: string[]): AgentResult {
    return {
      success: false,
      message,
      recommendations,
    };
  }
}
