/**
 * Configuration Manager for STM32N6 Development Server
 */

import { z } from 'zod';
import type { STM32N6Config, DebugProbe, DebugInterface, BuildType, QuantizationScheme } from '../types/index.js';

// Configuration schema
const ConfigSchema = z.object({
  server: z.object({
    logLevel: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    timeout: z.number().default(60000),
  }),
  toolchain: z.object({
    stm32cubeIdePath: z.string().optional(),
    gccArmPath: z.string().optional(),
    stm32cubeProgPath: z.string().optional(),
    stEdgeAiPath: z.string().optional(),
    openocdPath: z.string().optional(),
  }),
  target: z.object({
    mcu: z.string().default('STM32N6570'),
    board: z.string().default('STM32N6570-DK'),
    flashBase: z.string().default('0x08000000'),
    ramBase: z.string().default('0x20000000'),
  }),
  debug: z.object({
    probe: z.enum(['stlink', 'jlink', 'ulink']).default('stlink'),
    interface: z.enum(['swd', 'jtag']).default('swd'),
    speed: z.number().default(4000),
    swoEnabled: z.boolean().default(true),
  }),
  build: z.object({
    defaultBuildType: z.enum(['Debug', 'Release', 'MinSizeRel']).default('Debug'),
    parallelJobs: z.number().default(4),
    warningsAsErrors: z.boolean().default(false),
  }),
  edgeAi: z.object({
    developerCloudApi: z.string().optional(),
    defaultQuantization: z.enum(['int8', 'int4', 'mixed', 'fp16']).default('int8'),
    optimizeFor: z.enum(['latency', 'memory', 'balanced']).default('balanced'),
  }),
});

type ConfigSchemaType = z.infer<typeof ConfigSchema>;

/**
 * Default configuration values
 */
const DEFAULT_CONFIG: ConfigSchemaType = {
  server: {
    logLevel: 'info',
    timeout: 60000,
  },
  toolchain: {},
  target: {
    mcu: 'STM32N6570',
    board: 'STM32N6570-DK',
    flashBase: '0x08000000',
    ramBase: '0x20000000',
  },
  debug: {
    probe: 'stlink',
    interface: 'swd',
    speed: 4000,
    swoEnabled: true,
  },
  build: {
    defaultBuildType: 'Debug',
    parallelJobs: 4,
    warningsAsErrors: false,
  },
  edgeAi: {
    defaultQuantization: 'int8',
    optimizeFor: 'balanced',
  },
};

/**
 * Configuration Manager
 * Handles configuration loading, validation, and access
 */
export class ConfigManager {
  private config: ConfigSchemaType;

  constructor(options: Partial<ConfigSchemaType> = {}) {
    // Merge configurations in priority order
    this.config = this.resolveConfig(options);
  }

  /**
   * Resolve configuration from multiple sources
   */
  private resolveConfig(options: Partial<ConfigSchemaType>): ConfigSchemaType {
    // Start with defaults
    let config = { ...DEFAULT_CONFIG };

    // Load from environment variables
    const envConfig = this.loadFromEnvironment();
    config = this.deepMerge(config, envConfig);

    // Apply provided options (highest priority)
    config = this.deepMerge(config, options);

    // Validate final configuration
    return ConfigSchema.parse(config);
  }

