# rtos-setup - Configure FreeRTOS

Set up FreeRTOS with proper configuration for STM32N6.

## Purpose
Configure FreeRTOS for real-time application development.

## Usage
```
/rtos-setup [options]
```

## Options
- `--heap-model heap_1|heap_2|heap_3|heap_4|heap_5` - Memory allocator
- `--total-heap-size <bytes>` - Total heap size (default: 128KB)
- `--tick-rate <Hz>` - RTOS tick rate (default: 1000)
- `--max-priorities <n>` - Number of priorities (default: 7)
- `--enable-stats` - Enable runtime statistics
- `--enable-trace` - Enable trace recording

## Memory Allocators

| Model | Features | Use Case |
|-------|----------|----------|
| heap_1 | Alloc only | Static tasks |
| heap_2 | Alloc/free, no coalesce | Fixed-size blocks |
| heap_3 | Wraps malloc/free | Standard library |
| heap_4 | Coalescing | General purpose (recommended) |
| heap_5 | Multiple regions | External memory |

## Generated Components
1. **FreeRTOSConfig.h** - Configuration header
2. **Task templates** - Common task patterns
3. **Queue wrappers** - Thread-safe queues
4. **Semaphore wrappers** - Resource management
5. **Timer templates** - Software timers

## Task Templates
- `sensor_task` - Periodic sensor reading
- `communication_task` - UART/Ethernet handling
- `processing_task` - Data processing pipeline
- `ai_inference_task` - ML model inference
- `display_task` - GUI updates

## Example Configuration
```c
#define configUSE_PREEMPTION            1
#define configUSE_IDLE_HOOK             0
#define configUSE_TICK_HOOK             0
#define configCPU_CLOCK_HZ              800000000UL
#define configTICK_RATE_HZ              1000
#define configMAX_PRIORITIES            7
#define configMINIMAL_STACK_SIZE        128
#define configTOTAL_HEAP_SIZE           131072
#define configUSE_MUTEXES               1
#define configUSE_RECURSIVE_MUTEXES     1
#define configUSE_COUNTING_SEMAPHORES   1
```

## Agents Used
- RTOS Specialist (configuration)
- STM32 Architect (memory layout)

## Example
```
/rtos-setup --heap-model heap_4 --total-heap-size 262144 --enable-stats
```
