# Project Structure

This document describes the structure and organization of the Auto-GPT project.

## Directory Layout

```
auto-gpt/
├── autogpt/                    # Main package
│   ├── __init__.py            # Package initialization and exports
│   ├── core/                  # Core components
│   │   ├── __init__.py
│   │   ├── agent.py           # Agent implementation
│   │   └── goal.py            # Goal management system
│   ├── tools/                 # Tool system
│   │   ├── __init__.py
│   │   └── base.py            # Base tool classes and built-in tools
│   ├── memory/                # Memory management
│   │   ├── __init__.py
│   │   └── base.py            # Memory system implementation
│   ├── config/                # Configuration
│   │   ├── __init__.py
│   │   └── settings.py        # Configuration classes
│   └── utils/                 # Utility functions
│       └── __init__.py        # Utility functions
├── tests/                     # Test suite
│   ├── __init__.py
│   ├── test_agent.py          # Agent tests
│   ├── test_goal.py           # Goal tests
│   ├── test_memory.py         # Memory tests
│   └── test_tools.py          # Tool tests
├── examples/                  # Example scripts
│   ├── simple_example.py      # Basic usage example
│   ├── hierarchical_goals.py  # Goal decomposition example
│   └── memory_example.py      # Memory system example
├── setup.py                   # Package setup configuration
├── setup.cfg                  # Tool configuration (pytest, flake8, mypy, coverage)
├── requirements.txt           # Production dependencies
├── requirements-dev.txt       # Development dependencies
├── .gitignore                 # Git ignore rules
├── README.md                  # Main documentation
├── CONTRIBUTING.md            # Contribution guidelines
├── LICENSE                    # MIT License
└── STRUCTURE.md              # This file
```

## Core Components

### Agent (`autogpt/core/agent.py`)

The `Agent` class is the main entry point for using Auto-GPT. It coordinates:
- Goal management
- Tool execution
- Memory management
- Reasoning and decision-making

**Key Features:**
- Self-directed reasoning
- Recursive goal execution
- Dynamic tool use
- Reasoning history tracking

### Goal System (`autogpt/core/goal.py`)

Handles goal creation, decomposition, and execution:
- `Goal`: Represents a task with metadata and sub-goals
- `GoalStatus`: Enum for goal states (PENDING, IN_PROGRESS, COMPLETED, FAILED, BLOCKED)
- `GoalManager`: Manages goal queue and execution order

**Key Features:**
- Hierarchical goals with sub-goals
- Priority-based execution
- Status tracking
- Result storage

### Tool System (`autogpt/tools/base.py`)

Extensible tool architecture for agent capabilities:
- `Tool`: Abstract base class for all tools
- `ToolResult`: Standardized tool output
- `ToolRegistry`: Registry for managing available tools

**Built-in Tools:**
- `EchoTool`: Simple echo functionality
- `CalculatorTool`: Basic arithmetic operations

### Memory (`autogpt/memory/base.py`)

Memory management for context retention:
- `MemoryEntry`: Individual memory with metadata
- `Memory`: Short-term and long-term memory system

**Key Features:**
- Short-term working memory with overflow to long-term
- Importance-based retention
- Search by content or tags
- Metadata support

### Configuration (`autogpt/config/settings.py`)

Configuration classes for customization:
- `AgentConfig`: Agent-specific settings
- `SystemConfig`: System-wide settings

## Testing

The test suite provides comprehensive coverage:
- Unit tests for all core components
- Integration tests for agent functionality
- 90%+ code coverage

Run tests:
```bash
pytest
pytest --cov=autogpt  # With coverage
```

## Examples

Example scripts demonstrate key features:
1. **simple_example.py**: Basic agent usage and tool execution
2. **hierarchical_goals.py**: Goal decomposition with sub-goals
3. **memory_example.py**: Memory system capabilities

## Extension Points

The framework is designed for extensibility:

1. **Custom Tools**: Extend `Tool` class
2. **Custom Memory**: Extend `Memory` class
3. **Configuration**: Use `AgentConfig` for customization
4. **New Reasoning Strategies**: Extend `Agent` class

## Code Quality

- **Formatting**: Black (100 char line length)
- **Linting**: Flake8
- **Type Checking**: MyPy
- **Testing**: Pytest with coverage

## Dependencies

### Production
- `pydantic>=2.0.0`: Data validation
- `pyyaml>=6.0`: Configuration management

### Development
- `pytest>=7.0.0`: Testing framework
- `pytest-cov>=4.0.0`: Coverage reporting
- `black>=23.0.0`: Code formatting
- `flake8>=6.0.0`: Linting
- `mypy>=1.0.0`: Type checking

## Future Enhancements

See README.md for planned features and roadmap.
