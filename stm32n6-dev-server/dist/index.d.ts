#!/usr/bin/env node
import { z } from 'zod';

/**
 * Configuration Manager for STM32N6 Development Server
 */

declare const ConfigSchema: z.ZodObject<{
    server: z.ZodObject<{
        logLevel: z.ZodDefault<z.ZodEnum<["debug", "info", "warn", "error"]>>;
        timeout: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        timeout: number;
        logLevel: "debug" | "info" | "warn" | "error";
    }, {
        timeout?: number | undefined;
        logLevel?: "debug" | "info" | "warn" | "error" | undefined;
    }>;
    toolchain: z.ZodObject<{
        stm32cubeIdePath: z.ZodOptional<z.ZodString>;
        gccArmPath: z.ZodOptional<z.ZodString>;
        stm32cubeProgPath: z.ZodOptional<z.ZodString>;
        stEdgeAiPath: z.ZodOptional<z.ZodString>;
        openocdPath: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        stm32cubeIdePath?: string | undefined;
        gccArmPath?: string | undefined;
        stm32cubeProgPath?: string | undefined;
        stEdgeAiPath?: string | undefined;
        openocdPath?: string | undefined;
    }, {
        stm32cubeIdePath?: string | undefined;
        gccArmPath?: string | undefined;
        stm32cubeProgPath?: string | undefined;
        stEdgeAiPath?: string | undefined;
        openocdPath?: string | undefined;
    }>;
    target: z.ZodObject<{
        mcu: z.ZodDefault<z.ZodString>;
        board: z.ZodDefault<z.ZodString>;
        flashBase: z.ZodDefault<z.ZodString>;
        ramBase: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        mcu: string;
        board: string;
        flashBase: string;
        ramBase: string;
    }, {
        mcu?: string | undefined;
        board?: string | undefined;
        flashBase?: string | undefined;
        ramBase?: string | undefined;
    }>;
    debug: z.ZodObject<{
        probe: z.ZodDefault<z.ZodEnum<["stlink", "jlink", "ulink"]>>;
        interface: z.ZodDefault<z.ZodEnum<["swd", "jtag"]>>;
        speed: z.ZodDefault<z.ZodNumber>;
        swoEnabled: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        probe: "stlink" | "jlink" | "ulink";
        interface: "swd" | "jtag";
        speed: number;
        swoEnabled: boolean;
    }, {
        probe?: "stlink" | "jlink" | "ulink" | undefined;
        interface?: "swd" | "jtag" | undefined;
        speed?: number | undefined;
        swoEnabled?: boolean | undefined;
    }>;
    build: z.ZodObject<{
        defaultBuildType: z.ZodDefault<z.ZodEnum<["Debug", "Release", "MinSizeRel"]>>;
        parallelJobs: z.ZodDefault<z.ZodNumber>;
        warningsAsErrors: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        defaultBuildType: "Debug" | "Release" | "MinSizeRel";
        parallelJobs: number;
        warningsAsErrors: boolean;
    }, {
        defaultBuildType?: "Debug" | "Release" | "MinSizeRel" | undefined;
        parallelJobs?: number | undefined;
        warningsAsErrors?: boolean | undefined;
    }>;
    edgeAi: z.ZodObject<{
        developerCloudApi: z.ZodOptional<z.ZodString>;
        defaultQuantization: z.ZodDefault<z.ZodEnum<["int8", "int4", "mixed", "fp16"]>>;
        optimizeFor: z.ZodDefault<z.ZodEnum<["latency", "memory", "balanced"]>>;
    }, "strip", z.ZodTypeAny, {
        defaultQuantization: "int8" | "int4" | "mixed" | "fp16";
        optimizeFor: "latency" | "memory" | "balanced";
        developerCloudApi?: string | undefined;
    }, {
        developerCloudApi?: string | undefined;
        defaultQuantization?: "int8" | "int4" | "mixed" | "fp16" | undefined;
        optimizeFor?: "latency" | "memory" | "balanced" | undefined;
    }>;
}, "strip", z.ZodTypeAny, {
    debug: {
        probe: "stlink" | "jlink" | "ulink";
        interface: "swd" | "jtag";
        speed: number;
        swoEnabled: boolean;
    };
    server: {
        timeout: number;
        logLevel: "debug" | "info" | "warn" | "error";
    };
    toolchain: {
        stm32cubeIdePath?: string | undefined;
        gccArmPath?: string | undefined;
        stm32cubeProgPath?: string | undefined;
        stEdgeAiPath?: string | undefined;
        openocdPath?: string | undefined;
    };
    target: {
        mcu: string;
        board: string;
        flashBase: string;
        ramBase: string;
    };
    build: {
        defaultBuildType: "Debug" | "Release" | "MinSizeRel";
        parallelJobs: number;
        warningsAsErrors: boolean;
    };
    edgeAi: {
        defaultQuantization: "int8" | "int4" | "mixed" | "fp16";
        optimizeFor: "latency" | "memory" | "balanced";
        developerCloudApi?: string | undefined;
    };
}, {
    debug: {
        probe?: "stlink" | "jlink" | "ulink" | undefined;
        interface?: "swd" | "jtag" | undefined;
        speed?: number | undefined;
        swoEnabled?: boolean | undefined;
    };
    server: {
        timeout?: number | undefined;
        logLevel?: "debug" | "info" | "warn" | "error" | undefined;
    };
    toolchain: {
        stm32cubeIdePath?: string | undefined;
        gccArmPath?: string | undefined;
        stm32cubeProgPath?: string | undefined;
        stEdgeAiPath?: string | undefined;
        openocdPath?: string | undefined;
    };
    target: {
        mcu?: string | undefined;
        board?: string | undefined;
        flashBase?: string | undefined;
        ramBase?: string | undefined;
    };
    build: {
        defaultBuildType?: "Debug" | "Release" | "MinSizeRel" | undefined;
        parallelJobs?: number | undefined;
        warningsAsErrors?: boolean | undefined;
    };
    edgeAi: {
        developerCloudApi?: string | undefined;
        defaultQuantization?: "int8" | "int4" | "mixed" | "fp16" | undefined;
        optimizeFor?: "latency" | "memory" | "balanced" | undefined;
    };
}>;
type ConfigSchemaType = z.infer<typeof ConfigSchema>;
/**
 * Configuration Manager
 * Handles configuration loading, validation, and access
 */
