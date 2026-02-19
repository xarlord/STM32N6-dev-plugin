/**
 * Common type definitions for STM32N6 Development Server
 */

import { z } from 'zod';

// ============================================
// Build Types
// ============================================

export const BuildTypeSchema = z.enum(['Debug', 'Release', 'MinSizeRel']);
export type BuildType = z.infer<typeof BuildTypeSchema>;

export interface BuildError {
  file: string;
  line: number;
  column: number;
  message: string;
  code?: string;
}

export interface BuildWarning {
  file: string;
  line: number;
  column: number;
  message: string;
  code?: string;
}

export interface MemoryUsage {
  text: number;
  data: number;
  bss: number;
  flash: number;
  ram: number;
}

export interface BuildResult {
  success: boolean;
  output: string;
  binaryPath?: string;
  errors: BuildError[];
  warnings: BuildWarning[];
  sizeReport?: MemoryUsage;
}

// ============================================
// Debug Types
// ============================================

export const DebugProbeSchema = z.enum(['stlink', 'jlink', 'ulink']);
export type DebugProbe = z.infer<typeof DebugProbeSchema>;

export const DebugInterfaceSchema = z.enum(['swd', 'jtag']);
export type DebugInterface = z.infer<typeof DebugInterfaceSchema>;

export interface DebugSession {
  id: string;
  elfPath: string;
  probe: DebugProbe;
  interface: DebugInterface;
  status: 'halted' | 'running' | 'reset';
  breakpoints: Breakpoint[];
}

export interface Breakpoint {
  id: number;
  file?: string;
  line?: number;
  address?: number;
  condition?: string;
  enabled: boolean;
}

export interface DebugResult {
  success: boolean;
  sessionId?: string;
  gdbPort?: number;
  telnetPort?: number;
  targetStatus?: 'halted' | 'running' | 'reset';
  message: string;
}

// ============================================
// Peripheral Types
// ============================================

export const PeripheralTypeSchema = z.enum([
  'I2C1', 'I2C2', 'I2C3',
  'SPI1', 'SPI2', 'SPI3',
  'USART1', 'USART2', 'USART3',
  'UART4', 'UART5',
  'CAN', 'CANFD',
  'ETH',
  'DSI', 'CSI',
  'ADC1', 'ADC2',
  'DAC',
  'TIM1', 'TIM2', 'TIM3', 'TIM4', 'TIM5',
]);
export type PeripheralType = z.infer<typeof PeripheralTypeSchema>;

export const DriverTypeSchema = z.enum(['HAL', 'LL']);
export type DriverType = z.infer<typeof DriverTypeSchema>;

export interface PinAssignment {
  pin: string;
  mode: string;
  pull?: 'none' | 'up' | 'down';
  speed?: 'low' | 'medium' | 'high' | 'very_high';
  alternate?: number;
}

export interface DMAChannel {
  stream: string;
  channel: number;
  direction: 'memory_to_periph' | 'periph_to_memory' | 'memory_to_memory';
}

export interface InterruptConfig {
  irq: string;
  priority: number;
  subPriority: number;
}

export interface PeripheralConfig {
  name: PeripheralType;
  mode: string;
  config: Record<string, unknown>;
  useDma: boolean;
  useInterrupts: boolean;
  driverType: DriverType;
}

export interface PeripheralConfigResult {
  success: boolean;
  files: GeneratedFile[];
  pinConfig: PinAssignment[];
  dmaConfig?: DMAChannel[];
  interruptConfig?: InterruptConfig[];
}

// ============================================
// Clock Types
// ============================================

export interface ClockConfig {
  sysclk: number;
  source: 'HSI' | 'HSE' | 'PLL';
  hseFrequency?: number;
  pllConfig?: {
    m: number;
    n: number;
    p: number;
    q: number;
    r: number;
  };
  busPrescalers?: {
    ahb: number;
    apb1: number;
    apb2: number;
    apb3: number;
  };
}

export interface ClockFrequencies {
  sysclk: number;
  hclk: number;
  pclk1: number;
  pclk2: number;
  pclk3: number;
}

export interface ClockConfigResult {
  success: boolean;
  frequencies: ClockFrequencies;
  files: GeneratedFile[];
  warnings: string[];
}

// ============================================
// Model/AI Types
// ============================================

export const ModelFormatSchema = z.enum(['onnx', 'tflite', 'pytorch', 'keras']);
export type ModelFormat = z.infer<typeof ModelFormatSchema>;

export const QuantizationSchemeSchema = z.enum(['int8', 'int4', 'mixed', 'fp16']);
export type QuantizationScheme = z.infer<typeof QuantizationSchemeSchema>;

export interface ModelInfo {
  name: string;
  framework: ModelFormat;
  inputShape: number[];
  outputShape: number[];
  parameters: number;
  operations: string[];
  supportedOperators: string[];
  unsupportedOperators: string[];
}

export interface MemoryEstimate {
  weightsRAM: number;
  activationsRAM: number;
  totalRAM: number;
  flash: number;
}

export interface ModelConvertResult {
  success: boolean;
  outputPath: string;
  modelInfo: ModelInfo;
  memoryEstimate: MemoryEstimate;
  report?: {
    path: string;
    summary: string;
  };
}

export interface AccuracyMetrics {
  originalAccuracy: number;
  quantizedAccuracy: number;
  accuracyDrop: number;
}

