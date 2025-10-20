"""Advanced example demonstrating custom tools and complex workflows."""

from autogpt import Agent, Goal
from autogpt.tools import Tool, ToolResult
from autogpt.config import AgentConfig


class StringTool(Tool):
    """Tool for string operations."""

    @property
    def name(self) -> str:
        return "string_tool"

    @property
    def description(self) -> str:
        return "Performs string operations like uppercase, lowercase, reverse"

    def execute(self, operation: str, text: str, **kwargs) -> ToolResult:
        """Execute string operation.

        Args:
            operation: Operation to perform (upper, lower, reverse)
            text: Text to process

        Returns:
            ToolResult with processed text
        """
        try:
            if operation == "upper":
                result = text.upper()
            elif operation == "lower":
                result = text.lower()
            elif operation == "reverse":
                result = text[::-1]
            elif operation == "length":
                result = len(text)
            else:
                return ToolResult(
                    success=False, error=f"Unknown operation: {operation}"
                )

            return ToolResult(success=True, output=result)
        except Exception as e:
            return ToolResult(success=False, error=str(e))


class DataAggregatorTool(Tool):
    """Tool for aggregating data."""

    @property
    def name(self) -> str:
        return "aggregator"

    @property
    def description(self) -> str:
        return "Aggregates lists of numbers (sum, average, min, max)"

    def execute(self, operation: str, numbers: list, **kwargs) -> ToolResult:
        """Execute aggregation operation.

        Args:
            operation: Operation to perform (sum, avg, min, max)
            numbers: List of numbers

        Returns:
            ToolResult with aggregated value
        """
        try:
            if not numbers:
                return ToolResult(success=False, error="Empty list provided")

            if operation == "sum":
                result = sum(numbers)
            elif operation == "avg":
                result = sum(numbers) / len(numbers)
            elif operation == "min":
                result = min(numbers)
            elif operation == "max":
                result = max(numbers)
            else:
                return ToolResult(
                    success=False, error=f"Unknown operation: {operation}"
                )

            return ToolResult(success=True, output=result)
        except Exception as e:
            return ToolResult(success=False, error=str(e))


def main():
    """Run advanced example with custom tools and complex workflow."""
    print("=" * 70)
    print("Advanced Auto-GPT Example")
    print("=" * 70)

    # Create agent with custom configuration
    config = AgentConfig(max_short_term_memory=20, enable_reasoning_history=True)
    agent = Agent(name="AdvancedAgent", config=config)

    # Register custom tools
    agent.add_tool(StringTool())
    agent.add_tool(DataAggregatorTool())

    print("\n✓ Agent created with custom configuration")
    print(f"  - Short-term memory capacity: {config.max_short_term_memory}")
    print(
        f"  - Reasoning history: {'Enabled' if config.enable_reasoning_history else 'Disabled'}"
    )

    # Show available tools
    print("\n✓ Available tools:")
    for tool_name in agent.tool_registry.list_tools():
        tool = agent.tool_registry.get(tool_name)
        print(f"  - {tool_name}: {tool.description}")

    # Create a complex workflow with multiple goals
    print("\n" + "=" * 70)
    print("Creating Complex Workflow")
    print("=" * 70)

    # Main goal: Process and analyze data
    main_goal = Goal(
        description="Process text data and analyze numeric results",
        priority=10,
    )

    # Sub-goal 1: Text processing
    text_goal = Goal(description="Convert text to uppercase and get length", priority=8)
    main_goal.add_sub_goal(text_goal)

    # Sub-goal 2: Data aggregation
    data_goal = Goal(description="Analyze numeric data", priority=7)
    main_goal.add_sub_goal(data_goal)

    # Sub-goal 3: Mathematical operations
    math_goal = Goal(description="Perform calculations on aggregated data", priority=6)
    main_goal.add_sub_goal(math_goal)

    agent.add_goal(main_goal)

    print(f"\n✓ Main Goal: {main_goal.description}")
    print("  Sub-goals:")
    for i, sub_goal in enumerate(main_goal.sub_goals, 1):
        print(f"    {i}. {sub_goal.description} (priority: {sub_goal.priority})")

    # Execute workflow step by step
    print("\n" + "=" * 70)
    print("Executing Workflow")
    print("=" * 70)

    # Step 1: Text processing
    print("\n[Step 1] Text Processing")
    sample_text = "Auto-GPT is amazing"
    print(f"  Input: '{sample_text}'")

    result1 = agent.execute_tool("string_tool", operation="upper", text=sample_text)
    print(f"  Uppercase: '{result1.output}'")

    result2 = agent.execute_tool("string_tool", operation="length", text=sample_text)
    print(f"  Length: {result2.output} characters")

    # Step 2: Data aggregation
    print("\n[Step 2] Data Aggregation")
    sample_data = [10, 25, 30, 15, 20]
    print(f"  Input data: {sample_data}")

    result3 = agent.execute_tool("aggregator", operation="sum", numbers=sample_data)
    print(f"  Sum: {result3.output}")

    result4 = agent.execute_tool("aggregator", operation="avg", numbers=sample_data)
    print(f"  Average: {result4.output}")

    result5 = agent.execute_tool("aggregator", operation="max", numbers=sample_data)
    print(f"  Maximum: {result5.output}")

    # Step 3: Mathematical operations
    print("\n[Step 3] Mathematical Operations")
    print(f"  Calculate: {result4.output} * 2")

    result6 = agent.execute_tool(
        "calculator", operation="multiply", a=result4.output, b=2
    )
    print(f"  Result: {result6.output}")

    # Run autonomous execution
    print("\n" + "=" * 70)
    print("Running Autonomous Goal Execution")
    print("=" * 70)

    summary = agent.run(max_iterations=10)

    print("\n✓ Execution completed:")
    print(f"  - Iterations: {summary['iterations']}")
    print(f"  - Goals completed: {summary['completed_goals']}")
    print(f"  - Reasoning steps: {summary['reasoning_steps']}")

    # Show memory state
    print("\n" + "=" * 70)
    print("Memory State")
    print("=" * 70)

    status = agent.get_status()
    print("\n✓ Memory statistics:")
    print(f"  - Short-term memories: {status['short_term_memories']}")
    print(f"  - Long-term memories: {status['long_term_memories']}")

    # Search memory
    print("\n✓ Searching memory for 'tool' mentions:")
    tool_memories = agent.memory.search_by_tag("tool")
    for i, memory in enumerate(tool_memories[:5], 1):
        print(f"  {i}. {memory.content}")

    # Show reasoning history
    print("\n" + "=" * 70)
    print("Reasoning History")
    print("=" * 70)

    print("\n✓ Showing last 5 reasoning steps:")
    for i, step in enumerate(agent.reasoning_history[-5:], 1):
        print(f"\n  Step {i}:")
        print(f"    Thought: {step.thought}")
        if step.action:
            print(f"    Action: {step.action[:100]}...")
        if step.observation:
            obs = str(step.observation)
            print(f"    Observation: {obs[:100]}...")

    # Final status
    print("\n" + "=" * 70)
    print("Final Status")
    print("=" * 70)

    status = agent.get_status()
    print(f"\n✓ Agent: {status['name']}")
    print(f"  - Total goals: {status['total_goals']}")
    print(f"  - Pending: {status['pending_goals']}")
    print(f"  - Completed: {status['completed_goals']}")
    print(f"  - Tools available: {len(status['available_tools'])}")
    print(f"  - Reasoning steps: {status['reasoning_steps']}")

    print("\n" + "=" * 70)
    print("Example completed successfully!")
    print("=" * 70)


if __name__ == "__main__":
    main()
