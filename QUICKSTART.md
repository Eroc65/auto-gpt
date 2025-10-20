# Quick Start Guide

This guide will help you get started with Auto-GPT in just a few minutes.

## Installation

### Prerequisites

- Python 3.8 or higher
- pip package manager

### Install Auto-GPT

```bash
# Clone the repository
git clone https://github.com/Eroc65/auto-gpt.git
cd auto-gpt

# Install the package
pip install -e .

# For development (includes testing tools)
pip install -e ".[dev]"
```

## Your First Agent

Create a file called `my_first_agent.py`:

```python
from autogpt import Agent, Goal

# Create an agent
agent = Agent(name="MyFirstAgent")

# Create a simple goal
goal = Goal(
    description="Calculate 15 + 25 and multiply by 2",
    priority=10
)

# Add the goal to the agent
agent.add_goal(goal)

# Run the agent
summary = agent.run(max_iterations=10)

# Check results
print(f"Completed {summary['completed_goals']} goals!")
```

Run it:

```bash
python my_first_agent.py
```

## Using Tools

Auto-GPT comes with built-in tools. Here's how to use them:

```python
from autogpt import Agent

agent = Agent()

# Use the calculator tool
result = agent.execute_tool(
    "calculator",
    operation="add",
    a=10,
    b=20
)

print(f"Result: {result.output}")  # Output: 30
```

## Creating Custom Tools

Extend the framework with your own tools:

```python
from autogpt import Agent
from autogpt.tools import Tool, ToolResult

class GreetingTool(Tool):
    @property
    def name(self) -> str:
        return "greet"
    
    @property
    def description(self) -> str:
        return "Greets a person by name"
    
    def execute(self, name: str, **kwargs) -> ToolResult:
        greeting = f"Hello, {name}!"
        return ToolResult(success=True, output=greeting)

# Use your custom tool
agent = Agent()
agent.add_tool(GreetingTool())

result = agent.execute_tool("greet", name="Alice")
print(result.output)  # Output: Hello, Alice!
```

## Working with Goals

### Simple Goals

```python
from autogpt import Agent, Goal

agent = Agent()

goal = Goal(description="Do something", priority=5)
agent.add_goal(goal)
agent.run()
```

### Hierarchical Goals

Break complex tasks into sub-goals:

```python
from autogpt import Agent, Goal

agent = Agent()

# Create main goal
main_goal = Goal(
    description="Complete a complex task",
    priority=10
)

# Add sub-goals
sub_goal1 = Goal(description="Step 1", priority=8)
sub_goal2 = Goal(description="Step 2", priority=7)

main_goal.add_sub_goal(sub_goal1)
main_goal.add_sub_goal(sub_goal2)

agent.add_goal(main_goal)
agent.run()
```

## Using Memory

The agent maintains both short-term and long-term memory:

```python
from autogpt import Agent

agent = Agent()

# Add to memory
agent.memory.add_to_short_term(
    "Important information",
    importance=8,
    tags=["important"]
)

# Search memory
results = agent.memory.search("important")
for result in results:
    print(result.content)

# Search by tag
tagged = agent.memory.search_by_tag("important")
```

## Configuration

Customize agent behavior:

```python
from autogpt import Agent
from autogpt.config import AgentConfig

config = AgentConfig(
    max_short_term_memory=20,
    max_iterations=100,
    enable_reasoning_history=True
)

agent = Agent(name="ConfiguredAgent", config=config)
```

## Monitoring Agent Activity

### Check Status

```python
agent = Agent()
# ... do some work ...

status = agent.get_status()
print(f"Completed: {status['completed_goals']} goals")
print(f"Tools: {status['available_tools']}")
print(f"Memories: {status['short_term_memories']}")
```

### Reasoning History

```python
agent = Agent()
# ... execute some tools ...

for step in agent.reasoning_history:
    print(f"Thought: {step.thought}")
    print(f"Action: {step.action}")
    print(f"Result: {step.observation}")
```

## Examples

Check out the `examples/` directory for more:

- **simple_example.py**: Basic usage
- **hierarchical_goals.py**: Goal decomposition
- **memory_example.py**: Memory system
- **advanced_example.py**: Custom tools and complex workflows

Run an example:

```bash
python examples/simple_example.py
```

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=autogpt

# Run specific test file
pytest tests/test_agent.py
```

## Next Steps

1. **Read the full README**: `README.md`
2. **Explore examples**: `examples/` directory
3. **Check architecture**: `STRUCTURE.md`
4. **Read analysis**: `ANALYSIS.md`
5. **Contribute**: See `CONTRIBUTING.md`

## Getting Help

- Check existing examples
- Read the documentation
- Open an issue on GitHub
- Review the test files for usage patterns

## Common Patterns

### Execute Multiple Tools in Sequence

```python
agent = Agent()

# Step 1
result1 = agent.execute_tool("calculator", operation="add", a=5, b=3)

# Step 2 - use result from step 1
result2 = agent.execute_tool(
    "calculator",
    operation="multiply",
    a=result1.output,
    b=2
)
```

### Automated Goal Execution

```python
agent = Agent()

# Add multiple goals
for i in range(5):
    goal = Goal(description=f"Task {i}", priority=i)
    agent.add_goal(goal)

# Let the agent work autonomously
summary = agent.run(max_iterations=20)
print(f"Completed {summary['completed_goals']}/{summary['total_goals']}")
```

### Error Handling

```python
agent = Agent()

result = agent.execute_tool("calculator", operation="divide", a=10, b=0)

if result.success:
    print(f"Result: {result.output}")
else:
    print(f"Error: {result.error}")
```

## Tips

1. **Start Simple**: Begin with basic examples and gradually add complexity
2. **Use Reasoning History**: Track what your agent is doing
3. **Configure Memory**: Adjust memory size based on your needs
4. **Create Focused Tools**: Each tool should do one thing well
5. **Test Your Tools**: Write tests for custom tools

Happy coding with Auto-GPT! 🚀
