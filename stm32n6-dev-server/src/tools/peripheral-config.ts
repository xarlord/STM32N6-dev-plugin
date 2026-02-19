/**
 * Peripheral Config Tool
 * Generate peripheral initialization code
 */

import { z } from 'zod';
import { BaseTool, ToolCategory } from './base.js';
import type { PeripheralConfigResult, GeneratedFile, PinAssignment, DMAChannel, InterruptConfig } from '../types/index.js';

const PeripheralInputSchema = z.object({
  peripheral: z.enum([
    'I2C1', 'I2C2', 'I2C3',
    'SPI1', 'SPI2', 'SPI3',
    'USART1', 'USART2', 'USART3', 'UART4', 'UART5',
    'CAN', 'CANFD',
    'ETH',
    'DSI', 'CSI',
    'ADC1', 'ADC2',
    'DAC',
    'TIM1', 'TIM2', 'TIM3', 'TIM4', 'TIM5',
  ]),
  mode: z.string().describe('Operating mode (master, slave, tx, rx, etc.)'),
  config: z.record(z.unknown()).describe('Peripheral-specific configuration'),
  outputPath: z.string().optional(),
  useDma: z.boolean().default(true),
  useInterrupts: z.boolean().default(true),
  driverType: z.enum(['HAL', 'LL']).default('HAL'),
  generateExample: z.boolean().default(true),
});

type PeripheralInput = z.infer<typeof PeripheralInputSchema>;

export class PeripheralConfigTool extends BaseTool {
  readonly name = 'peripheral_config';
  readonly description = 'Generate peripheral initialization code for STM32N6';
  readonly inputSchema = PeripheralInputSchema;
  readonly category = ToolCategory.CODE_GEN;

  protected async execute(params: PeripheralInput): Promise<PeripheralConfigResult> {
    const peripheralType = this.getPeripheralType(params.peripheral);
    const files: GeneratedFile[] = [];
    const pinConfig: PinAssignment[] = [];
    const dmaConfig: DMAChannel[] = [];
    const interruptConfig: InterruptConfig[] = [];

    // Generate header file
    files.push({
      path: `${params.peripheral.toLowerCase()}_driver.h`,
      content: this.generateHeader(params),
      type: 'header',
    });

    // Generate source file
    files.push({
      path: `${params.peripheral.toLowerCase()}_driver.c`,
      content: this.generateSource(params),
      type: 'source',
    });

    // Generate config file
    files.push({
      path: `${params.peripheral.toLowerCase()}_config.h`,
      content: this.generateConfig(params),
      type: 'config',
    });

    // Generate example if requested
    if (params.generateExample) {
      files.push({
        path: `${params.peripheral.toLowerCase()}_example.c`,
        content: this.generateExample(params),
        type: 'example',
      });
    }

    // Generate pin configuration
    pinConfig.push(...this.getPinConfig(params.peripheral, params.mode));

    // Generate DMA configuration if enabled
    if (params.useDma) {
      dmaConfig.push(...this.getDmaConfig(params.peripheral));
    }

    // Generate interrupt configuration if enabled
    if (params.useInterrupts) {
      interruptConfig.push(...this.getInterruptConfig(params.peripheral));
    }

    return {
      success: true,
      files,
      pinConfig,
      dmaConfig: dmaConfig.length > 0 ? dmaConfig : undefined,
      interruptConfig: interruptConfig.length > 0 ? interruptConfig : undefined,
    };
  }

  private getPeripheralType(peripheral: string): string {
    if (peripheral.startsWith('I2C')) return 'I2C';
    if (peripheral.startsWith('SPI')) return 'SPI';
    if (peripheral.startsWith('USART') || peripheral.startsWith('UART')) return 'USART';
    if (peripheral.startsWith('CAN')) return 'CAN';
    if (peripheral === 'ETH') return 'Ethernet';
    if (peripheral === 'DSI') return 'DSI';
    if (peripheral === 'CSI') return 'CSI';
    if (peripheral.startsWith('ADC')) return 'ADC';
    if (peripheral === 'DAC') return 'DAC';
    if (peripheral.startsWith('TIM')) return 'Timer';
    return 'Unknown';
  }

