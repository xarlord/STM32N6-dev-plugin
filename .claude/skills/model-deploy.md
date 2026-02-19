# model-deploy - Deploy ML Model

Complete workflow for deploying ML models to Neural-ART NPU.

## Purpose
Convert, optimize, and deploy ML models for edge inference on STM32N6.

## Usage
```
/model-deploy <model_path> [options]
```

## Options
- `--framework onnx|tflite|pytorch|keras` - Input format
- `--quantize int8|int4|mixed|none` - Quantization scheme
- `--calibration-data <path>` - Path to calibration dataset
- `--optimize latency|memory|balanced` - Optimization target
- `--generate-c` - Generate C inference code
- `--validate` - Validate on hardware

## Workflow Steps

### 1. Model Analysis
- Input/output shape verification
- Operator support check
- Memory estimation
- Performance prediction

### 2. Model Conversion
- Convert to ST Edge AI format
- Optimize for Neural-ART
- Generate intermediate representation

### 3. Quantization (if requested)
- Calibration with provided data
- Apply quantization scheme
- Accuracy evaluation
- Layer-wise analysis

### 4. Code Generation
- Generate C/C++ inference code
- Create model header/source files
- Generate input/output buffers
- Create configuration header

### 5. Integration
- Create inference API wrapper
- Add to build system
- Generate usage example
- Create documentation

## Output Files
```
Models/
├── model_name.h           # Model header
├── model_name.c           # Model implementation
├── model_name_data.c      # Weights data
├── model_name_config.h    # Configuration
├── model_name_api.h       # Inference API
├── model_name_api.c       # API implementation
└── model_name_example.c   # Usage example
```

## Inference API
```c
// Initialize model
int model_init(void);

// Run inference
int model_inference(const int8_t* input, int8_t* output);

// Get model info
size_t model_get_input_size(void);
size_t model_get_output_size(void);
const char* model_get_input_name(void);
const char* model_get_output_name(void);
```

## Performance Targets
- Inference latency: < 50ms (typical)
- Memory efficiency: Optimized for Neural-ART
- Accuracy: Within 1% of original (int8)

## Agents Used
- AI Engineer (model conversion)
- STM32 Architect (memory allocation)

## Tools Used
- `model_convert` - Model conversion
- `model_quantize` - Quantization

## Example
```
/model-deploy mobilenet.onnx --framework onnx --quantize int8 --calibration-data calib.npy --generate-c
```