declare class ConfigManager {
    private config;
    constructor(options?: Partial<ConfigSchemaType>);
    /**
     * Resolve configuration from multiple sources
     */
    private resolveConfig;
    /**
     * Load configuration from environment variables
     */
    private loadFromEnvironment;
    /**
     * Deep merge two objects
     */
    private deepMerge;
    /**
     * Get a configuration value by key path
     */
    get<K extends keyof ConfigSchemaType>(key: K): ConfigSchemaType[K];
    /**
     * Get a nested configuration value
     */
    getNested<K extends keyof ConfigSchemaType, SK extends keyof ConfigSchemaType[K]>(key: K, subkey: SK): ConfigSchemaType[K][SK];
    /**
     * Set a configuration value
     */
    set<K extends keyof ConfigSchemaType>(key: K, value: ConfigSchemaType[K]): void;
    /**
     * Get all configuration
     */
    getAll(): ConfigSchemaType;
    /**
     * Validate the current configuration
     */
    validate(): {
        valid: boolean;
        errors: string[];
    };
    /**
     * Check if a tool is available
     */
    isToolAvailable(tool: keyof ConfigSchemaType['toolchain']): boolean;
    /**
     * Get tool path with fallback
     */
    getToolPath(tool: keyof ConfigSchemaType['toolchain'], fallback?: string): string | undefined;
    /**
     * Get debug configuration
     */
    getDebugConfig(): ConfigSchemaType['debug'];
    /**
     * Get build configuration
     */
    getBuildConfig(): ConfigSchemaType['build'];
    /**
     * Get target configuration
     */
    getTargetConfig(): ConfigSchemaType['target'];
    /**
     * Get Edge AI configuration
     */
    getEdgeAiConfig(): ConfigSchemaType['edgeAi'];
    /**
     * Create a child config with overrides
     */
    withOverrides(overrides: Partial<ConfigSchemaType>): ConfigManager;
}

/**
 * Base Tool class for STM32N6 Development Server
 */

/**
 * Tool execution context
 */
interface ToolExecutionContext {
    workingDirectory: string;
    environment: Record<string, string>;
    timeout: number;
    serverContext: ServerContext;
}
/**
 * Tool result content
 */
