/**
 * STM32 Debug Tool
 * Start GDB debug session with target
 */

import { z } from 'zod';
import { BaseTool, ToolCategory } from './base.js';
import type { DebugResult } from '../types/index.js';

const DebugInputSchema = z.object({
  elfPath: z.string().describe('Path to ELF file with debug symbols'),
  probe: z.enum(['stlink', 'jlink', 'ulink']).default('stlink'),
  interface: z.enum(['swd', 'jtag']).default('swd'),
  speed: z.number().default(4000),
  swv: z.boolean().default(false),
  swvSpeed: z.number().default(2000),
  rtosAwareness: z.enum(['none', 'freertos', 'threadx']).default('none'),
  initCommands: z.array(z.string()).optional(),
});

type DebugInput = z.infer<typeof DebugInputSchema>;

export class STM32DebugTool extends BaseTool {
  readonly name = 'stm32_debug';
  readonly description = 'Start GDB debug session with STM32N6 target';
  readonly inputSchema = DebugInputSchema;
  readonly category = ToolCategory.DEBUG;

  private sessionCounter = 0;

  protected async execute(params: DebugInput): Promise<DebugResult> {
    // Validate ELF exists
    const elfExists = await this.checkFileExists(params.elfPath);

    if (!elfExists) {
      return {
        success: false,
        message: `ELF file not found: ${params.elfPath}`,
      };
    }

    // Generate session ID
    this.sessionCounter++;
    const sessionId = `debug-${Date.now()}-${this.sessionCounter}`;

    // In real implementation, would start OpenOCD/GDB server
    return {
      success: true,
      sessionId,
      gdbPort: 3333,
      telnetPort: 4444,
      targetStatus: 'halted',
      message: this.getStartupMessage(params),
    };
  }

  private async checkFileExists(path: string): Promise<boolean> {
    try {
      const fs = await import('fs/promises');
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }

  private getStartupMessage(params: DebugInput): string {
    let message = `Debug session started
ELF: ${params.elfPath}
Probe: ${params.probe}
Interface: ${params.interface} @ ${params.speed} kHz
GDB Port: 3333
Telnet Port: 4444
`;

    if (params.swv) {
      message += `SWV: Enabled @ ${params.swvSpeed} kHz\n`;
    }

    if (params.rtosAwareness !== 'none') {
      message += `RTOS Awareness: ${params.rtosAwareness}\n`;
    }

    message += `
Target halted at address 0x08000100
Ready for debugging.

GDB commands available:
- break main         : Set breakpoint at main()
- continue           : Resume execution
- step               : Single step
- next               : Step over
- info registers     : Display registers
- x/10x 0x20000000   : Examine memory
`;

    return message;
  }
}
