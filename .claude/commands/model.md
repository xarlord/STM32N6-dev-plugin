# /model - ML Model Operations

Deploy and optimize ML models for STM32N6 Neural-ART NPU.

## Usage
```
/model <action> <model_path> [options]
```

## Actions
- `convert` - Convert model to ST Edge AI format
- `quantize` - Quantize for efficient deployment
- `profile` - Profile model performance
- `validate` - Validate model accuracy

## Examples
```
/model convert model.onnx
/model quantize model.tflite --scheme int8
/model profile model_quantized.bin
/model validate model.onnx --data test_data.npy
```

## Convert Options
- `--format onnx|tflite|pytorch|keras` - Input format
- `--optimize latency|memory|balanced` - Optimization target

## Quantize Options
- `--scheme int8|int4|mixed|fp16` - Quantization scheme
- `--calibrate <path>` - Calibration dataset
- `--samples <n>` - Calibration samples (default: 100)

## Supported Model Formats

| Format | Import | Operators | Notes |
|--------|--------|-----------|-------|
| ONNX | Yes | 100+ | Recommended |
| TFLite | Yes | 80+ | Direct deploy |
| PyTorch | Via ONNX | 100+ | Export to ONNX |
| Keras | Via TFLite | 60+ | Convert first |

## Quantization Impact

| Scheme | Compression | Accuracy Loss | Latency |
|--------|-------------|---------------|---------|
| int8 | 4x | < 1% | 2.5x faster |
| int4 | 8x | 1-3% | 3x faster |
| mixed | 3-6x | < 1% | 2x faster |
| fp16 | 2x | < 0.1% | 1.5x faster |

## Output
- Converted/quantized model file
- Memory usage estimate
- Performance prediction
- C code for integration

## Related Commands
- `/build` - Build with model
- `/debug` - Debug inference

## Tools Used
- `model_convert` - MCP tool for conversion
- `model_quantize` - MCP tool for quantization