interface ToolResultContent {
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
}
/**
 * Tool result
 */
interface ToolResult {
    content: ToolResultContent[];
    isError?: boolean;
}
/**
 * Tool definition interface
 */
interface ToolDefinition {
    name: string;
    description: string;
    inputSchema: z.ZodType;
    category: ToolCategory;
}
/**
 * Tool categories
 */
declare enum ToolCategory {
    BUILD = "build",
    DEPLOY = "deploy",
    CODE_GEN = "codegen",
    AI_ML = "aiml",
    ANALYSIS = "analysis",
    DEBUG = "debug"
}
/**
 * Base Tool abstract class
 * All tools must extend this class
 */
declare abstract class BaseTool implements ToolDefinition {
    abstract readonly name: string;
    abstract readonly description: string;
    abstract readonly inputSchema: z.ZodType;
    abstract readonly category: ToolCategory;
    /**
     * Main handler called by the MCP server
     */
    handler(params: unknown, context: ToolExecutionContext): Promise<ToolResult>;
    /**
     * Tool execution logic - must be implemented by subclasses
     */
    protected abstract execute(params: z.infer<this['inputSchema']>, context: ToolExecutionContext): Promise<unknown>;
    /**
     * Format result for MCP response
     */
    protected formatResult(result: unknown): ToolResult;
    /**
     * Check if result indicates an error
     */
    protected isErrorResult(result: unknown): boolean;
    /**
     * Handle errors during execution
     */
    protected handleError(error: unknown): ToolResult;
    /**
     * Get JSON Schema representation for MCP
     */
    getJsonSchema(): Record<string, unknown>;
}

/**
 * Tool Manager for STM32N6 Development Server
 */

/**
 * Tool Manager
 * Handles tool registration, discovery, and execution
 */
declare class ToolManager {
    private tools;
    /**
     * Register a tool
     */
    register(tool: BaseTool): void;
    /**
     * Unregister a tool
     */
    unregister(name: string): boolean;
    /**
     * Enable or disable a tool
     */
    setEnabled(name: string, enabled: boolean): void;
    /**
     * Check if a tool is registered and enabled
     */
    isAvailable(name: string): boolean;
    /**
     * Get a tool by name
     */
    get(name: string): BaseTool | undefined;
    /**
     * List all registered tools
     */
    listAll(): BaseTool[];
    /**
     * List tools by category
     */
    listByCategory(category: ToolCategory): BaseTool[];
    /**
     * List enabled tools
     */
    listEnabled(): BaseTool[];
    /**
     * Execute a tool by name
     */
    execute(name: string, params: Record<string, unknown>, serverContext: ServerContext): Promise<unknown>;
    /**
     * Get tool count
     */
    get count(): number;
    /**
     * Get tools grouped by category
     */
    getByCategory(): Record<ToolCategory, BaseTool[]>;
}

/**
 * Common type definitions for STM32N6 Development Server
 */

interface GeneratedFile {
    path: string;
    content: string;
    type: 'source' | 'header' | 'config' | 'documentation' | 'example';
}
interface AgentResult<T = unknown> {
    success: boolean;
    data?: T;
    message: string;
    recommendations?: string[];
    nextSteps?: string[];
    files?: GeneratedFile[];
}
type HookTiming = 'pre' | 'post';
type HookTrigger = 'tool' | 'command' | 'agent';
interface HookContext {
    params: Record<string, unknown>;
    result?: unknown;
    environment: Record<string, string>;
    projectPath: string;
}
interface HookResult {
    proceed: boolean;
    error?: string;
    suggestions?: string[];
    modifiedParams?: Record<string, unknown>;
    metadata?: Record<string, unknown>;
}

/**
 * Base Agent class for STM32N6 Development Server
 */

/**
 * Agent definition interface
 */
interface AgentDefinition {
    name: string;
    description: string;
    capabilities: string[];
    expertise: string[];
}
/**
 * Agent input
 */
