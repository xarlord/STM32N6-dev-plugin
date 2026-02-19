/**
 * Logger utility for STM32N6 Development Server
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private level: LogLevel;
  private prefix: string;

  private readonly levelPriority: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(level: LogLevel = 'info', prefix: string = 'STM32N6') {
    this.level = level;
    this.prefix = prefix;
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levelPriority[level] >= this.levelPriority[this.level];
  }

  private formatMessage(level: LogLevel, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${this.prefix}] [${level.toUpperCase()}] ${message}`;
  }

  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog('debug')) {
      console.error(this.formatMessage('debug', message), ...args);
    }
  }

  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog('info')) {
      console.error(this.formatMessage('info', message), ...args);
    }
  }

  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog('warn')) {
      console.error(this.formatMessage('warn', message), ...args);
    }
  }

  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message), ...args);
    }
  }

  log(level: LogLevel, message: string, ...args: unknown[]): void {
    this[level](message, ...args);
  }

  setLevel(level: LogLevel): void {
    this.level = level;
  }

  child(prefix: string): Logger {
    return new Logger(this.level, `${this.prefix}:${prefix}`);
  }
}
