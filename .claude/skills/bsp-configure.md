# bsp-configure - Configure Board Support Package

Configure and customize BSP components for STM32N6570-DK.

## Purpose
Set up and customize the Board Support Package for STM32N6570-DK.

## Usage
```
/bsp-configure [component] [options]
```

## BSP Components
- `leds` - LED control (LED1, LED2, LED3)
- `buttons` - Button handling (USER, JOY_SEL)
- `display` - DSI display configuration
- `camera` - CSI camera interface
- `sdcard` - SD card interface
- `ethernet` - Ethernet PHY configuration
- `qspi` - QuadSPI flash memory
- `hyperbus` - HyperRAM/Flash

## Options
- `--list` - List available components
- `--enable <component>` - Enable specific component
- `--disable <component>` - Disable specific component
- `--config` - Show current configuration
- `--drivers` - Include driver initialization

## Component Details

### LEDs
```c
BSP_LED_Init(LED1);
BSP_LED_On(LED1);
BSP_LED_Off(LED1);
BSP_LED_Toggle(LED1);
```

### Buttons
```c
BSP_PB_Init(BUTTON_USER, BUTTON_MODE_EXTI);
BSP_PB_GetState(BUTTON_USER);
```

### Display (DSI)
- Resolution: 480x800
- Interface: MIPI DSI
- Touch: Capacitive (FT5336)

### Camera (CSI)
- Interface: MIPI CSI-2
- Lanes: 2
- Max resolution: 5MP

### SD Card
- Interface: SDMMC1
- Mode: 4-bit
- Features: SDHC/SDXC, DMA

### Ethernet
- PHY: LAN8742A
- Interface: RMII
- Speed: 10/100 Mbps

## Generated Files
```
BSP/
├── bsp.c
├── bsp.h
├── bsp_<component>.c
├── bsp_<component>.h
└── bsp_conf.h
```

## Example
```
/bsp-configure --list
/bsp-configure display --enable
/bsp-configure camera --enable --drivers
```

## Agents Used
- STM32 Architect (BSP setup)
- Driver Developer (component drivers)

## Tools Used
- `peripheral_config` - Peripheral setup
