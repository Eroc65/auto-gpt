# Auto-GPT

Auto-GPT is an experimental open-source framework that transforms large language models like GPT into autonomous agents capable of self-directed reasoning, recursive goal execution, and dynamic tool use. Unlike traditional chat interfaces, Auto-GPT enables agents to:

- **Self-directed reasoning**: Make autonomous decisions based on context and goals
- **Recursive goal execution**: Break down complex goals into manageable sub-goals
- **Dynamic tool use**: Leverage a flexible tool system to accomplish tasks
- **Memory management**: Maintain both short-term and long-term memory for context retention

## Features

- 🎯 **Goal Management**: Hierarchical goal system with priority-based execution
- 🛠️ **Tool System**: Extensible plugin architecture for adding new capabilities
- 🧠 **Memory**: Short-term and long-term memory with search capabilities
- 📊 **Reasoning Tracking**: Keep track of the agent's decision-making process
- ⚙️ **Configurable**: Fine-tune agent behavior through configuration

## Installation

### From Source

```bash
git clone https://github.com/Eroc65/auto-gpt.git
cd auto-gpt
pip install -e .
```

### For Development

```bash
pip install -e ".[dev]"
```

## Quick Start

Here's a simple example to get you started:

```python
from autogpt import Agent, Goal

# Create an agent
agent = Agent(name="MyAgent")

# Create a goal
goal = Goal(
    description="Calculate the sum of 10 and 20",
    priority=10
)

# Add the goal to the agent
agent.add_goal(goal)

# Run the agent
summary = agent.run(max_iterations=10)
print(f"Completed {summary['completed_goals']} goals")
```

## Core Concepts

### Agents

Agents are the central component of Auto-GPT. They manage goals, use tools, and maintain memory:

```python
from autogpt import Agent
from autogpt.config import AgentConfig

config = AgentConfig(max_short_term_memory=20)
agent = Agent(name="MyAgent", config=config)
```

### Goals

Goals represent tasks that the agent should accomplish. They can have sub-goals for complex tasks:

```python
from autogpt import Goal

main_goal = Goal(description="Complete a complex task", priority=10)
sub_goal = Goal(description="First step", priority=8)
main_goal.add_sub_goal(sub_goal)
```

### Tools

Tools provide specific capabilities to agents. You can create custom tools by extending the `Tool` class:

```python
from autogpt.tools import Tool, ToolResult

class MyTool(Tool):
    @property
    def name(self) -> str:
        return "my_tool"
    
    @property
    def description(self) -> str:
        return "Description of what this tool does"
    
    def execute(self, **kwargs) -> ToolResult:
        # Your tool logic here
        return ToolResult(success=True, output="Result")

# Add to agent
agent.add_tool(MyTool())
```

### Memory

Agents maintain both short-term and long-term memory:

```python
# Add to memory
agent.memory.add_to_short_term("Important information", importance=8)

# Search memory
results = agent.memory.search("query")
```

## Examples

The `examples/` directory contains several examples:

- **simple_example.py**: Basic usage demonstration
- **hierarchical_goals.py**: Working with sub-goals
- **memory_example.py**: Using the memory system

Run an example:

```bash
python examples/simple_example.py
```

## Testing

Run the test suite:

```bash
# Install dev dependencies
pip install -e ".[dev]"

# Run tests
pytest

# Run with coverage
pytest --cov=autogpt --cov-report=html
```

## Architecture

```
autogpt/
├── core/           # Core components (Agent, Goal)
├── tools/          # Tool system and built-in tools
├── memory/         # Memory management
├── config/         # Configuration management
└── utils/          # Utility functions
```

## Configuration

You can configure agents using the `AgentConfig` class:

```python
from autogpt.config import AgentConfig

config = AgentConfig(
    max_short_term_memory=15,
    max_iterations=100,
    enable_reasoning_history=True,
    tool_timeout=30
)

agent = Agent(config=config)
```

## Built-in Tools

Auto-GPT comes with several built-in tools:

- **Echo Tool**: Simple tool that echoes back input
- **Calculator Tool**: Performs basic arithmetic operations

More tools can be added by implementing the `Tool` interface.

## Development

### Code Style

This project uses:
- `black` for code formatting
- `flake8` for linting
- `mypy` for type checking

Run linters:

```bash
black autogpt/
flake8 autogpt/
mypy autogpt/
```

### Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## Roadmap

Future enhancements planned:

- [ ] Integration with LLM APIs (OpenAI, Anthropic, etc.)
- [ ] More sophisticated reasoning algorithms
- [ ] Web browsing and search tools
- [ ] File system operations
- [ ] Database integration
- [ ] Multi-agent collaboration
- [ ] Enhanced memory with vector storage
- [ ] Real-time monitoring dashboard

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

This is an experimental framework inspired by the concept of autonomous AI agents. It provides the foundational structure for building such systems.

## Support

For issues, questions, or contributions, please visit the [GitHub repository](https://github.com/Eroc65/auto-gpt).
