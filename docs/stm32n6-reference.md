# STM32N6 Reference Architecture - STM32N6570-DK

**Document Version:** 1.0
**Date:** 2026-02-18
**Status:** Phase 2 - Architecture Design

---

## Table of Contents

1. [Memory Map](#1-memory-map)
2. [Boot Sequence](#2-boot-sequence)
3. [Clock Architecture](#3-clock-architecture)
4. [Driver Codebase Patterns](#4-driver-codebase-patterns)
5. [Interrupt Architecture](#5-interrupt-architecture)
6. [DMA Architecture](#6-dma-architecture)
7. [Power Management](#7-power-management)
8. [BSP Component Reference](#8-bsp-component-reference)

---

## 1. Memory Map

### 1.1 STM32N6570 Memory Organization

```
+------------------+------------------+------------------+
| Memory Region    | Address Range    | Size             |
+------------------+------------------+------------------+
| Code (Flash)     | 0x0800_0000 -    | 2 MB             |
|                  | 0x081F_FFFF      |                  |
+------------------+------------------+------------------+
| System Memory    | 0x0BF9_0000 -    | 128 KB           |
| (Bootloader)     | 0x0BFA_FFFF      |                  |
+------------------+------------------+------------------+
| SRAM1            | 0x2000_0000 -    | 512 KB           |
|                  | 0x2007_FFFF      |                  |
+------------------+------------------+------------------+
| SRAM2            | 0x2008_0000 -    | 512 KB           |
|                  | 0x200F_FFFF      |                  |
+------------------+------------------+------------------+
| SRAM3            | 0x2010_0000 -    | 512 KB           |
|                  | 0x2017_FFFF      |                  |
+------------------+------------------+------------------+
| SRAM4 (Backup)   | 0x2018_0000 -    | 64 KB            |
|                  | 0x2018_FFFF      |                  |
+------------------+------------------+------------------+
| SRAM5 (Ethernet) | 0x2019_0000 -    | 64 KB            |
|                  | 0x2019_FFFF      |                  |
+------------------+------------------+------------------+
| DTCM             | 0x2000_0000 -    | 128 KB           |
| (Data TCM)       | (aliased)        |                  |
+------------------+------------------+------------------+
| ITCM             | 0x0000_0000 -    | 128 KB           |
| (Instruction TCM)| 0x0001_FFFF      |                  |
+------------------+------------------+------------------+
| Peripheral       | 0x4000_0000 -    | 512 MB           |
| Registers        | 0x5FFF_FFFF      | (APB/AHB)        |
+------------------+------------------+------------------+
| External Memory  | 0x6000_0000 -    | 1 GB             |
| (FMC/OCTOSPI)    | 0x9FFF_FFFF      |                  |
+------------------+------------------+------------------+
| System           | 0xE000_0000 -    | 1 MB             |
| (PPB)            | 0xE00F_FFFF      |                  |
+------------------+------------------+------------------+
```

### 1.2 Total Internal RAM: 4.2 MB

| SRAM Region | Size | Purpose |
|-------------|------|---------|
| SRAM1 | 512 KB | General purpose, buffers |
| SRAM2 | 512 KB | General purpose, stacks |
| SRAM3 | 512 KB | AI/ML buffers, frame buffers |
| SRAM4 | 64 KB | Backup domain, retention |
| SRAM5 | 64 KB | Ethernet DMA buffers |
| DTCM | 128 KB | Fast data access, stacks |
| ITCM | 128 KB | Fast code execution, ISRs |

### 1.3 Linker Script Template

```ld
/* STM32N6570 Linker Script Template */

/* Entry point */
ENTRY(Reset_Handler)

/* Memory regions */
MEMORY
{
    ITCM (rx)      : ORIGIN = 0x00000000, LENGTH = 128K
    FLASH (rx)     : ORIGIN = 0x08000000, LENGTH = 2048K
    DTCM (rwx)     : ORIGIN = 0x20000000, LENGTH = 128K
    SRAM1 (rwx)    : ORIGIN = 0x20000000, LENGTH = 512K
    SRAM2 (rwx)    : ORIGIN = 0x20080000, LENGTH = 512K
    SRAM3 (rwx)    : ORIGIN = 0x20100000, LENGTH = 512K
    SRAM4 (rwx)    : ORIGIN = 0x20180000, LENGTH = 64K
    SRAM5 (rwx)    : ORIGIN = 0x20190000, LENGTH = 64K
}

/* Stack and heap sizes */
_stack_size = 0x4000;    /* 16 KB */
_heap_size = 0x20000;    /* 128 KB */

/* Sections */
SECTIONS
{
    /* Interrupt vector table in ITCM for fast access */
    .isr_vector :
    {
        . = ALIGN(4);
        KEEP(*(.isr_vector))
        . = ALIGN(4);
    } > ITCM AT > FLASH

    /* Code section */
    .text :
    {
        . = ALIGN(4);
        *(.text)
        *(.text*)
        *(.glue_7)
        *(.glue_7t)
        KEEP(*(.init))
        KEEP(*(.fini))
        . = ALIGN(4);
        _etext = .;
    } > FLASH

    /* Read-only data */
    .rodata :
    {
        . = ALIGN(4);
        *(.rodata)
        *(.rodata*)
        . = ALIGN(4);
    } > FLASH

    /* Initialized data */
    _sidata = LOADADDR(.data);
    .data :
    {
        . = ALIGN(4);
        _sdata = .;
        *(.data)
        *(.data*)
        . = ALIGN(4);
        _edata = .;
    } > SRAM1 AT > FLASH

    /* Uninitialized data */
    .bss :
    {
        . = ALIGN(4);
        _sbss = .;
        *(.bss)
        *(.bss*)
        *(COMMON)
        . = ALIGN(4);
        _ebss = .;
    } > SRAM1

    /* Heap */
    .heap :
    {
        . = ALIGN(8);
        _heap_start = .;
        . = . + _heap_size;
        _heap_end = .;
    } > SRAM1

    /* Stack */
    .stack :
    {
        . = ALIGN(8);
        _stack_end = .;
        . = . + _stack_size;
        _stack_start = .;
    } > SRAM1

    /* AI/ML buffers in SRAM3 */
    .ai_buffers (NOLOAD) :
    {
        . = ALIGN(16);
        _ai_buffer_start = .;
        *(.ai_buffer)
        *(.nn_buffer)
        _ai_buffer_end = .;
    } > SRAM3
}
```

---

## 2. Boot Sequence

### 2.1 Boot Modes

| BOOT0 | BOOT1 | Boot Mode | Address |
|-------|-------|-----------|---------|
| 0 | X | Main Flash | 0x0800_0000 |
| 1 | 0 | System Memory (Bootloader) | 0x0BF9_0000 |
| 1 | 1 | Embedded SRAM | 0x2000_0000 |

### 2.2 Boot Sequence Flow

```
                    +-------------------+
                    |      Reset        |
                    +-------------------+
                            |
                            v
                    +-------------------+
                    |  Read BOOT Pins   |
                    +-------------------+
                            |
            +---------------+---------------+
            |               |               |
            v               v               v
    +------------+  +------------+  +------------+
    | Main Flash |  | System Mem |  |    SRAM    |
    +------------+  +------------+  +------------+
            |               |               |
            v               v               v
    +-------------------+                    |
    | Vector Table      |                    |
    | (0x08000000)      |                    |
    +-------------------+                    |
            |                               |
            v                               |
    +-------------------+                    |
    | Reset_Handler     |                    |
    +-------------------+                    |
            |                               |
            v                               |
    +-------------------+                    |
    | System Init       |                    |
    | - Clock Config    |                    |
    | - FPU Enable      |                    |
    | - Cache Enable    |                    |
    +-------------------+                    |
            |                               |
            v                               |
    +-------------------+                    |
    | Data Init         |                    |
    | - Copy .data      |                    |
    | - Zero .bss       |                    |
    +-------------------+                    |
            |                               |
            v                               |
    +-------------------+                    |
    | main()            |<-------------------+
    +-------------------+
```

### 2.3 Startup Code Template

```c
/* startup_stm32n6570.c */

#include "stm32n6570.h"

/* Linker symbols */
extern uint32_t _estack;
extern uint32_t _sidata;
extern uint32_t _sdata;
extern uint32_t _edata;
extern uint32_t _sbss;
extern uint32_t _ebss;

/* Function prototypes */
void Reset_Handler(void);
void Default_Handler(void);
int main(void);

/* Vector table */
__attribute__((section(".isr_vector")))
const VectorTable vector_table = {
    .initial_sp = (uint32_t)&_estack,
    .reset = Reset_Handler,
    .nmi = NMI_Handler,
    .hard_fault = HardFault_Handler,
    .mem_manage = MemManage_Handler,
    .bus_fault = BusFault_Handler,
    .usage_fault = UsageFault_Handler,
    // ... other vectors
};

/* Reset handler */
void Reset_Handler(void)
{
    uint32_t *src, *dst;

    /* Copy .data section from Flash to SRAM */
    src = &_sidata;
    dst = &_sdata;
    while (dst < &_edata) {
        *dst++ = *src++;
    }

    /* Zero fill .bss section */
    dst = &_sbss;
    while (dst < &_ebss) {
        *dst++ = 0;
    }

    /* Enable FPU */
    SCB->CPACR |= ((3UL << 10*2) | (3UL << 11*2));

    /* Enable I-Cache */
    SCB_EnableICache();

    /* Enable D-Cache */
    SCB_EnableDCache();

    /* Call SystemInit (clock configuration) */
    SystemInit();

    /* Call C++ constructors */
    __libc_init_array();

    /* Call main */
    main();

    /* Infinite loop if main returns */
    while (1);
}

/* Default handler for unused interrupts */
void Default_Handler(void)
{
    while (1);
}
```

### 2.4 SystemInit Template

```c
/* system_stm32n6xx.c */

#include "stm32n6xx.h"

/* System clock frequency */
uint32_t SystemCoreClock = 800000000UL;

void SystemInit(void)
{
    /* FPU settings */
    #if (__FPU_PRESENT == 1) && (__FPU_USED == 1)
    SCB->CPACR |= ((3UL << 10*2) | (3UL << 11*2));
    #endif

    /* Reset the RCC clock configuration */
    RCC->CR |= RCC_CR_HSION;
    RCC->CFGR = 0x00000000U;
    RCC->CR &= ~(RCC_CR_HSEON | RCC_CR_CSSON | RCC_CR_PLLON);
    RCC->PLLCFGR = 0x00000000U;

    /* Disable all interrupts */
    RCC->CIER = 0x00000000U;

    /* Configure vector table location */
    /* For Flash: SCB->VTOR = 0x08000000UL; */
    SCB->VTOR = FLASH_BASE;

    /* Enable Power Clock */
    RCC->APB1ENR |= RCC_APB1ENR_PWREN;

    /* Configure voltage scaling */
    PWR->VOSCR = PWR_VOSCR_VOS_0;  /* VOS = 1 (high performance) */
    while ((PWR->VOSSR & PWR_VOSSR_VOSRDY) == 0);

    /* Configure PLL for 800 MHz */
    /* PLL1 configuration: HSE = 25MHz, SYSCLK = 800MHz */
    RCC->PLL1DIVR = (159 << RCC_PLL1DIVR_N1_Pos) |  /* N = 160 */
                    (1 << RCC_PLL1DIVR_P1_Pos) |    /* P = 2 */
                    (4 << RCC_PLL1DIVR_M1_Pos);     /* M = 5 */

    RCC->PLL1CFGR = RCC_PLL1CFGR_PLL1RGE_1 |  /* Input freq range */
                    RCC_PLL1CFGR_PLL1SRC_HSE;  /* HSE source */

    /* Enable PLL1 */
    RCC->CR |= RCC_CR_PLL1ON;
    while ((RCC->CR & RCC_CR_PLL1RDY) == 0);

    /* Configure bus prescalers */
    RCC->CFGR |= (0 << RCC_CFGR_HPRE_Pos) |    /* AHB = SYSCLK */
                 (4 << RCC_CFGR_PPRE1_Pos) |   /* APB1 = SYSCLK/2 */
                 (2 << RCC_CFGR_PPRE2_Pos);    /* APB2 = SYSCLK/4 */

    /* Select PLL as system clock source */
    RCC->CFGR &= ~RCC_CFGR_SW;
    RCC->CFGR |= RCC_CFGR_SW_PLL1;
    while ((RCC->CFGR & RCC_CFGR_SWS) != RCC_CFGR_SWS_PLL1);

    /* Update SystemCoreClock */
    SystemCoreClockUpdate();
}

void SystemCoreClockUpdate(void)
{
    uint32_t pllsource, pll1m, pll1n, pll1p;
    float_t pll1vco;

    /* Get PLL source */
    pllsource = (RCC->PLL1CFGR & RCC_PLL1CFGR_PLL1SRC);

    switch (pllsource) {
        case 0: /* HSI */
            pll1m = (RCC->PLL1DIVR & RCC_PLL1DIVR_M1) >> RCC_PLL1DIVR_M1_Pos;
            break;
        case 1: /* HSE */
            pll1m = (RCC->PLL1DIVR & RCC_PLL1DIVR_M1) >> RCC_PLL1DIVR_M1_Pos;
            break;
    }

    pll1n = (RCC->PLL1DIVR & RCC_PLL1DIVR_N1) >> RCC_PLL1DIVR_N1_Pos;
    pll1p = (RCC->PLL1DIVR & RCC_PLL1DIVR_P1) >> RCC_PLL1DIVR_P1_Pos;

    /* Calculate system clock */
    pll1vco = (HSE_VALUE / pll1m) * pll1n;
    SystemCoreClock = (uint32_t)(pll1vco / pll1p);
}
```

---

## 3. Clock Architecture

### 3.1 Clock Tree Overview

```
                    +--------+
                    |  HSI   | 64 MHz
                    +--------+
                         |
    +--------+          |          +--------+
    |  HSE   |----------+----------|  LSE   | 32.768 kHz
    | 25 MHz |          |          +--------+
    +--------+          v
                         |
                    +--------+
                    |  CSS   | Clock Security
                    +--------+
                         |
                         v
                    +--------+
                    |  PLL1  |----------> SYSCLK (800 MHz max)
                    +--------+
                         |
         +---------------+---------------+
         |               |               |
         v               v               v
    +--------+      +--------+      +--------+
    |  PLL2  |      |  PLL3  |      | PLL1-P |
    +--------+      +--------+      +--------+
         |               |               |
         v               v               v
    (Peripheral     (NPU Clock)     (USB/SDMMC)
     Clocks)
```

### 3.2 Clock Configuration Table

| Clock Domain | Max Frequency | Source |
|--------------|---------------|--------|
| SYSCLK | 800 MHz | PLL1-P |
| AHB | 800 MHz | SYSCLK |
| APB1 | 200 MHz | AHB/4 |
| APB2 | 400 MHz | AHB/2 |
| APB3 | 400 MHz | AHB/2 |
| NPU (Neural-ART) | 1000 MHz | PLL2 |
| GPU (NeoChrom) | 400 MHz | PLL3 |
| USB | 48 MHz | PLL3-Q |
| Ethernet | 50 MHz | PLL2-P |
| DSI | Variable | PLL3 |
| CSI | Variable | External/PLL |

### 3.3 Clock Configuration API

```c
/* Clock configuration helper functions */

typedef struct {
    uint32_t sysclk;      /* System clock frequency */
    uint32_t ahb;         /* AHB frequency */
    uint32_t apb1;        /* APB1 frequency */
    uint32_t apb2;        /* APB2 frequency */
    uint32_t apb3;        /* APB3 frequency */
} ClockConfig_t;

/**
 * @brief Configure system clocks
 * @param config Pointer to clock configuration structure
 * @retval HAL status
 */
HAL_StatusTypeDef HAL_RCC_ClockConfig_Custom(ClockConfig_t *config)
{
    uint32_t hse_freq = HSE_VALUE;
    uint32_t pll_m, pll_n, pll_p, pll_q, pll_r;

    /* Calculate PLL parameters for target SYSCLK */
    /* PLL_VCO = (HSE / M) * N */
    /* SYSCLK = PLL_VCO / P */

    /* Example for 800 MHz from 25 MHz HSE */
    /* VCO = (25 / 5) * 160 = 800 MHz */
    /* SYSCLK = 800 / 1 = 800 MHz */
    pll_m = 5;
    pll_n = 160;
    pll_p = 1;

    /* Configure PLL1 */
    __HAL_RCC_PLL1_CONFIG(RCC_PLL1SOURCE_HSE, pll_m, pll_n, pll_p, pll_q, pll_r);

    /* Enable PLL1 */
    __HAL_RCC_PLL1_ENABLE();

    /* Wait for PLL1 ready */
    while (__HAL_RCC_GET_FLAG(RCC_FLAG_PLL1RDY) == RESET);

    /* Configure bus prescalers */
    uint32_t hpre = CalculateAHBPrescaler(config->sysclk, config->ahb);
    uint32_t ppre1 = CalculateAPBPrescaler(config->ahb, config->apb1);
    uint32_t ppre2 = CalculateAPBPrescaler(config->ahb, config->apb2);

    MODIFY_REG(RCC->CFGR, RCC_CFGR_HPRE, hpre);
    MODIFY_REG(RCC->CFGR, RCC_CFGR_PPRE1, ppre1);
    MODIFY_REG(RCC->CFGR, RCC_CFGR_PPRE2, ppre2);

    /* Select PLL1 as system clock */
    __HAL_RCC_SET_SYSCLKSOURCE(RCC_SYSCLKSOURCE_PLL1CLK);

    /* Wait for clock switch */
    while (__HAL_RCC_GET_SYSCLK_SOURCE() != RCC_SYSCLKSOURCE_STATUS_PLL1);

    /* Update SystemCoreClock */
    SystemCoreClock = config->sysclk;

    return HAL_OK;
}
```

---

## 4. Driver Codebase Patterns

### 4.1 HAL Driver Pattern

```c
/* Peripheral driver template - HAL based */

#ifndef __PERIPHERAL_DRIVER_H
#define __PERIPHERAL_DRIVER_H

#ifdef __cplusplus
extern "C" {
#endif

#include "stm32n6xx_hal.h"

/* Error codes */
typedef enum {
    PERIPH_OK = 0,
    PERIPH_ERROR = -1,
    PERIPH_BUSY = -2,
    PERIPH_TIMEOUT = -3,
    PERIPH_INVALID_PARAM = -4,
} PeriphStatus_t;

/* Configuration structure */
typedef struct {
    uint32_t mode;           /* Operating mode */
    uint32_t speed;          /* Clock speed */
    uint32_t addressingMode; /* Addressing mode */
    bool useDma;             /* Use DMA transfers */
    bool useInterrupts;      /* Use interrupts */
} PeriphConfig_t;

/* Handle structure */
typedef struct {
    /* HAL peripheral handle */
    I2C_HandleTypeDef hi2c;

    /* Configuration */
    PeriphConfig_t config;

    /* State */
    volatile bool isInitialized;
    volatile bool isBusy;

    /* Callbacks */
    void (*txCompleteCallback)(void);
    void (*rxCompleteCallback)(void);
    void (*errorCallback)(PeriphStatus_t error);
} PeriphHandle_t;

/* Function prototypes */
PeriphStatus_t Periph_Init(PeriphHandle_t *handle, const PeriphConfig_t *config);
PeriphStatus_t Periph_DeInit(PeriphHandle_t *handle);
PeriphStatus_t Periph_Transmit(PeriphHandle_t *handle, uint16_t addr,
                               const uint8_t *data, uint16_t len, uint32_t timeout);
PeriphStatus_t Periph_Receive(PeriphHandle_t *handle, uint16_t addr,
                              uint8_t *data, uint16_t len, uint32_t timeout);
PeriphStatus_t Periph_TransmitDMA(PeriphHandle_t *handle, uint16_t addr,
                                  const uint8_t *data, uint16_t len);
PeriphStatus_t Periph_ReceiveDMA(PeriphHandle_t *handle, uint16_t addr,
                                 uint8_t *data, uint16_t len);

#ifdef __cplusplus
}
#endif

#endif /* __PERIPHERAL_DRIVER_H */
```

### 4.2 LL (Low-Layer) Driver Pattern

```c
/* Peripheral driver template - LL based (more efficient) */

#ifndef __PERIPH_LL_DRIVER_H
#define __PERIPH_LL_DRIVER_H

#include "stm32n6xx_ll_i2c.h"
#include "stm32n6xx_ll_gpio.h"
#include "stm32n6xx_ll_dma.h"

typedef struct {
    I2C_TypeDef *instance;

    /* GPIO configuration */
    GPIO_TypeDef *sclPort;
    uint32_t sclPin;
    GPIO_TypeDef *sdaPort;
    uint32_t sdaPin;

    /* Timing configuration */
    uint32_t timing;         /* I2C timing register value */

    /* DMA configuration */
    uint8_t dmaTxChannel;
    uint8_t dmaRxChannel;
} PeriphLL_Config_t;

static inline void I2C_LL_Init(const PeriphLL_Config_t *config)
{
    /* Enable clocks */
    if (config->instance == I2C1) {
        __HAL_RCC_I2C1_CLK_ENABLE();
    }

    /* Configure GPIO */
    LL_GPIO_InitTypeDef gpio = {0};
    gpio.Mode = LL_GPIO_MODE_ALTERNATE;
    gpio.Speed = LL_GPIO_SPEED_FREQ_HIGH;
    gpio.OutputType = LL_GPIO_OUTPUT_OPENDRAIN;
    gpio.Pull = LL_GPIO_PULL_UP;

    /* SCL */
    gpio.Pin = config->sclPin;
    gpio.Alternate = GPIO_AF_I2C1;
    LL_GPIO_Init(config->sclPort, &gpio);

    /* SDA */
    gpio.Pin = config->sdaPin;
    LL_GPIO_Init(config->sdaPort, &gpio);

    /* Configure I2C */
    LL_I2C_InitTypeDef i2c = {0};
    i2c.PeripheralMode = LL_I2C_MODE_I2C;
    i2c.Timing = config->timing;
    i2c.AnalogFilter = LL_I2C_ANALOGFILTER_ENABLE;
    i2c.DigitalFilter = 0;
    i2c.OwnAddress1 = 0;
    i2c.TypeAcknowledge = LL_I2C_ACK;
    i2c.OwnAddrSize = LL_I2C_OWNADDRESS1_7BIT;
    LL_I2C_Init(config->instance, &i2c);
}

/* Low-level transmit (blocking) */
static inline int I2C_LL_Transmit(I2C_TypeDef *I2Cx,
                                  uint16_t addr,
                                  const uint8_t *data,
                                  uint16_t len,
                                  uint32_t timeout)
{
    uint32_t start = HAL_GetTick();

    /* Generate start condition */
    LL_I2C_HandleTransfer(I2Cx, addr, LL_I2C_ADDRSLAVE_7BIT,
                          len, LL_I2C_MODE_AUTOEND,
                          LL_I2C_GENERATE_START_WRITE);

    /* Transmit data */
    for (uint16_t i = 0; i < len; i++) {
        while (!LL_I2C_IsActiveFlag_TXIS(I2Cx)) {
            if (HAL_GetTick() - start > timeout) {
                return -1;  /* Timeout */
            }
        }
        LL_I2C_TransmitData8(I2Cx, data[i]);
    }

    /* Wait for stop condition */
    while (!LL_I2C_IsActiveFlag_STOP(I2Cx)) {
        if (HAL_GetTick() - start > timeout) {
            return -1;
        }
    }
    LL_I2C_ClearFlag_STOP(I2Cx);

    return 0;
}

#endif /* __PERIPH_LL_DRIVER_H */
```

### 4.3 DMA-Based Driver Pattern

```c
/* DMA-based driver with circular buffer */

typedef struct {
    DMA_HandleTypeDef hdma_tx;
    DMA_HandleTypeDef hdma_rx;

    uint8_t *txBuffer;
    uint8_t *rxBuffer;
    uint16_t bufferSize;

    volatile uint16_t txHead;
    volatile uint16_t txTail;
    volatile uint16_t rxHead;
    volatile uint16_t rxTail;

    SemaphoreHandle_t txSemaphore;
    SemaphoreHandle_t rxSemaphore;
} DMABuffer_t;

void DMA_CircularBuffer_Init(DMABuffer_t *buf, uint16_t size)
{
    buf->bufferSize = size;
    buf->txBuffer = pvPortMalloc(size);
    buf->rxBuffer = pvPortMalloc(size);
    buf->txHead = buf->txTail = 0;
    buf->rxHead = buf->rxTail = 0;

    buf->txSemaphore = xSemaphoreCreateBinary();
    buf->rxSemaphore = xSemaphoreCreateBinary();
}

uint16_t DMA_CircularBuffer_Write(DMABuffer_t *buf, const uint8_t *data, uint16_t len)
{
    uint16_t available = buf->bufferSize - (buf->txHead - buf->txTail);
    uint16_t toWrite = (len < available) ? len : available;

    for (uint16_t i = 0; i < toWrite; i++) {
        buf->txBuffer[buf->txHead % buf->bufferSize] = data[i];
        buf->txHead++;
    }

    return toWrite;
}

uint16_t DMA_CircularBuffer_Read(DMABuffer_t *buf, uint8_t *data, uint16_t len)
{
    uint16_t available = buf->rxHead - buf->rxTail;
    uint16_t toRead = (len < available) ? len : available;

    for (uint16_t i = 0; i < toRead; i++) {
        data[i] = buf->rxBuffer[buf->rxTail % buf->bufferSize];
        buf->rxTail++;
    }

    return toRead;
}

/* DMA interrupt handlers */
void DMA1_Stream0_IRQHandler(void)
{
    HAL_DMA_IRQHandler(&dmaHandle.hdma_tx);
}

void DMA1_Stream1_IRQHandler(void)
{
    HAL_DMA_IRQHandler(&dmaHandle.hdma_rx);
}

/* DMA callbacks */
void HAL_UART_TxCpltCallback(UART_HandleTypeDef *huart)
{
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;

    xSemaphoreGiveFromISR(dmaHandle.txSemaphore, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}

void HAL_UART_RxCpltCallback(UART_HandleTypeDef *huart)
{
    BaseType_t xHigherPriorityTaskWoken = pdFALSE;

    dmaHandle.rxHead += dmaHandle.bufferSize;
    xSemaphoreGiveFromISR(dmaHandle.rxSemaphore, &xHigherPriorityTaskWoken);
    portYIELD_FROM_ISR(xHigherPriorityTaskWoken);
}
```

---

## 5. Interrupt Architecture

### 5.1 NVIC Configuration

```c
/* Interrupt priority configuration */

/* Priority levels (0 = highest) */
#define IRQ_PRIORITY_HIGHEST     0
#define IRQ_PRIORITY_HIGH        1
#define IRQ_PRIORITY_NORMAL      2
#define IRQ_PRIORITY_LOW         3
#define IRQ_PRIORITY_LOWEST      4

/* Group priority: 4 bits preemption, 0 bits subpriority */
#define NVIC_PRIORITY_GROUP      NVIC_PRIORITYGROUP_4

void NVIC_Configuration(void)
{
    /* Configure priority grouping */
    HAL_NVIC_SetPriorityGrouping(NVIC_PRIORITY_GROUP);

    /* Configure peripheral interrupts */

    /* High priority: Time-critical peripherals */
    HAL_NVIC_SetPriority(ETH_IRQn, IRQ_PRIORITY_HIGH, 0);
    HAL_NVIC_SetPriority(CAN1_TX_IRQn, IRQ_PRIORITY_HIGH, 0);

    /* Normal priority: Standard peripherals */
    HAL_NVIC_SetPriority(I2C1_EV_IRQn, IRQ_PRIORITY_NORMAL, 0);
    HAL_NVIC_SetPriority(I2C1_ER_IRQn, IRQ_PRIORITY_NORMAL, 0);
    HAL_NVIC_SetPriority(SPI1_IRQn, IRQ_PRIORITY_NORMAL, 0);
    HAL_NVIC_SetPriority(USART1_IRQn, IRQ_PRIORITY_NORMAL, 0);

    /* Low priority: Non-critical peripherals */
    HAL_NVIC_SetPriority(TIM2_IRQn, IRQ_PRIORITY_LOW, 0);
    HAL_NVIC_SetPriority(TIM3_IRQn, IRQ_PRIORITY_LOW, 0);
}
```

### 5.2 Interrupt Handler Template

```c
/* Interrupt handler with state machine */

typedef enum {
    I2C_STATE_IDLE,
    I2C_STATE_TX,
    I2C_STATE_RX,
    I2C_STATE_ERROR
} I2C_State_t;

volatile I2C_State_t i2cState = I2C_STATE_IDLE;
volatile uint8_t *i2cBuffer;
volatile uint16_t i2cCount;
volatile uint16_t i2cIndex;

void I2C1_EV_IRQHandler(void)
{
    uint32_t isr = I2C1->ISR;

    if (isr & I2C_ISR_TXIS) {
        /* Transmit interrupt */
        I2C1->TXDR = i2cBuffer[i2cIndex++];
        if (i2cIndex >= i2cCount) {
            /* Transfer complete */
            I2C1->CR2 |= I2C_CR2_STOP;
            i2cState = I2C_STATE_IDLE;
        }
    }
    else if (isr & I2C_ISR_RXNE) {
        /* Receive interrupt */
        i2cBuffer[i2cIndex++] = I2C1->RXDR;
        if (i2cIndex >= i2cCount) {
            i2cState = I2C_STATE_IDLE;
        }
    }
    else if (isr & I2C_ISR_TC) {
        /* Transfer complete */
        I2C1->CR2 |= I2C_CR2_STOP;
        i2cState = I2C_STATE_IDLE;
    }
}

void I2C1_ER_IRQHandler(void)
{
    uint32_t isr = I2C1->ISR;

    if (isr & I2C_ISR_ARLO) {
        /* Arbitration lost */
        I2C1->ICR = I2C_ICR_ARLOCF;
    }
    if (isr & I2C_ISR_BERR) {
        /* Bus error */
        I2C1->ICR = I2C_ICR_BERRCF;
    }
    if (isr & I2C_ISR_NACKF) {
        /* NACK received */
        I2C1->ICR = I2C_ICR_NACKCF;
        I2C1->CR2 |= I2C_CR2_STOP;
    }

    i2cState = I2C_STATE_ERROR;
}
```

---

## 6. DMA Architecture

### 6.1 DMA Channel Assignment

| DMA | Stream | Channel | Peripheral | Direction |
|-----|--------|---------|------------|-----------|
| DMA1 | Stream 0 | Ch 0 | SPI3_RX | Peripheral-to-Memory |
| DMA1 | Stream 1 | Ch 0 | SPI3_TX | Memory-to-Peripheral |
| DMA1 | Stream 2 | Ch 0 | I2C1_RX | Peripheral-to-Memory |
| DMA1 | Stream 3 | Ch 2 | I2C1_TX | Memory-to-Peripheral |
| DMA1 | Stream 4 | Ch 0 | USART1_RX | Peripheral-to-Memory |
| DMA1 | Stream 5 | Ch 0 | USART1_TX | Memory-to-Peripheral |
| DMA2 | Stream 0 | Ch 0 | ADC1 | Peripheral-to-Memory |
| DMA2 | Stream 1 | Ch 0 | ETH_RX | Peripheral-to-Memory |
| DMA2 | Stream 2 | Ch 0 | ETH_TX | Memory-to-Peripheral |

### 6.2 DMA Configuration Template

```c
/* DMA configuration helper */

typedef struct {
    DMA_TypeDef *instance;
    uint32_t stream;
    uint32_t channel;
    uint32_t direction;
    uint32_t dataSize;
    uint32_t mode;
    uint32_t priority;
    uint32_t fifoMode;
    uint32_t fifoThreshold;
    uint32_t memBurst;
    uint32_t periphBurst;
} DMA_Config_t;

void DMA_Configure(DMA_HandleTypeDef *hdma, const DMA_Config_t *config)
{
    hdma->Instance = (DMA_Stream_TypeDef *)(
        (uint32_t)config->instance +
        (config->stream < 4 ? 0x10 + config->stream * 0x18 :
                              0x88 + (config->stream - 4) * 0x18)
    );

    hdma->Init.Channel = config->channel;
    hdma->Init.Direction = config->direction;
    hdma->Init.PeriphInc = DMA_PINC_DISABLE;
    hdma->Init.MemInc = DMA_MINC_ENABLE;
    hdma->Init.PeriphDataAlignment = config->dataSize;
    hdma->Init.MemDataAlignment = config->dataSize;
    hdma->Init.Mode = config->mode;
    hdma->Init.Priority = config->priority;
    hdma->Init.FIFOMode = config->fifoMode;
    hdma->Init.FIFOThreshold = config->fifoThreshold;
    hdma->Init.MemBurst = config->memBurst;
    hdma->Init.PeriphBurst = config->periphBurst;

    HAL_DMA_Init(hdma);
}
```

---

## 7. Power Management

### 7.1 Power Modes

| Mode | Description | Wake-up Time | Power Consumption |
|------|-------------|--------------|-------------------|
| Run | Normal operation | - | Highest |
| Sleep | CPU halted, peripherals active | Immediate | Medium |
| Stop | All clocks stopped | ~10 µs | Low |
| Standby | Full shutdown, RTC active | ~50 ms | Lowest |

### 7.2 Power Configuration

```c
/* Power mode management */

void Enter_SleepMode(void)
{
    /* Clear SLEEPDEEP bit */
    SCB->SCR &= ~SCB_SCR_SLEEPDEEP_Msk;

    /* Enter sleep mode */
    __WFI();
}

void Enter_StopMode(void)
{
    /* Set SLEEPDEEP bit */
    SCB->SCR |= SCB_SCR_SLEEPDEEP_Msk;

    /* Enter stop mode */
    __WFI();

    /* After wake-up: Reconfigure clocks */
    SystemClock_Config();
}

void Enter_StandbyMode(void)
{
    /* Enable wakeup pin */
    HAL_PWR_EnableWakeUpPin(PWR_WAKEUP_PIN1);

    /* Set SLEEPDEEP bit */
    SCB->SCR |= SCB_SCR_SLEEPDEEP_Msk;

    /* Set PDDS bit for standby */
    PWR->CR1 |= PWR_CR1_PDDS;

    /* Enter standby mode */
    __WFI();
}
```

---

## 8. BSP Component Reference

### 8.1 LED Control (STM32N6570-DK)

```c
/* LED definitions */
#define LED1_PIN       GPIO_PIN_0
#define LED1_PORT      GPIOI
#define LED2_PIN       GPIO_PIN_1
#define LED2_PORT      GPIOI
#define LED3_PIN       GPIO_PIN_2
#define LED3_PORT      GPIOI

/* LED functions */
int32_t BSP_LED_Init(Led_TypeDef Led);
int32_t BSP_LED_On(Led_TypeDef Led);
int32_t BSP_LED_Off(Led_TypeDef Led);
int32_t BSP_LED_Toggle(Led_TypeDef Led);
```

### 8.2 Button Control (STM32N6570-DK)

```c
/* Button definitions */
#define USER_BUTTON_PIN       GPIO_PIN_13
#define USER_BUTTON_PORT      GPIOC
#define USER_BUTTON_IRQ       EXTI15_10_IRQn

/* Button functions */
int32_t BSP_PB_Init(Button_TypeDef Button, ButtonMode_TypeDef ButtonMode);
int32_t BSP_PB_GetState(Button_TypeDef Button);
```

### 8.3 SD Card (STM32N6570-DK)

```c
/* SD Card interface: SDMMC1 */
#define SD_DETECT_PIN         GPIO_PIN_8
#define SD_DETECT_PORT        GPIOI

/* SD Card functions */
int32_t BSP_SD_Init(void);
int32_t BSP_SD_ReadBlocks(uint32_t *pData, uint32_t Addr, uint32_t NumOfBlocks);
int32_t BSP_SD_WriteBlocks(uint32_t *pData, uint32_t Addr, uint32_t NumOfBlocks);
```

### 8.4 Ethernet (STM32N6570-DK)

```c
/* Ethernet PHY: LAN8742A */
#define ETH_PHY_ADDRESS       0x00
#define ETH_RMII_MODE

/* Ethernet functions */
int32_t BSP_ETH_Init(void);
int32_t BSP_ETH_GetLinkState(void);
```

---

*Document Status: Phase 2 - Architecture Design*
*Next: Implementation Phase*
