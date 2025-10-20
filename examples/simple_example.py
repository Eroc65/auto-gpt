"""Simple example demonstrating basic Auto-GPT usage."""

from autogpt import Agent, Goal


def main():
    """Run a simple Auto-GPT example."""
    # Create an agent
    agent = Agent(name="SimpleAgent")

    # Create a simple goal
    goal = Goal(
        description="Calculate the sum of 10 and 20, then multiply by 3", priority=10
    )

    # Add the goal to the agent
    agent.add_goal(goal)

    # Show agent status
    print("Agent Status:")
    status = agent.get_status()
    for key, value in status.items():
        print(f"  {key}: {value}")

    print("\n" + "=" * 50 + "\n")

    # Demonstrate tool usage
    print("Demonstrating tool usage:")

    # Use calculator tool
    result1 = agent.execute_tool("calculator", operation="add", a=10, b=20)
    print(f"10 + 20 = {result1.output}")

    result2 = agent.execute_tool(
        "calculator", operation="multiply", a=result1.output, b=3
    )
    print(f"{result1.output} * 3 = {result2.output}")

    print("\n" + "=" * 50 + "\n")

    # Run the agent
    print("Running agent with goals...")
    summary = agent.run(max_iterations=10)

    print("\nRun Summary:")
    for key, value in summary.items():
        print(f"  {key}: {value}")

    print("\nFinal Agent Status:")
    status = agent.get_status()
    for key, value in status.items():
        print(f"  {key}: {value}")


if __name__ == "__main__":
    main()
