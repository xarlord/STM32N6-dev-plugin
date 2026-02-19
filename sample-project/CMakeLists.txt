cmake_minimum_required(VERSION 3.22)

# STM32N6570 Project Configuration
set(CMAKE_SYSTEM_NAME Generic)
set(CMAKE_SYSTEM_PROCESSOR ARM)

# Toolchain
set(CMAKE_C_COMPILER arm-none-eabi-gcc)
set(CMAKE_CXX_COMPILER arm-none-eabi-g++)
set(CMAKE_ASM_COMPILER arm-none-eabi-gcc)
set(CMAKE_OBJCOPY arm-none-eabi-objcopy)
set(CMAKE_SIZE arm-none-eabi-size)

# MCU flags
set(MCU_FLAGS
    -mcpu=cortex-m55
    -mthumb
    -mfpu=fpv5-d16
    -mfloat-abi=hard
)

# Project
project(stm32n6_blinky C ASM)

# Sources
set(SOURCES
    src/main.c
    src/stm32n6xx_it.c
    src/system_stm32n6xx.c
)

# Includes
set(INCLUDES
    include
    drivers/CMSIS/Device/ST/STM32N6xx/Include
    drivers/CMSIS/Include
)

# Compiler flags
set(CMAKE_C_FLAGS "${MCU_FLAGS} -Wall -Wextra -Werror -O2 -ffunction-sections -fdata-sections")
set(CMAKE_C_FLAGS_DEBUG "-O0 -g3")
set(CMAKE_C_FLAGS_RELEASE "-O3 -DNDEBUG")

# Linker flags
set(CMAKE_EXE_LINKER_FLAGS "${MCU_FLAGS} -T ${CMAKE_SOURCE_DIR}/linker/STM32N6570_FLASH.ld -nostartfiles -Wl,--gc-sections -Wl,-Map=${PROJECT_NAME}.map")

# Executable
add_executable(${PROJECT_NAME} ${SOURCES})

target_include_directories(${PROJECT_NAME} PRIVATE ${INCLUDES})

# Generate binary outputs
add_custom_command(TARGET ${PROJECT_NAME} POST_BUILD
    COMMAND ${CMAKE_OBJCOPY} -O ihex $<TARGET_FILE:${PROJECT_NAME}> ${PROJECT_NAME}.hex
    COMMAND ${CMAKE_OBJCOPY} -O binary $<TARGET_FILE:${PROJECT_NAME}> ${PROJECT_NAME}.bin
    COMMAND ${CMAKE_SIZE} $<TARGET_FILE:${PROJECT_NAME}>
)
