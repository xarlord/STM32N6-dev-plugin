/**
 * Tests for Tool Manager and Base Tool
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { ToolManager } from '../src/tools/manager.js';
import { BaseTool, ToolCategory } from '../src/tools/base.js';
import { z } from 'zod';

// Mock tool for testing
class MockTool extends BaseTool {
  readonly name = 'mock_tool';
  readonly description = 'A mock tool for testing';
  readonly inputSchema = z.object({
    value: z.string(),
  });
  readonly category = ToolCategory.BUILD;

  protected async execute(params: { value: string }): Promise<unknown> {
    return { success: true, value: params.value };
  }
}

// Error tool for testing error handling
class ErrorTool extends BaseTool {
  readonly name = 'error_tool';
  readonly description = 'A tool that throws errors';
  readonly inputSchema = z.object({});
  readonly category = ToolCategory.BUILD;

  protected async execute(): Promise<unknown> {
    throw new Error('Intentional error');
  }
}

describe('ToolManager', () => {
  let manager: ToolManager;

  beforeEach(() => {
    manager = new ToolManager();
  });

  it('should register a tool', () => {
    const tool = new MockTool();
    manager.register(tool);
    expect(manager.count).toBe(1);
  });

  it('should throw on duplicate registration', () => {
    const tool = new MockTool();
    manager.register(tool);
    expect(() => manager.register(tool)).toThrow('already registered');
  });

  it('should get a tool by name', () => {
    const tool = new MockTool();
    manager.register(tool);
    expect(manager.get('mock_tool')).toBe(tool);
  });

  it('should return undefined for unknown tool', () => {
    expect(manager.get('unknown')).toBeUndefined();
  });

  it('should list all tools', () => {
    const tool = new MockTool();
    manager.register(tool);
    const tools = manager.listAll();
    expect(tools).toHaveLength(1);
    expect(tools[0]?.name).toBe('mock_tool');
  });

  it('should list tools by category', () => {
    const tool = new MockTool();
    manager.register(tool);
    const tools = manager.listByCategory(ToolCategory.BUILD);
    expect(tools).toHaveLength(1);
  });

  it('should enable and disable tools', () => {
    const tool = new MockTool();
    manager.register(tool);

    expect(manager.isAvailable('mock_tool')).toBe(true);

    manager.setEnabled('mock_tool', false);
    expect(manager.isAvailable('mock_tool')).toBe(false);

    manager.setEnabled('mock_tool', true);
    expect(manager.isAvailable('mock_tool')).toBe(true);
  });

  it('should unregister a tool', () => {
    const tool = new MockTool();
    manager.register(tool);
    expect(manager.count).toBe(1);

    const result = manager.unregister('mock_tool');
    expect(result).toBe(true);
    expect(manager.count).toBe(0);
  });

  it('should execute a tool successfully', async () => {
    const tool = new MockTool();
    manager.register(tool);

    const mockServerContext = {
      config: {
        get: () => ({ timeout: 60000 }),
      },
    };

    const result = await manager.execute('mock_tool', { value: 'test' }, mockServerContext as any);
    expect(result).toEqual({ success: true, value: 'test' });
  });

  it('should return error for unknown tool', async () => {
    const result = await manager.execute('unknown', {}, {} as any);
    expect(result).toMatchObject({
      success: false,
      error: expect.objectContaining({
        code: '1002',
      }),
    });
  });

  it('should return error for disabled tool', async () => {
    const tool = new MockTool();
    manager.register(tool);
    manager.setEnabled('mock_tool', false);

    const result = await manager.execute('mock_tool', {}, {} as any);
    expect(result).toMatchObject({
      success: false,
      error: expect.objectContaining({
        code: '1003',
      }),
    });
  });

  it('should get tools grouped by category', () => {
    const tool = new MockTool();
    manager.register(tool);

    const grouped = manager.getByCategory();
    expect(grouped[ToolCategory.BUILD]).toHaveLength(1);
  });
});

describe('BaseTool', () => {
  it('should have correct properties', () => {
    const tool = new MockTool();
    expect(tool.name).toBe('mock_tool');
    expect(tool.description).toBe('A mock tool for testing');
    expect(tool.category).toBe(ToolCategory.BUILD);
  });

  it('should generate JSON schema', () => {
    const tool = new MockTool();
    const schema = tool.getJsonSchema();
    expect(schema.type).toBe('object');
    expect(schema.properties).toHaveProperty('value');
  });

  it('should handle Zod validation errors', async () => {
    const tool = new MockTool();
    const result = await tool.handler({ invalid: 'data' }, {} as any);

    expect(result.isError).toBe(true);
    expect(result.content[0]?.type).toBe('text');
  });

  it('should handle execution errors', async () => {
    const tool = new ErrorTool();
    const result = await tool.handler({}, {} as any);

    expect(result.isError).toBe(true);
  });
});
