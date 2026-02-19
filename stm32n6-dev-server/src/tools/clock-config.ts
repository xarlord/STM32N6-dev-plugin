/**
 * Clock Config Tool
 * Generate clock tree configuration code
 */

import { z } from 'zod';
import { BaseTool, ToolCategory } from './base.js';
import type { ClockConfigResult, ClockFrequencies, GeneratedFile } from '../types/index.js';

const ClockInputSchema = z.object({
  sysclk: z.number().max(800000000).describe('Target system clock frequency in Hz'),
  source: z.enum(['HSI', 'HSE', 'PLL']).default('PLL'),
  hseFrequency: z.number().optional().describe('HSE frequency in Hz'),
  pllConfig: z.object({
    m: z.number(),
    n: z.number(),
    p: z.number(),
    q: z.number(),
    r: z.number(),
  }).optional(),
  busPrescalers: z.object({
    ahb: z.number().default(1),
    apb1: z.number().default(4),
    apb2: z.number().default(2),
    apb3: z.number().default(2),
  }).optional(),
  outputPath: z.string().optional(),
});

type ClockInput = z.infer<typeof ClockInputSchema>;

export class ClockConfigTool extends BaseTool {
  readonly name = 'clock_config';
  readonly description = 'Generate clock tree configuration for STM32N6';
  readonly inputSchema = ClockInputSchema;
  readonly category = ToolCategory.CODE_GEN;

  protected async execute(params: ClockInput): Promise<ClockConfigResult> {
    const warnings: string[] = [];

    // Validate clock settings
    if (params.sysclk > 800000000) {
      warnings.push('SYSCLK exceeds maximum of 800 MHz');
    }

    // Calculate frequencies
    const frequencies: ClockFrequencies = {
      sysclk: params.sysclk,
      hclk: params.sysclk / (params.busPrescalers?.ahb ?? 1),
      pclk1: params.sysclk / (params.busPrescalers?.apb1 ?? 4),
      pclk2: params.sysclk / (params.busPrescalers?.apb2 ?? 2),
      pclk3: params.sysclk / (params.busPrescalers?.apb3 ?? 2),
    };

    // Validate APB frequencies
    if (frequencies.pclk1 > 200000000) {
      warnings.push('APB1 frequency exceeds 200 MHz maximum');
    }
    if (frequencies.pclk2 > 400000000) {
      warnings.push('APB2 frequency exceeds 400 MHz maximum');
    }

    // Generate files
    const files: GeneratedFile[] = [
      {
        path: 'clock_config.c',
        content: this.generateSource(params, frequencies),
        type: 'source',
      },
      {
        path: 'clock_config.h',
        content: this.generateHeader(params, frequencies),
        type: 'header',
      },
    ];

    return {
      success: true,
      frequencies,
      files,
      warnings,
    };
  }

