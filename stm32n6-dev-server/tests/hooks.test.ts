/**
 * Tests for Hook Engine
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { HookEngine, HookDefinition } from '../src/hooks/engine.js';
import type { HookContext, HookResult } from '../src/types/index.js';

describe('HookEngine', () => {
  let engine: HookEngine;

  beforeEach(() => {
    engine = new HookEngine();
  });

  it('should register a hook', () => {
    const hook: HookDefinition = {
      name: 'test_hook',
      timing: 'pre',
      trigger: 'tool',
      target: 'test_tool',
      priority: 100,
      handler: async () => ({ proceed: true }),
    };

    engine.register(hook);
    const hooks = engine.listAll();
    expect(hooks).toHaveLength(1);
    expect(hooks[0]?.name).toBe('test_hook');
  });

  it('should unregister a hook', () => {
    const hook: HookDefinition = {
      name: 'test_hook',
      timing: 'pre',
      trigger: 'tool',
      target: 'test_tool',
      priority: 100,
      handler: async () => ({ proceed: true }),
    };

    engine.register(hook);
    expect(engine.listAll()).toHaveLength(1);

    const result = engine.unregister('test_hook');
    expect(result).toBe(true);
    expect(engine.listAll()).toHaveLength(0);
  });

  it('should return false for unknown hook unregister', () => {
    const result = engine.unregister('unknown');
    expect(result).toBe(false);
  });

  it('should clear all hooks', () => {
    engine.register({
      name: 'hook1',
      timing: 'pre',
      trigger: 'tool',
      target: 'tool1',
      priority: 100,
      handler: async () => ({ proceed: true }),
    });

    engine.register({
      name: 'hook2',
      timing: 'post',
      trigger: 'tool',
      target: 'tool2',
      priority: 50,
      handler: async () => ({ proceed: true }),
    });

    expect(engine.listAll()).toHaveLength(2);
    engine.clear();
    expect(engine.listAll()).toHaveLength(0);
  });

  it('should execute matching hooks', async () => {
    let executed = false;

    engine.register({
      name: 'test_hook',
      timing: 'pre',
      trigger: 'tool',
      target: 'test_tool',
      priority: 100,
      handler: async () => {
        executed = true;
        return { proceed: true };
      },
    });

    await engine.execute('pre', 'tool', 'test_tool', { params: {} } as HookContext);
    expect(executed).toBe(true);
  });

  it('should not execute non-matching hooks', async () => {
    let executed = false;

    engine.register({
      name: 'test_hook',
      timing: 'pre',
      trigger: 'tool',
      target: 'other_tool',
      priority: 100,
      handler: async () => {
        executed = true;
        return { proceed: true };
      },
    });

    await engine.execute('pre', 'tool', 'test_tool', { params: {} } as HookContext);
    expect(executed).toBe(false);
  });

  it('should match wildcard target', async () => {
    let executed = false;

    engine.register({
      name: 'wildcard_hook',
      timing: 'pre',
      trigger: 'tool',
      target: '*',
      priority: 100,
      handler: async () => {
        executed = true;
        return { proceed: true };
      },
    });

    await engine.execute('pre', 'tool', 'any_tool', { params: {} } as HookContext);
    expect(executed).toBe(true);
  });

  it('should match regex target', async () => {
    let executed = false;

    engine.register({
      name: 'regex_hook',
      timing: 'pre',
      trigger: 'tool',
      target: /^stm32_/,
      priority: 100,
      handler: async () => {
        executed = true;
        return { proceed: true };
      },
    });

    await engine.execute('pre', 'tool', 'stm32_build', { params: {} } as HookContext);
    expect(executed).toBe(true);

    executed = false;
    await engine.execute('pre', 'tool', 'other_tool', { params: {} } as HookContext);
    expect(executed).toBe(false);
  });

  it('should stop execution when proceed is false', async () => {
    let secondExecuted = false;

    engine.register({
      name: 'first_hook',
      timing: 'pre',
      trigger: 'tool',
      target: 'test',
      priority: 100,
      handler: async () => ({ proceed: false, error: 'Blocked' }),
    });

    engine.register({
      name: 'second_hook',
      timing: 'pre',
      trigger: 'tool',
      target: 'test',
      priority: 50,
      handler: async () => {
        secondExecuted = true;
        return { proceed: true };
      },
    });

    const result = await engine.execute('pre', 'tool', 'test', { params: {} } as HookContext);
    expect(result.proceed).toBe(false);
    expect(secondExecuted).toBe(false);
  });

  it('should sort hooks by priority', () => {
    engine.register({
      name: 'low_priority',
      timing: 'pre',
      trigger: 'tool',
      target: 'test',
      priority: 10,
      handler: async () => ({ proceed: true }),
    });

    engine.register({
      name: 'high_priority',
      timing: 'pre',
      trigger: 'tool',
      target: 'test',
      priority: 100,
      handler: async () => ({ proceed: true }),
    });

    const hooks = engine.listAll();
    expect(hooks[0]?.name).toBe('high_priority');
    expect(hooks[1]?.name).toBe('low_priority');
  });

  it('should merge hook results', async () => {
    engine.register({
      name: 'hook1',
      timing: 'pre',
      trigger: 'tool',
      target: 'test',
      priority: 100,
      handler: async () => ({
        proceed: true,
        suggestions: ['Suggestion 1'],
        metadata: { key1: 'value1' },
      }),
    });

    engine.register({
      name: 'hook2',
      timing: 'pre',
      trigger: 'tool',
      target: 'test',
      priority: 50,
      handler: async () => ({
        proceed: true,
        suggestions: ['Suggestion 2'],
        metadata: { key2: 'value2' },
      }),
    });

    const result = await engine.execute('pre', 'tool', 'test', { params: {} } as HookContext);

    expect(result.proceed).toBe(true);
    expect(result.suggestions).toContain('Suggestion 1');
    expect(result.suggestions).toContain('Suggestion 2');
    expect(result.metadata).toEqual({ key1: 'value1', key2: 'value2' });
  });
});
