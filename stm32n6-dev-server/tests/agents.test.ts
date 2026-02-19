/**
 * Tests for Agent Manager and Agents
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AgentManager } from '../src/agents/manager.js';
import { BaseAgent, AgentInput, AgentContext, AgentResult } from '../src/agents/base.js';

// Mock agent for testing
class MockAgent extends BaseAgent {
  readonly name = 'mock_agent';
  readonly description = 'A mock agent for testing';
  readonly capabilities = ['test', 'mock'];
  readonly expertise = ['testing', 'mocking'];

  async execute(input: AgentInput, context: AgentContext): Promise<AgentResult> {
    return this.success('Mock agent executed', { input });
  }
}

// Error agent for testing
class ErrorAgent extends BaseAgent {
  readonly name = 'error_agent';
  readonly description = 'An agent that throws errors';
  readonly capabilities = ['error'];
  readonly expertise = ['error-handling'];

  async execute(): Promise<AgentResult> {
    throw new Error('Intentional agent error');
  }
}

describe('AgentManager', () => {
  let manager: AgentManager;

  beforeEach(() => {
    manager = new AgentManager();
  });

  it('should register an agent', () => {
    const agent = new MockAgent();
    manager.register(agent);
    expect(manager.get('mock_agent')).toBe(agent);
  });

  it('should throw on duplicate registration', () => {
    const agent = new MockAgent();
    manager.register(agent);
    expect(() => manager.register(agent)).toThrow('already registered');
  });

  it('should list all agents', () => {
    const agent = new MockAgent();
    manager.register(agent);
    const agents = manager.listAll();
    expect(agents).toHaveLength(1);
    expect(agents[0]?.name).toBe('mock_agent');
  });

  it('should return undefined for unknown agent', () => {
    expect(manager.get('unknown')).toBeUndefined();
  });

  it('should execute an agent', async () => {
    const agent = new MockAgent();
    manager.register(agent);

    const mockServerContext = {
      config: {
        getAll: () => ({ server: { timeout: 60000 } }),
      },
      logger: {
        log: () => {},
      },
    };

    const result = await manager.execute('mock_agent', { task: 'test' }, mockServerContext as any);
    expect(result).toMatchObject({
      success: true,
      message: 'Mock agent executed',
    });
  });

  it('should return error for unknown agent', async () => {
    const result = await manager.execute('unknown', { task: 'test' }, {} as any);
    expect(result).toMatchObject({
      success: false,
      message: expect.stringContaining('Unknown agent'),
    });
  });

  it('should handle agent execution errors', async () => {
    const agent = new ErrorAgent();
    manager.register(agent);

    const mockServerContext = {
      config: {
        getAll: () => ({ server: { timeout: 60000 } }),
      },
      logger: {
        log: () => {},
      },
    };

    const result = await manager.execute('error_agent', { task: 'test' }, mockServerContext as any);
    expect(result).toMatchObject({
      success: false,
      message: expect.stringContaining('failed'),
    });
  });

  it('should select agents based on task keywords', () => {
    const agent = new MockAgent();
    manager.register(agent);

    const selected = manager.selectAgentsForTask('I need to test something');
    expect(selected).toHaveLength(1);
    expect(selected[0]?.name).toBe('mock_agent');
  });
});

describe('BaseAgent', () => {
  it('should have correct properties', () => {
    const agent = new MockAgent();
    expect(agent.name).toBe('mock_agent');
    expect(agent.description).toBe('A mock agent for testing');
    expect(agent.capabilities).toContain('test');
    expect(agent.expertise).toContain('testing');
  });

  it('should create success result', () => {
    const agent = new MockAgent();
    const result = agent.success('Test message', { data: 'test' });
    expect(result).toEqual({
      success: true,
      data: { data: 'test' },
      message: 'Test message',
    });
  });

  it('should create error result', () => {
    const agent = new MockAgent();
    const result = agent.error('Error message', ['Suggestion 1']);
    expect(result).toEqual({
      success: false,
      message: 'Error message',
      recommendations: ['Suggestion 1'],
    });
  });
});
