/**
 * Register Inspect Tool
 * Read or write peripheral registers on connected target
 */

import { z } from 'zod';
import { BaseTool, ToolCategory } from './base.js';
import type { RegisterInspectResult, BitField } from '../types/index.js';

const RegisterInputSchema = z.object({
  action: z.enum(['read', 'write', 'modify', 'read_all']),
  peripheral: z.string().describe('Peripheral name (e.g., I2C1, GPIOA)'),
  register: z.string().describe('Register name or offset'),
  value: z.number().optional().describe('Value to write'),
  mask: z.number().optional().describe('Bit mask for modify'),
  sessionId: z.string().optional(),
});

type RegisterInput = z.infer<typeof RegisterInputSchema>;

// Peripheral base addresses for STM32N6570
const PERIPHERAL_BASES: Record<string, number> = {
  GPIOA: 0x42020000,
  GPIOB: 0x42020400,
  GPIOC: 0x42020800,
  GPIOD: 0x42020C00,
  GPIOE: 0x42021000,
  GPIOF: 0x42021400,
  GPIOG: 0x42021800,
  GPIOH: 0x42021C00,
  GPIOI: 0x42022000,
  I2C1: 0x40005400,
  I2C2: 0x40005800,
  I2C3: 0x40005C00,
  SPI1: 0x40013000,
  SPI2: 0x40003800,
  SPI3: 0x40003C00,
  USART1: 0x40011000,
  USART2: 0x40004400,
  USART3: 0x40004800,
  CAN1: 0x40006400,
  ETH: 0x40028000,
  RCC: 0x46020800,
  PWR: 0x46020000,
};

// Register definitions
const REGISTER_DEFS: Record<string, Record<string, { offset: number; bits: BitField[]; description: string }>> = {
  I2C1: {
    CR1: {
      offset: 0x00,
      bits: [
        { name: 'PE', position: '0', value: 0, description: 'Peripheral enable' },
        { name: 'TXIE', position: '1', value: 0, description: 'TX interrupt enable' },
        { name: 'RXIE', position: '2', value: 0, description: 'RX interrupt enable' },
        { name: 'ADDRIE', position: '3', value: 0, description: 'Address match interrupt enable' },
        { name: 'NACKIE', position: '4', value: 0, description: 'NACK interrupt enable' },
        { name: 'STOPIE', position: '5', value: 0, description: 'STOP interrupt enable' },
        { name: 'TCIE', position: '6', value: 0, description: 'Transfer complete interrupt enable' },
        { name: 'ERRIE', position: '7', value: 0, description: 'Error interrupt enable' },
      ],
      description: 'Control Register 1',
    },
    CR2: {
      offset: 0x04,
      bits: [
        { name: 'SADD0', position: '0', value: 0, description: 'Slave address bit 0' },
        { name: 'SADD1-7', position: '1-7', value: 0, description: 'Slave address bits 1-7' },
        { name: 'RD_WRN', position: '10', value: 0, description: 'Transfer direction' },
        { name: 'START', position: '13', value: 0, description: 'Start generation' },
        { name: 'STOP', position: '14', value: 0, description: 'Stop generation' },
        { name: 'NACK', position: '15', value: 0, description: 'NACK generation' },
      ],
      description: 'Control Register 2',
    },
    SR1: {
      offset: 0x14,
      bits: [
        { name: 'SB', position: '0', value: 0, description: 'Start bit' },
        { name: 'ADDR', position: '1', value: 0, description: 'Address sent' },
        { name: 'BTF', position: '2', value: 0, description: 'Byte transfer finished' },
        { name: 'ADD10', position: '3', value: 0, description: '10-bit header sent' },
        { name: 'STOPF', position: '4', value: 0, description: 'Stop detection' },
      ],
      description: 'Status Register 1',
    },
  },
  GPIOA: {
    MODER: {
      offset: 0x00,
      bits: [
        { name: 'MODER0', position: '0-1', value: 0, description: 'Port mode for pin 0' },
        { name: 'MODER1', position: '2-3', value: 0, description: 'Port mode for pin 1' },
      ],
      description: 'GPIO Mode Register',
    },
    ODR: {
      offset: 0x14,
      bits: [
        { name: 'ODR0-15', position: '0-15', value: 0, description: 'Output data' },
      ],
      description: 'Output Data Register',
    },
  },
};

export class RegisterInspectTool extends BaseTool {
  readonly name = 'register_inspect';
  readonly description = 'Read or write peripheral registers on connected target';
  readonly inputSchema = RegisterInputSchema;
  readonly category = ToolCategory.DEBUG;

  protected async execute(params: RegisterInput): Promise<RegisterInspectResult> {
    const peripheral = params.peripheral.toUpperCase();
    const register = params.register.toUpperCase();

    // Get peripheral base address
    const baseAddr = PERIPHERAL_BASES[peripheral];
    if (baseAddr === undefined) {
      return {
        success: false,
        value: 0,
        hexValue: '0x00000000',
        binaryValue: '0b00000000000000000000000000000000',
        bits: [],
        description: `Unknown peripheral: ${peripheral}`,
      };
    }

    // Get register definition
    const regDef = REGISTER_DEFS[peripheral]?.[register];
    if (regDef === undefined) {
      return {
        success: false,
        value: 0,
        hexValue: '0x00000000',
        binaryValue: '0b00000000000000000000000000000000',
        bits: [],
        description: `Unknown register: ${register} for ${peripheral}`,
      };
    }

    // Simulate register read
    const value = this.simulateRead(peripheral, register);

    // Format output
    const bits = regDef.bits.map(b => ({
      ...b,
      value: this.extractBits(value, b.position),
    }));

    return {
      success: true,
      value,
      hexValue: `0x${value.toString(16).toUpperCase().padStart(8, '0')}`,
      binaryValue: `0b${value.toString(2).padStart(32, '0')}`,
      bits,
      description: `${peripheral}->${register} (${regDef.description})`,
    };
  }

  private simulateRead(peripheral: string, register: string): number {
    // Simulated register values
    const values: Record<string, Record<string, number>> = {
      I2C1: {
        CR1: 0x0001, // PE enabled
        CR2: 0x0000,
        SR1: 0x0001, // SB set
      },
      GPIOA: {
        MODER: 0xA8000000, // Default reset value
        ODR: 0x0000,
      },
    };

    return values[peripheral]?.[register] ?? 0;
  }

  private extractBits(value: number, position: string): number {
    const parts = position.split('-');
    if (parts.length === 1) {
      const bit = parseInt(parts[0] ?? '0', 10);
      return (value >> bit) & 1;
    } else {
      const low = parseInt(parts[0] ?? '0', 10);
      const high = parseInt(parts[1] ?? '0', 10);
      const mask = (1 << (high - low + 1)) - 1;
      return (value >> low) & mask;
    }
  }
}