  private generateHeader(params: PeripheralInput): string {
    const guardName = `__${params.peripheral.toUpperCase()}_DRIVER_H`;
    const periphType = this.getPeripheralType(params.peripheral);

    return `/**
 * ${params.peripheral} Driver Header
 * Generated for STM32N6570
 * Mode: ${params.mode}
 * Driver Type: ${params.driverType}
 */

#ifndef ${guardName}
#define ${guardName}

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32n6xx.h"
#include "${params.peripheral.toLowerCase()}_config.h"

/* Error codes */
typedef enum {
    ${params.peripheral}_OK = 0,
    ${params.peripheral}_ERROR = -1,
    ${params.peripheral}_BUSY = -2,
    ${params.peripheral}_TIMEOUT = -3,
    ${params.peripheral}_INVALID_PARAM = -4,
} ${params.peripheral}_Status_t;

/* Handle structure */
typedef struct {
    ${periphType}_TypeDef *instance;
    ${params.peripheral}_Config_t config;
    volatile bool isInitialized;
    volatile bool isBusy;

    /* Callbacks */
    void (*txCompleteCallback)(void);
    void (*rxCompleteCallback)(void);
    void (*errorCallback)(${params.peripheral}_Status_t error);
} ${params.peripheral}_Handle_t;

/* Function prototypes */
${params.peripheral}_Status_t ${params.peripheral}_Init(${params.peripheral}_Handle_t *handle, const ${params.peripheral}_Config_t *config);
${params.peripheral}_Status_t ${params.peripheral}_DeInit(${params.peripheral}_Handle_t *handle);
${params.peripheral}_Status_t ${params.peripheral}_Transmit(${params.peripheral}_Handle_t *handle, const uint8_t *data, uint16_t len, uint32_t timeout);
${params.peripheral}_Status_t ${params.peripheral}_Receive(${params.peripheral}_Handle_t *handle, uint8_t *data, uint16_t len, uint32_t timeout);

#ifdef __cplusplus
}
#endif

#endif /* ${guardName} */
`;
  }

  private generateSource(params: PeripheralInput): string {
    return `/**
 * ${params.peripheral} Driver Source
 * Generated for STM32N6570
 */

#include "${params.peripheral.toLowerCase()}_driver.h"
#include <string.h>

${params.peripheral}_Status_t ${params.peripheral}_Init(${params.peripheral}_Handle_t *handle, const ${params.peripheral}_Config_t *config)
{
    if (handle == NULL || config == NULL) {
        return ${params.peripheral}_INVALID_PARAM;
    }

    /* Copy configuration */
    memcpy(&handle->config, config, sizeof(${params.peripheral}_Config_t));

    /* Enable peripheral clock */
    /* TODO: Add clock enable for ${params.peripheral} */

    /* Configure GPIO pins */
    /* TODO: Add GPIO configuration */

    /* Configure peripheral */
    /* TODO: Add ${params.peripheral} configuration */

    handle->isInitialized = true;
    handle->isBusy = false;

    return ${params.peripheral}_OK;
}

${params.peripheral}_Status_t ${params.peripheral}_DeInit(${params.peripheral}_Handle_t *handle)
{
    if (handle == NULL) {
        return ${params.peripheral}_INVALID_PARAM;
    }

    /* Disable peripheral */
    /* TODO: Add de-initialization */

    handle->isInitialized = false;
    return ${params.peripheral}_OK;
}

${params.peripheral}_Status_t ${params.peripheral}_Transmit(${params.peripheral}_Handle_t *handle, const uint8_t *data, uint16_t len, uint32_t timeout)
{
    if (handle == NULL || data == NULL) {
        return ${params.peripheral}_INVALID_PARAM;
    }

    if (!handle->isInitialized) {
        return ${params.peripheral}_ERROR;
    }

    if (handle->isBusy) {
        return ${params.peripheral}_BUSY;
    }

    handle->isBusy = true;

    /* TODO: Implement transmit */

    handle->isBusy = false;
    return ${params.peripheral}_OK;
}

${params.peripheral}_Status_t ${params.peripheral}_Receive(${params.peripheral}_Handle_t *handle, uint8_t *data, uint16_t len, uint32_t timeout)
{
    if (handle == NULL || data == NULL) {
        return ${params.peripheral}_INVALID_PARAM;
    }

    if (!handle->isInitialized) {
        return ${params.peripheral}_ERROR;
    }

    if (handle->isBusy) {
        return ${params.peripheral}_BUSY;
    }

    handle->isBusy = true;

    /* TODO: Implement receive */

    handle->isBusy = false;
    return ${params.peripheral}_OK;
}
`;
  }

