# /test - Run Tests

Execute unit and integration tests for the STM32N6 project.

## Usage
```
/test [target] [options]
```

## Arguments
- `target`: Test target (all, unit, integration, specific)

## Options
- `--coverage` - Generate coverage report
- `--verbose` - Verbose output
- `--filter <pattern>` - Filter tests by name

## Examples
```
/test                          # Run all tests
/test unit                     # Run unit tests only
/test --coverage               # Run with coverage
/test driver_i2c --verbose     # Run specific test
```

## Test Frameworks

| Framework | Type | Usage |
|-----------|------|-------|
| Unity | Unit | C unit testing |
| CMock | Mocking | Mock generation |
| Ceedling | Build | Test runner |

## Workflow
1. Build test targets
2. Execute tests on host (unit) or target (integration)
3. Collect results
4. Generate coverage report (if enabled)

## Test Categories

| Category | Location | Execution |
|----------|----------|-----------|
| Unit | tests/unit/ | Host |
| Integration | tests/integration/ | Target |
| System | tests/system/ | Target |
| HIL | tests/hil/ | Hardware |

## Output
- Test results (pass/fail)
- Coverage percentage
- Failed test details
- Recommendations

## Related Commands
- `/build` - Build before testing
- `/analyze` - Analyze coverage

## Quality Targets
- Line coverage: 100%
- Branch coverage: 100%
- All tests passing: 100%
