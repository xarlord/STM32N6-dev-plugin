/**
 * Hook Engine for STM32N6 Development Server
 */

import type { HookTiming, HookTrigger, HookContext, HookResult } from '../types/index.js';

/**
 * Hook definition
 */
export interface HookDefinition {
  name: string;
  timing: HookTiming;
  trigger: HookTrigger;
  target: string | RegExp;
  priority: number;
  handler: (context: HookContext) => Promise<HookResult>;
}

/**
 * Hook Engine
 * Manages hook registration and execution
 */
export class HookEngine {
  private hooks: HookDefinition[] = [];

  /**
   * Register a hook
   */
  register(hook: HookDefinition): void {
    this.hooks.push(hook);
    // Sort by priority (higher first)
    this.hooks.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Unregister a hook
   */
  unregister(name: string): boolean {
    const index = this.hooks.findIndex(h => h.name === name);
    if (index >= 0) {
      this.hooks.splice(index, 1);
      return true;
    }
    return false;
  }

  /**
   * Execute hooks for a given trigger
   */
  async execute(
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
      try {
        const hookResult = await hook.handler(context);
        result = this.mergeResults(result, hookResult);

        if (!result.proceed) {
          break;
        }
      } catch (error) {
        console.error(`Hook ${hook.name} failed:`, error);
        // Continue with other hooks even if one fails
      }
    }

    return result;
  }

  /**
   * Check if target matches pattern
   */
  private matchesTarget(pattern: string | RegExp, target: string): boolean {
    if (pattern === '*') {
      return true;
    }
    if (typeof pattern === 'string') {
      return pattern === target;
    }
    return pattern.test(target);
  }

  /**
   * Merge hook results
   */
  private mergeResults(base: HookResult, update: HookResult): HookResult {
    return {
      proceed: update.proceed && base.proceed,
      error: update.error ?? base.error,
      suggestions: [...(base.suggestions ?? []), ...(update.suggestions ?? [])],
      modifiedParams: { ...base.modifiedParams, ...update.modifiedParams },
      metadata: { ...base.metadata, ...update.metadata },
    };
  }

  /**
   * List all hooks
   */
  listAll(): HookDefinition[] {
    return [...this.hooks];
  }

  /**
   * Clear all hooks
   */
  clear(): void {
    this.hooks = [];
  }
}
