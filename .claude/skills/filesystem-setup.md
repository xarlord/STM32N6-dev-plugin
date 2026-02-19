# filesystem-setup - Set Up File System

Configure file system support (FATFS/LittleFS) on storage media.

## Purpose
Set up file system for SD card, QSPI flash, or other storage.

## Usage
```
/filesystem-setup <storage_type> <fs_type> [options]
```

## Storage Types
- `sdcard` - SD card via SDMMC
- `qspi` - QuadSPI flash
- `ospi` - OctoSPI flash
- `usb` - USB mass storage
- `ram` - RAM disk

## File System Types
- `fatfs` - FAT/exFAT (FATFS by ChaN)
- `littlefs` - LittleFS (power-safe)
- `lwext4` - ext4 (advanced)

## Options
- `--mount-point </path>` - Mount point (default: "/")
- `--read-only` - Mount read-only
- `--format` - Format on first mount
- `--cache` - Enable caching
- `--long-filenames` - Enable long filenames (FATFS)

## FATFS Configuration
```c
#define _FS_READONLY     0    // Read-write mode
#define _FS_MINIMIZE     0    // Full functionality
#define _USE_STRFUNC     1    // String functions
#define _USE_LFN         2    // LFN with dynamic allocation
#define _MAX_LFN         255  // Max LFN length
#define _FS_REENTRANT    1    // Re-entrant enabled
```

## Generated Components
1. Low-level driver (diskio.c)
2. File system configuration
3. Mount/unmount functions
4. File operation wrappers
5. Example usage code

## Example Usage
```c
// Mount file system
FRESULT res = f_mount(&SDFatFs, SDPath, 1);

// Write file
FIL file;
f_open(&file, "test.txt", FA_WRITE | FA_CREATE_ALWAYS);
f_write(&file, data, size, &bytesWritten);
f_close(&file);

// Read file
f_open(&file, "test.txt", FA_READ);
f_read(&file, buffer, size, &bytesRead);
f_close(&file);

// Unmount
f_mount(NULL, SDPath, 0);
```

## Agents Used
- Driver Developer (diskio implementation)
- STM32 Architect (memory allocation)

## Example
```
/filesystem-setup sdcard fatfs --mount-point /sd --long-filenames
```
