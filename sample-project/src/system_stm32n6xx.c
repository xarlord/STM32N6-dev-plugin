/**
 * @file    system_stm32n6xx.c
 * @brief   CMSIS Cortex-M55 Device Peripheral Access Layer System Source File
 */

#include "stm32n6xx.h"

/* System Clock Frequency (Core Clock) */
uint32_t SystemCoreClock = 64000000UL;

/**
 * @brief  Setup the microcontroller system
 */
void SystemInit(void)
{
    /* FPU settings */
#if (__FPU_PRESENT == 1) && (__FPU_USED == 1)
    SCB->CPACR |= ((3UL << 10 * 2) | (3UL << 11 * 2));
#endif

    /* Reset the RCC clock configuration */
    RCC->CR |= RCC_CR_HSION;
    RCC->CFGR = 0x00000000U;
    RCC->CR &= ~(RCC_CR_HSEON | RCC_CR_CSSON | RCC_CR_HSEBYP);
    RCC->PLL1CFGR = 0x00000000U;

    /* Disable all interrupts */
    RCC->CIER = 0x00000000U;
}

/**
 * @brief  Update SystemCoreClock variable
 */
void SystemCoreClockUpdate(void)
{
    uint32_t tmp;
    uint32_t pllp;
    uint32_t pllsource;
    uint32_t pllm;
    uint32_t plln;

    /* Get SYSCLK source */
    tmp = RCC->CFGR & RCC_CFGR_SWS;

    switch (tmp)
    {
        case 0x00:  /* HSI used as system clock */
            SystemCoreClock = 64000000UL;
            break;

        case 0x04:  /* HSE used as system clock */
            SystemCoreClock = 25000000UL;
            break;

        case 0x08:  /* PLL1 used as system clock */
            pllsource = (RCC->PLL1CFGR & RCC_PLL1CFGR_PLL1SRC);
            pllm = ((RCC->PLL1CFGR & RCC_PLL1CFGR_PLL1M) >> RCC_PLL1CFGR_PLL1M_Pos) + 1U;
            plln = ((RCC->PLL1DIVR & RCC_PLL1DIVR_N1) >> RCC_PLL1DIVR_N1_Pos) + 1U;
            pllp = ((RCC->PLL1DIVR & RCC_PLL1DIVR_P1) >> RCC_PLL1DIVR_P1_Pos) + 1U;

            if (pllsource == 0x00)
            {
                /* HSI used as PLL source */
                SystemCoreClock = (64000000UL / pllm) * plln / pllp;
            }
            else
            {
                /* HSE used as PLL source */
                SystemCoreClock = (25000000UL / pllm) * plln / pllp;
            }
            break;

        default:
            SystemCoreClock = 64000000UL;
            break;
    }
}