  private generateConfig(params: PeripheralInput): string {
    const guardName = `__${params.peripheral.toUpperCase()}_CONFIG_H`;

    return `/**
 * ${params.peripheral} Configuration Header
 * Generated for STM32N6570
 */

#ifndef ${guardName}
#define ${guardName}

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>
#include <stdbool.h>

/* Configuration structure */
typedef struct {
    uint32_t mode;           /* Operating mode */
    uint32_t speed;          /* Clock speed */
    bool useDma;             /* Use DMA transfers */
    bool useInterrupts;      /* Use interrupts */
} ${params.peripheral}_Config_t;

/* Default configuration */
#define ${params.peripheral}_DEFAULT_CONFIG { \\
    .mode = 0, \\
    .speed = 400000, \\
    .useDma = ${params.useDma ? 'true' : 'false'}, \\
    .useInterrupts = ${params.useInterrupts ? 'true' : 'false'}, \\
}

#ifdef __cplusplus
}
#endif

#endif /* ${guardName} */
`;
  }

  private generateExample(params: PeripheralInput): string {
    return `/**
 * ${params.peripheral} Usage Example
 * Generated for STM32N6570
 */

#include "${params.peripheral.toLowerCase()}_driver.h"

static ${params.peripheral}_Handle_t h${params.peripheral.toLowerCase()};

void ${params.peripheral}_Example_Init(void)
{
    ${params.peripheral}_Config_t config = ${params.peripheral}_DEFAULT_CONFIG;

    /* Initialize ${params.peripheral} */
    if (${params.peripheral}_Init(&h${params.peripheral.toLowerCase()}, &config) != ${params.peripheral}_OK) {
        /* Handle initialization error */
        while(1);
    }
}

void ${params.peripheral}_Example_Run(void)
{
    uint8_t txData[] = "Hello STM32N6!";
    uint8_t rxData[32];

    /* Transmit data */
    ${params.peripheral}_Transmit(&h${params.peripheral.toLowerCase()}, txData, sizeof(txData), 1000);

    /* Receive data */
    ${params.peripheral}_Receive(&h${params.peripheral.toLowerCase()}, rxData, sizeof(rxData), 1000);
}
`;
  }

  private getPinConfig(peripheral: string, mode: string): PinAssignment[] {
    const pinMap: Record<string, PinAssignment[]> = {
      'I2C1': [
        { pin: 'PB6', mode: 'alternate', pull: 'up', alternate: 4 },
        { pin: 'PB7', mode: 'alternate', pull: 'up', alternate: 4 },
      ],
      'I2C2': [
        { pin: 'PB10', mode: 'alternate', pull: 'up', alternate: 4 },
        { pin: 'PB11', mode: 'alternate', pull: 'up', alternate: 4 },
      ],
      'SPI1': [
        { pin: 'PA5', mode: 'alternate', pull: 'none', alternate: 5 },
        { pin: 'PA6', mode: 'alternate', pull: 'none', alternate: 5 },
        { pin: 'PA7', mode: 'alternate', pull: 'none', alternate: 5 },
      ],
      'USART1': [
        { pin: 'PA9', mode: 'alternate', pull: 'up', alternate: 7 },
        { pin: 'PA10', mode: 'alternate', pull: 'up', alternate: 7 },
      ],
    };

    return pinMap[peripheral] ?? [
      { pin: 'TBD', mode: 'alternate', pull: 'none', alternate: 0 },
    ];
  }

  private getDmaConfig(peripheral: string): DMAChannel[] {
    const dmaMap: Record<string, DMAChannel[]> = {
      'I2C1': [
        { stream: 'DMA1_Stream0', channel: 1, direction: 'memory_to_periph' },
        { stream: 'DMA1_Stream1', channel: 1, direction: 'periph_to_memory' },
      ],
      'SPI1': [
        { stream: 'DMA1_Stream2', channel: 3, direction: 'memory_to_periph' },
        { stream: 'DMA1_Stream3', channel: 3, direction: 'periph_to_memory' },
      ],
    };

    return dmaMap[peripheral] ?? [];
  }

  private getInterruptConfig(peripheral: string): InterruptConfig[] {
    const irqMap: Record<string, InterruptConfig[]> = {
      'I2C1': [
        { irq: 'I2C1_EV_IRQn', priority: 5, subPriority: 0 },
        { irq: 'I2C1_ER_IRQn', priority: 5, subPriority: 0 },
      ],
      'SPI1': [
        { irq: 'SPI1_IRQn', priority: 5, subPriority: 0 },
      ],
      'USART1': [
        { irq: 'USART1_IRQn', priority: 5, subPriority: 0 },
      ],
    };

    return irqMap[peripheral] ?? [];
  }
}
