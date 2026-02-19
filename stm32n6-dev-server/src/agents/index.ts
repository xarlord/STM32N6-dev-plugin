/**
 * Agents Index
 * Register all specialized agents
 */

import type { AgentManager } from './manager.js';
import type { ConfigManager } from '../config/manager.js';
import { BaseAgent } from './base.js';
import { STM32ArchitectAgent } from './stm32-architect.js';
import { DriverDeveloperAgent } from './driver-developer.js';
import { AIEngineerAgent } from './ai-engineer.js';

/**
 * Project Lead Agent
 * Workflow orchestration and coordination
 */
class ProjectLeadAgent extends BaseAgent {
  readonly name = 'project-lead';
  readonly description = 'Workflow orchestration and task coordination';
  readonly capabilities = ['coordination', 'planning', 'review', 'workflow'];
  readonly expertise = ['devflow', 'task-management', 'code-review'];

  async execute(input: AgentInput, context: AgentContext): Promise<AgentResult> {
    return this.success(
      'Project Lead Agent ready. I coordinate workflows and manage project tasks.',
      { availableAgents: ['stm32-architect', 'driver-developer', 'ai-engineer', 'rtos-specialist', 'debug-engineer', 'test-engineer'] }
    );
  }
}

/**
 * RTOS Specialist Agent
 * FreeRTOS and real-time systems expert
 */
class RTOSSpecialistAgent extends BaseAgent {
  readonly name = 'rtos-specialist';
  readonly description = 'FreeRTOS and real-time systems expert';
  readonly capabilities = ['freertos-config', 'task-design', 'synchronization', 'memory-pools'];
  readonly expertise = ['freertos', 'tasks', 'queues', 'semaphores', 'mutexes', 'timers'];

  async execute(input: AgentInput, context: AgentContext): Promise<AgentResult> {
    return this.success(
      'RTOS Specialist Agent ready. I can help with FreeRTOS task design, queues, and synchronization.',
      {
        freertosConfig: {
          version: 'V10.6.2',
          recommendedHeap: '128 KB',
          defaultTickRate: '1000 Hz',
        },
      }
    );
  }
}

/**
 * Debug Engineer Agent
 * Hardware debugging and troubleshooting specialist
 */
class DebugEngineerAgent extends BaseAgent {
  readonly name = 'debug-engineer';
  readonly description = 'Hardware debugging and troubleshooting specialist';
  readonly capabilities = ['gdb-debugging', 'swv-trace', 'hard-fault', 'memory-corruption'];
  readonly expertise = ['gdb', 'openocd', 'swv', 'etm', 'hard-fault', 'stack-overflow'];

  async execute(input: AgentInput, context: AgentContext): Promise<AgentResult> {
    return this.success(
      'Debug Engineer Agent ready. I can help with GDB debugging, trace analysis, and fault diagnosis.',
      {
        debugProbes: ['ST-Link V3', 'J-Link', 'ULINKplus'],
        features: ['Breakpoints', 'Watchpoints', 'SWV', 'ETM trace', 'RTOS awareness'],
      }
    );
  }
}

/**
 * Test Engineer Agent
 * Embedded testing and validation specialist
 */
class TestEngineerAgent extends BaseAgent {
  readonly name = 'test-engineer';
  readonly description = 'Embedded testing and validation specialist';
  readonly capabilities = ['unit-testing', 'integration-testing', 'coverage', 'mocking'];
  readonly expertise = ['unity', 'cmock', 'ceedling', 'gcov', 'hil-testing'];

  async execute(input: AgentInput, context: AgentContext): Promise<AgentResult> {
    return this.success(
      'Test Engineer Agent ready. I can help with unit testing, mocking, and coverage analysis.',
      {
        frameworks: ['Unity', 'CMock', 'Ceedling'],
        features: ['Automated test generation', 'Mock creation', 'Coverage reporting'],
      }
    );
  }
}

/**
 * Register all agents
 */
export function registerAllAgents(manager: AgentManager, config: ConfigManager): void {
  manager.register(new ProjectLeadAgent());
  manager.register(new STM32ArchitectAgent());
  manager.register(new DriverDeveloperAgent());
  manager.register(new AIEngineerAgent());
  manager.register(new RTOSSpecialistAgent());
  manager.register(new DebugEngineerAgent());
  manager.register(new TestEngineerAgent());
}

// Re-export all agents
export {
  BaseAgent,
  STM32ArchitectAgent,
  DriverDeveloperAgent,
  AIEngineerAgent,
};
