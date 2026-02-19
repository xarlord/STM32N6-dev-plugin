/**
 * Agent Manager for STM32N6 Development Server
 */

import type { ServerContext } from '../index.js';
import { BaseAgent, AgentInput, AgentContext, AgentDefinition } from './base.js';

/**
 * Agent Manager
 * Handles agent registration and execution
 */
export class AgentManager {
  private agents: Map<string, BaseAgent> = new Map();

  /**
   * Register an agent
   */
  register(agent: BaseAgent): void {
    if (this.agents.has(agent.name)) {
      throw new Error(`Agent already registered: ${agent.name}`);
    }
    this.agents.set(agent.name, agent);
  }

  /**
   * Get an agent by name
   */
  get(name: string): BaseAgent | undefined {
    return this.agents.get(name);
  }

  /**
   * List all agents
   */
  listAll(): AgentDefinition[] {
    return Array.from(this.agents.values()).map(agent => ({
      name: agent.name,
      description: agent.description,
      capabilities: agent.capabilities,
      expertise: agent.expertise,
    }));
  }

  /**
   * Execute an agent
   */
  async execute(
    name: string,
    input: AgentInput,
    serverContext: ServerContext
  ): Promise<unknown> {
    const agent = this.agents.get(name);

    if (!agent) {
      return {
        success: false,
        message: `Unknown agent: ${name}`,
        availableAgents: Array.from(this.agents.keys()),
      };
    }

    const context: AgentContext = {
      projectPath: process.cwd(),
      config: serverContext.config.getAll(),
      serverContext,
    };

    try {
      return await agent.execute(input, context);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        message: `Agent execution failed: ${message}`,
      };
    }
  }

  /**
   * Select agents for a task based on keywords
   */
  selectAgentsForTask(task: string): BaseAgent[] {
    const keywords = task.toLowerCase();
    const selected: BaseAgent[] = [];

    for (const agent of this.agents.values()) {
      const matchesCapability = agent.capabilities.some(cap =>
        keywords.includes(cap.toLowerCase())
      );
      const matchesExpertise = agent.expertise.some(exp =>
        keywords.includes(exp.toLowerCase())
      );

      if (matchesCapability || matchesExpertise) {
        selected.push(agent);
      }
    }

    return selected;
  }
}