  /**
   * Load configuration from environment variables
   */
  private loadFromEnvironment(): Partial<ConfigSchemaType> {
    const config: Partial<ConfigSchemaType> = {};

    // Toolchain paths
    if (process.env['STM32CUBE_IDE_PATH']) {
      config.toolchain = { ...config.toolchain, stm32cubeIdePath: process.env['STM32CUBE_IDE_PATH'] };
    }
    if (process.env['GCC_ARM_PATH']) {
      config.toolchain = { ...config.toolchain, gccArmPath: process.env['GCC_ARM_PATH'] };
    }
    if (process.env['STM32CUBE_PROG_PATH']) {
      config.toolchain = { ...config.toolchain, stm32cubeProgPath: process.env['STM32CUBE_PROG_PATH'] };
    }
    if (process.env['ST_EDGE_AI_PATH']) {
      config.toolchain = { ...config.toolchain, stEdgeAiPath: process.env['ST_EDGE_AI_PATH'] };
    }
    if (process.env['OPENOCD_PATH']) {
      config.toolchain = { ...config.toolchain, openocdPath: process.env['OPENOCD_PATH'] };
    }

    // Server settings
    if (process.env['STM32N6_LOG_LEVEL']) {
      const level = process.env['STM32N6_LOG_LEVEL'] as 'debug' | 'info' | 'warn' | 'error';
      if (['debug', 'info', 'warn', 'error'].includes(level)) {
        config.server = { ...config.server, logLevel: level };
      }
    }
    if (process.env['STM32N6_TIMEOUT']) {
      const timeout = parseInt(process.env['STM32N6_TIMEOUT'], 10);
      if (!isNaN(timeout)) {
        config.server = { ...config.server, timeout };
      }
    }

    return config;
  }

  /**
   * Deep merge two objects
   */
  private deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
    const result = { ...target };

    for (const key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        const sourceValue = source[key];
        const targetValue = target[key];

        if (
          sourceValue !== undefined &&
          typeof sourceValue === 'object' &&
          sourceValue !== null &&
          !Array.isArray(sourceValue) &&
          targetValue !== undefined &&
          typeof targetValue === 'object' &&
          targetValue !== null &&
          !Array.isArray(targetValue)
        ) {
          result[key] = this.deepMerge(
            targetValue as Record<string, unknown>,
            sourceValue as Record<string, unknown>
          ) as T[Extract<keyof T, string>];
        } else if (sourceValue !== undefined) {
          result[key] = sourceValue as T[Extract<keyof T, string>];
        }
      }
    }

    return result;
  }

  /**
   * Get a configuration value by key path
   */
  get<K extends keyof ConfigSchemaType>(key: K): ConfigSchemaType[K] {
    return this.config[key];
  }

  /**
   * Get a nested configuration value
   */
  getNested<K extends keyof ConfigSchemaType, SK extends keyof ConfigSchemaType[K]>(
    key: K,
    subkey: SK
  ): ConfigSchemaType[K][SK] {
    return this.config[key][subkey];
  }

  /**
   * Set a configuration value
   */
  set<K extends keyof ConfigSchemaType>(key: K, value: ConfigSchemaType[K]): void {
    this.config[key] = value;
  }

  /**
   * Get all configuration
   */
  getAll(): ConfigSchemaType {
    return { ...this.config };
  }

  /**
   * Validate the current configuration
   */
  validate(): { valid: boolean; errors: string[] } {
    try {
      ConfigSchema.parse(this.config);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
        return { valid: false, errors };
      }
      return { valid: false, errors: [String(error)] };
    }
  }

  /**
   * Check if a tool is available
   */
  isToolAvailable(tool: keyof ConfigSchemaType['toolchain']): boolean {
    const path = this.config.toolchain[tool];
    return path !== undefined && path.length > 0;
  }

  /**
   * Get tool path with fallback
   */
  getToolPath(tool: keyof ConfigSchemaType['toolchain'], fallback?: string): string | undefined {
    return this.config.toolchain[tool] ?? fallback;
  }

  /**
   * Get debug configuration
   */
  getDebugConfig(): ConfigSchemaType['debug'] {
    return this.config.debug;
  }

  /**
   * Get build configuration
   */
  getBuildConfig(): ConfigSchemaType['build'] {
    return this.config.build;
  }

  /**
   * Get target configuration
   */
  getTargetConfig(): ConfigSchemaType['target'] {
    return this.config.target;
  }

  /**
   * Get Edge AI configuration
   */
  getEdgeAiConfig(): ConfigSchemaType['edgeAi'] {
    return this.config.edgeAi;
  }

  /**
   * Create a child config with overrides
   */
  withOverrides(overrides: Partial<ConfigSchemaType>): ConfigManager {
    return new ConfigManager(this.deepMerge(this.config, overrides));
  }
}