interface AgentInput {
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
interface AgentContext {
    projectPath: string;
    config: Record<string, unknown>;
    serverContext: ServerContext;
}
/**
 * Base Agent abstract class
 */
declare abstract class BaseAgent implements AgentDefinition {
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
    protected log(context: AgentContext, level: 'info' | 'warn' | 'error', message: string): void;
    /**
     * Create success result
     */
    protected success(message: string, data?: unknown, files?: GeneratedFile[]): AgentResult;
    /**
     * Create error result
     */
    protected error(message: string, recommendations?: string[]): AgentResult;
}

/**
 * Agent Manager for STM32N6 Development Server
 */

/**
 * Agent Manager
 * Handles agent registration and execution
 */
declare class AgentManager {
    private agents;
    /**
     * Register an agent
     */
    register(agent: BaseAgent): void;
    /**
     * Get an agent by name
     */
    get(name: string): BaseAgent | undefined;
    /**
     * List all agents
     */
    listAll(): AgentDefinition[];
    /**
     * Execute an agent
     */
    execute(name: string, input: AgentInput, serverContext: ServerContext): Promise<unknown>;
    /**
     * Select agents for a task based on keywords
     */
    selectAgentsForTask(task: string): BaseAgent[];
}

/**
 * Hook Engine for STM32N6 Development Server
 */

/**
 * Hook definition
 */
interface HookDefinition {
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
declare class HookEngine {
    private hooks;
    /**
     * Register a hook
     */
    register(hook: HookDefinition): void;
    /**
     * Unregister a hook
     */
    unregister(name: string): boolean;
    /**
     * Execute hooks for a given trigger
     */
    execute(timing: HookTiming, trigger: HookTrigger, target: string, context: HookContext): Promise<HookResult>;
    /**
     * Check if target matches pattern
     */
    private matchesTarget;
    /**
     * Merge hook results
     */
    private mergeResults;
    /**
     * List all hooks
     */
    listAll(): HookDefinition[];
    /**
     * Clear all hooks
     */
    clear(): void;
}

/**
 * Template Engine for STM32N6 Development Server
 */
/**
 * Template metadata
 */
interface TemplateInfo {
    name: string;
    category: string;
    description: string;
    variables: string[];
}
/**
 * Template Engine
 * Manages template loading and rendering
 */
declare class TemplateEngine {
    private templates;
    private templateInfo;
    private templatesDir;
    constructor(templatesDir?: string);
    /**
     * Register Handlebars helpers
     */
    private registerHelpers;
    /**
     * Load all templates from directory
     */
    loadTemplates(): Promise<void>;
    /**
     * Load a single template
     */
    loadTemplate(filePath: string): Promise<void>;
    /**
     * Register a template from string
     */
    registerTemplate(name: string, content: string): void;
    /**
     * Render a template
     */
    render(name: string, context: Record<string, unknown>): string;
    /**
     * Check if template exists
     */
    has(name: string): boolean;
    /**
     * List all templates
     */
    listAll(): TemplateInfo[];
    /**
     * Get template info
     */
    getInfo(name: string): TemplateInfo | undefined;
    /**
     * Get template name from file path
     */
    private getTemplateName;
    /**
     * Get template category from file path
     */
    private getTemplateCategory;
    /**
     * Extract description from template comments
     */
    private extractDescription;
    /**
     * Extract variable names from template
     */
    private extractVariables;
}

/**
 * Logger utility for STM32N6 Development Server
 */
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
declare class Logger {
    private level;
    private prefix;
    private readonly levelPriority;
    constructor(level?: LogLevel, prefix?: string);
    private shouldLog;
    private formatMessage;
    debug(message: string, ...args: unknown[]): void;
    info(message: string, ...args: unknown[]): void;
    warn(message: string, ...args: unknown[]): void;
    error(message: string, ...args: unknown[]): void;
    log(level: LogLevel, message: string, ...args: unknown[]): void;
    setLevel(level: LogLevel): void;
    child(prefix: string): Logger;
}

/**
 * STM32N6 Development MCP Server
 *
 * Provides Claude Code with specialized capabilities for STM32N6570-DK development
 * including CPU/NPU/GPU programming, peripheral drivers, RTOS, and ML deployment.
 */

interface ServerContext {
    config: ConfigManager;
    tools: ToolManager;
    agents: AgentManager;
    hooks: HookEngine;
    templates: TemplateEngine;
    logger: Logger;
}
declare class STM32N6DevServer {
    private server;
    private context;
    constructor();
    private initializeContext;
    private registerHandlers;
    start(): Promise<void>;
}

export { STM32N6DevServer, type ServerContext };
