/**
 * Hooks Index
 * Register all built-in hooks
 */

import { HookEngine, HookDefinition } from './engine.js';
import type { HookContext, HookResult } from '../types/index.js';

/**
 * Validate Project Hook
 * Pre-build validation of project structure
 */
const validateProjectHook: HookDefinition = {
  name: 'validate_project',
  timing: 'pre',
  trigger: 'tool',
  target: 'stm32_build',
  priority: 100,
  handler: async (context: HookContext): Promise<HookResult> => {
    const projectPath = context.params['projectPath'] as string | undefined;

    if (!projectPath) {
      return {
        proceed: false,
        error: 'Project path is required',
        suggestions: ['Specify projectPath parameter'],
      };
    }

    // In real implementation, would validate project structure
    return { proceed: true };
  },
};

/**
 * Analyze Build Output Hook
 * Post-build analysis
 */
const analyzeBuildOutputHook: HookDefinition = {
  name: 'analyze_build_output',
  timing: 'post',
  trigger: 'tool',
  target: 'stm32_build',
  priority: 50,
  handler: async (context: HookContext): Promise<HookResult> => {
    // Analyze build result
    const result = context.result as { success: boolean; warnings?: unknown[] } | undefined;

    if (result?.success && result.warnings && result.warnings.length > 0) {
      return {
        proceed: true,
        suggestions: [`Build completed with ${result.warnings.length} warnings`],
      };
    }

    return { proceed: true };
  },
};

/**
 * Check Target Connection Hook
 * Pre-flash/debug connection verification
 */
const checkTargetConnectionHook: HookDefinition = {
  name: 'check_target_connection',
  timing: 'pre',
  trigger: 'tool',
  target: /^(stm32_flash|stm32_debug)$/,
  priority: 100,
  handler: async (context: HookContext): Promise<HookResult> => {
    // In real implementation, would check if debug probe is connected
    return {
      proceed: true,
      metadata: { probeStatus: 'connected' },
    };
  },
};

/**
 * Log Flash Result Hook
 * Post-flash logging
 */
const logFlashResultHook: HookDefinition = {
  name: 'log_flash_result',
  timing: 'post',
  trigger: 'tool',
  target: 'stm32_flash',
  priority: 50,
  handler: async (context: HookContext): Promise<HookResult> => {
    const result = context.result as { success: boolean; bytesWritten?: number } | undefined;

    if (result?.success) {
      console.error(`Flash completed: ${result.bytesWritten ?? 0} bytes written`);
    }

    return { proceed: true };
  },
};

/**
 * Register all built-in hooks
 */
export function registerAllHooks(engine: HookEngine): void {
  engine.register(validateProjectHook);
  engine.register(analyzeBuildOutputHook);
  engine.register(checkTargetConnectionHook);
  engine.register(logFlashResultHook);
}

// Re-export
export { HookEngine, HookDefinition };
