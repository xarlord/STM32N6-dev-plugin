/**
 * @file    main.c
 * @brief   STM32N6570-DK Blinky Example
 * @author  STM32N6 Dev Team
 */

#include "stm32n6xx.h"
#include "stm32n6570_discovery.h"

/* Private defines */
#define LED_PIN     GPIO_PIN_0
#define LED_PORT    GPIOB

/* Private variables */
volatile uint32_t ticks = 0;

/**
 * @brief  System Clock Configuration
 */
void SystemClock_Config(void)
{
    /* Enable Power Clock */
    __HAL_RCC_PWR_CLK_ENABLE();

    /* Configure voltage scaling */
    __HAL_PWR_VOLTAGESCALING_CONFIG(PWR_REGULATOR_VOLTAGE_SCALE0);

    /* Wait for voltage scaling to be ready */
    while ((PWR->VOSR & PWR_VOSR_VOSRDY) == 0);

    /* Initialize HSE */
    RCC->CR |= RCC_CR_HSEON;
    while ((RCC->CR & RCC_CR_HSERDY) == 0);

    /* Configure PLL1 for 800 MHz */
    /* PLL1 source: HSE = 25 MHz */
    /* PLL1 M = 5, N = 160, P = 2 */
    /* VCO = 25 * 160 / 5 = 800 MHz */
    /* PLL1_P = 800 / 2 = 400 MHz (SYSCLK) */

    RCC->PLL1DIVR = ((160 - 1) << RCC_PLL1DIVR_N1_Pos) |
                    ((2 - 1) << RCC_PLL1DIVR_P1_Pos);

    RCC->PLL1CFGR = RCC_PLL1CFGR_PLL1RGE_1 |
                    RCC_PLL1CFGR_PLL1SRC_HSE;

    /* Enable PLL1 */
    RCC->CR |= RCC_CR_PLL1ON;
    while ((RCC->CR & RCC_CR_PLL1RDY) == 0);

    /* Configure bus prescalers */
    RCC->CFGR2 = (0 << RCC_CFGR2_HPRE_Pos) |    /* AHB = /1 */
                 (3 << RCC_CFGR2_PPRE1_Pos) |   /* APB1 = /8 */
                 (2 << RCC_CFGR2_PPRE2_Pos);    /* APB2 = /4 */

    /* Select PLL1 as system clock */
    RCC->CFGR = (RCC->CFGR & ~RCC_CFGR_SW) | RCC_CFGR_SW_PLL1;
    while ((RCC->CFGR & RCC_CFGR_SWS) != RCC_CFGR_SWS_PLL1);

    /* Update SystemCoreClock */
    SystemCoreClock = 400000000UL;
}

/**
 * @brief  GPIO Initialization
 */
static void GPIO_Init(void)
{
    GPIO_InitTypeDef GPIO_InitStruct = {0};

    /* Enable GPIOB clock */
    __HAL_RCC_GPIOB_CLK_ENABLE();

    /* Configure LED pin */
    GPIO_InitStruct.Pin = LED_PIN;
    GPIO_InitStruct.Mode = GPIO_MODE_OUTPUT_PP;
    GPIO_InitStruct.Pull = GPIO_NOPULL;
    GPIO_InitStruct.Speed = GPIO_SPEED_FREQ_HIGH;
    HAL_GPIO_Init(LED_PORT, &GPIO_InitStruct);
}

/**
 * @brief  SysTick Handler
 */
void SysTick_Handler(void)
{
    ticks++;
}

/**
 * @brief  Main entry point
 */
int main(void)
{
    /* HAL Initialization */
    HAL_Init();

    /* Configure system clock */
    SystemClock_Config();

    /* Initialize GPIO */
    GPIO_Init();

    /* Configure SysTick for 1ms interrupts */
    SysTick_Config(SystemCoreClock / 1000);

    /* Main loop */
    while (1)
    {
        /* Toggle LED every 500ms */
        if (ticks >= 500)
        {
            ticks = 0;
            HAL_GPIO_TogglePin(LED_PORT, LED_PIN);
        }
    }
}

/**
 * @brief  Error Handler
 */
void Error_Handler(void)
{
    __disable_irq();
    while (1)
    {
        /* Stay here */
    }
}
