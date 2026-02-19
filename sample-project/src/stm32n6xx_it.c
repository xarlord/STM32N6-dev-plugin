/**
 * @file    stm32n6xx_it.c
 * @brief   Interrupt handlers for STM32N6570-DK
 */

#include "stm32n6xx.h"
#include "stm32n6xx_it.h"

/**
 * @brief  NMI Handler
 */
void NMI_Handler(void)
{
    while (1)
    {
    }
}

/**
 * @brief  Hard Fault Handler
 */
void HardFault_Handler(void)
{
    while (1)
    {
    }
}

/**
 * @brief  Memory Management Fault Handler
 */
void MemManage_Handler(void)
{
    while (1)
    {
    }
}

/**
 * @brief  Bus Fault Handler
 */
void BusFault_Handler(void)
{
    while (1)
    {
    }
}

/**
 * @brief  Usage Fault Handler
 */
void UsageFault_Handler(void)
{
    while (1)
    {
    }
}

/**
 * @brief  SVCall Handler
 */
void SVC_Handler(void)
{
}

/**
 * @brief  Debug Monitor Handler
 */
void DebugMon_Handler(void)
{
}

/**
 * @brief  PendSV Handler
 */
void PendSV_Handler(void)
{
}

/**
 * @brief  SysTick Handler (weak alias)
 */
__weak void SysTick_Handler(void)
{
}