  private generateSource(params: ClockInput, freq: ClockFrequencies): string {
    const pllConfig = params.pllConfig ?? { m: 5, n: 160, p: 2, q: 2, r: 2 };

    return `/**
 * Clock Configuration Source
 * Generated for STM32N6570
 * Target SYSCLK: ${params.sysclk / 1000000} MHz
 */

#include "clock_config.h"
#include "stm32n6xx.h"

/* Clock frequencies */
uint32_t SystemCoreClock = ${params.sysclk}UL;
uint32_t HCLK_Frequency = ${freq.hclk}UL;
uint32_t PCLK1_Frequency = ${freq.pclk1}UL;
uint32_t PCLK2_Frequency = ${freq.pclk2}UL;

void SystemClock_Config(void)
{
    /* Enable Power Clock */
    __HAL_RCC_PWR_CLK_ENABLE();

    /* Configure voltage scaling for high performance */
    __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE0);
    while ((PWR->VOSR & PWR_VOSR_VOSRDY) == 0);

    /* Configure PLL1 */
    /* Source: ${params.source} */
    /* M = ${pllConfig.m}, N = ${pllConfig.n}, P = ${pllConfig.p} */
    RCC->PLL1DIVR = ((${pllConfig.n} - 1) << RCC_PLL1DIVR_N1_Pos) |
                    ((${pllConfig.p} - 1) << RCC_PLL1DIVR_P1_Pos);

    RCC->PLL1CFGR = RCC_PLL1CFGR_PLL1RGE_1 |  /* Input freq range */
                    RCC_PLL1CFGR_PLL1SRC_${params.source === 'HSE' ? 'HSE' : 'HSI'};

    /* Enable PLL1 */
    RCC->CR |= RCC_CR_PLL1ON;
    while ((RCC->CR & RCC_CR_PLL1RDY) == 0);

    /* Configure bus prescalers */
    /* AHB = /${params.busPrescalers?.ahb ?? 1} */
    /* APB1 = /${params.busPrescalers?.apb1 ?? 4} */
    /* APB2 = /${params.busPrescalers?.apb2 ?? 2} */
    RCC->CFGR = (0 << RCC_CFGR_HPRE_Pos) |       /* AHB prescaler */
                (3 << RCC_CFGR_PPRE1_Pos) |      /* APB1 prescaler */
                (2 << RCC_CFGR_PPRE2_Pos);       /* APB2 prescaler */

    /* Select PLL1 as system clock */
    RCC->CFGR &= ~RCC_CFGR_SW;
    RCC->CFGR |= RCC_CFGR_SW_PLL1;
    while ((RCC->CFGR & RCC_CFGR_SWS) != RCC_CFGR_SWS_PLL1);

    /* Update SystemCoreClock */
    SystemCoreClock = ${params.sysclk}UL;
    HCLK_Frequency = ${freq.hclk}UL;
    PCLK1_Frequency = ${freq.pclk1}UL;
    PCLK2_Frequency = ${freq.pclk2}UL;
}

void SystemCoreClockUpdate(void)
{
    uint32_t hsi = 64000000UL;
    uint32_t hse = ${params.hseFrequency ?? 25000000}UL;

    /* Determine clock source */
    uint32_t sws = (RCC->CFGR & RCC_CFGR_SWS) >> RCC_CFGR_SWS_Pos;

    switch (sws) {
        case 0:  /* HSI */
            SystemCoreClock = hsi;
            break;
        case 1:  /* HSE */
            SystemCoreClock = hse;
            break;
        case 2:  /* PLL1 */
            /* Calculate PLL1 output */
            SystemCoreClock = ${params.sysclk}UL;
            break;
        default:
            SystemCoreClock = hsi;
            break;
    }

    /* Apply prescalers */
    uint32_t hpre = (RCC->CFGR & RCC_CFGR_HPRE) >> RCC_CFGR_HPRE_Pos;
    if (hpre > 0) {
        SystemCoreClock >>= hpre;
    }
}
`;
  }

  private generateHeader(params: ClockInput, freq: ClockFrequencies): string {
    return `/**
 * Clock Configuration Header
 * Generated for STM32N6570
 */

#ifndef __CLOCK_CONFIG_H
#define __CLOCK_CONFIG_H

#ifdef __cplusplus
extern "C" {
#endif

#include <stdint.h>

/* Clock frequencies */
#define SYSCLK_FREQ         ${params.sysclk}UL
#define HCLK_FREQ           ${freq.hclk}UL
#define PCLK1_FREQ          ${freq.pclk1}UL
#define PCLK2_FREQ          ${freq.pclk2}UL

/* HSE configuration */
#define HSE_VALUE           ${params.hseFrequency ?? 25000000}UL
#define HSI_VALUE           64000000UL

/* PLL configuration */
#define PLL1_M              ${params.pllConfig?.m ?? 5}
#define PLL1_N              ${params.pllConfig?.n ?? 160}
#define PLL1_P              ${params.pllConfig?.p ?? 2}
#define PLL1_Q              ${params.pllConfig?.q ?? 2}
#define PLL1_R              ${params.pllConfig?.r ?? 2}

/* External variables */
extern uint32_t SystemCoreClock;
extern uint32_t HCLK_Frequency;
extern uint32_t PCLK1_Frequency;
extern uint32_t PCLK2_Frequency;

/* Function prototypes */
void SystemClock_Config(void);
void SystemCoreClockUpdate(void);

#ifdef __cplusplus
}
#endif

#endif /* __CLOCK_CONFIG_H */
`;
  }
}