export interface QuantizationReport {
  originalSize: number;
  quantizedSize: number;
  compressionRatio: number;
  estimatedLatency: number;
  accuracyMetrics?: AccuracyMetrics;
}

export interface ModelQuantizeResult {
  success: boolean;
  outputPath: string;
  quantizationReport: QuantizationReport;
  layerAnalysis?: Array<{
    layer: string;
    type: string;
    originalSize: number;
    quantizedSize: number;
    dynamicRange: [number, number];
  }>;
}

// ============================================
// Trace Types
// ============================================

export const AnalysisTypeSchema = z.enum([
  'timing', 'coverage', 'exceptions', 'data', 'pc-sampling', 'itm'
]);
export type AnalysisType = z.infer<typeof AnalysisTypeSchema>;

export interface TraceFunctionTiming {
  name: string;
  totalTime: number;
  callCount: number;
  avgTime: number;
  maxTime: number;
  minTime: number;
}

export interface TraceCoverage {
  lineCoverage: number;
  functionCoverage: number;
  uncoveredFunctions: string[];
}

export interface TraceException {
  type: string;
  timestamp: number;
  address: string;
  message?: string;
}

export interface TraceAnalysisReport {
  duration: number;
  totalInstructions: number;
  timing?: {
    functions: TraceFunctionTiming[];
  };
  coverage?: TraceCoverage;
  exceptions?: TraceException[];
}

export interface TraceAnalyzeResult {
  success: boolean;
  analysisReport: TraceAnalysisReport;
  visualizations: Array<{
    type: string;
    path: string;
  }>;
  recommendations: string[];
}

// ============================================
// Register Types
// ============================================

export interface BitField {
  name: string;
  position: string;
  value: number;
  description: string;
}

export interface RegisterInspectResult {
  success: boolean;
  value: number;
  hexValue: string;
  binaryValue: string;
  bits: BitField[];
  description: string;
}

// ============================================
// Memory Map Types
// ============================================

export interface MemorySection {
  name: string;
  address: string;
  size: number;
  type: 'code' | 'data' | 'bss' | 'rodata' | 'heap' | 'stack';
}

export interface MemoryUsageDetail {
  used: number;
  total: number;
  percentage: number;
}

export interface SymbolInfo {
  name: string;
  size: number;
  section: string;
  address: string;
}

export interface MemoryMapResult {
  success: boolean;
  sections: MemorySection[];
  memoryUsage: {
    flash: MemoryUsageDetail;
    ram: MemoryUsageDetail;
  };
  largestSymbols: SymbolInfo[];
  visualizationPath?: string;
}

// ============================================
// Flash Types
// ============================================

export interface FlashResult {
  success: boolean;
  bytesWritten: number;
  duration: number;
  verified: boolean;
  targetInfo?: {
    chipId: string;
    flashSize: number;
    ramSize: number;
  };
}

// ============================================
// Common Types
// ============================================

export interface GeneratedFile {
  path: string;
  content: string;
  type: 'source' | 'header' | 'config' | 'documentation' | 'example';
}

export type Result<T> =
  | { success: true; data: T }
  | { success: false; error: STM32N6Error };

export interface STM32N6Error {
  code: string;
  message: string;
  category: ErrorCategory;
  details?: unknown;
  suggestions?: string[];
}

export type ErrorCategory =
  | 'validation'
  | 'toolchain'
  | 'build'
  | 'connection'
  | 'integration'
  | 'internal';

// ============================================
// Agent Types
// ============================================

export interface AgentInfo {
  name: string;
  description: string;
  capabilities: string[];
  expertise: string[];
}

export interface AgentContext {
  projectPath: string;
  config: Record<string, unknown>;
  tools: Map<string, unknown>;
  logger: unknown;
}

export interface AgentResult<T = unknown> {
  success: boolean;
  data?: T;
  message: string;
  recommendations?: string[];
  nextSteps?: string[];
  files?: GeneratedFile[];
}

// ============================================
// Hook Types
// ============================================

export type HookTiming = 'pre' | 'post';
export type HookTrigger = 'tool' | 'command' | 'agent';

export interface HookContext {
  params: Record<string, unknown>;
  result?: unknown;
  environment: Record<string, string>;
  projectPath: string;
}

export interface HookResult {
  proceed: boolean;
  error?: string;
  suggestions?: string[];
  modifiedParams?: Record<string, unknown>;
  metadata?: Record<string, unknown>;
}

// ============================================
// Configuration Types
// ============================================

export interface STM32N6Config {
  server: {
    logLevel: 'debug' | 'info' | 'warn' | 'error';
    timeout: number;
  };
  toolchain: {
    stm32cubeIdePath?: string;
    gccArmPath?: string;
    stm32cubeProgPath?: string;
    stEdgeAiPath?: string;
    openocdPath?: string;
  };
  target: {
    mcu: string;
    board: string;
    flashBase: string;
    ramBase: string;
  };
  debug: {
    probe: DebugProbe;
    interface: DebugInterface;
    speed: number;
    swoEnabled: boolean;
  };
  build: {
    defaultBuildType: BuildType;
    parallelJobs: number;
    warningsAsErrors: boolean;
  };
  edgeAi: {
    developerCloudApi?: string;
    defaultQuantization: QuantizationScheme;
    optimizeFor: 'latency' | 'memory' | 'balanced';
  };
}
