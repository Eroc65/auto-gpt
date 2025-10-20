"""Example demonstrating goal decomposition with sub-goals."""

from autogpt import Agent, Goal


def main():
    """Run an example with hierarchical goals."""
    # Create an agent
    agent = Agent(name="HierarchicalAgent")

    # Create a main goal with sub-goals
    main_goal = Goal(description="Plan and execute a mathematical problem", priority=10)

    # Add sub-goals
    sub_goal1 = Goal(description="Calculate 5 + 3", priority=8)

    sub_goal2 = Goal(description="Multiply the result by 2", priority=7)

    sub_goal3 = Goal(description="Subtract 4 from the result", priority=6)

    main_goal.add_sub_goal(sub_goal1)
    main_goal.add_sub_goal(sub_goal2)
    main_goal.add_sub_goal(sub_goal3)

    # Add the main goal to the agent
    agent.add_goal(main_goal)

    print("Goal Hierarchy:")
    print(f"Main: {main_goal.description}")
    for i, sub_goal in enumerate(main_goal.sub_goals, 1):
        print(f"  Sub-goal {i}: {sub_goal.description}")

    print("\n" + "=" * 50 + "\n")

    # Execute the calculations manually to demonstrate
    print("Executing calculations:")

    result1 = agent.execute_tool("calculator", operation="add", a=5, b=3)
    print(f"Step 1: 5 + 3 = {result1.output}")

    result2 = agent.execute_tool(
        "calculator", operation="multiply", a=result1.output, b=2
    )
    print(f"Step 2: {result1.output} * 2 = {result2.output}")

    result3 = agent.execute_tool(
        "calculator", operation="subtract", a=result2.output, b=4
    )
    print(f"Step 3: {result2.output} - 4 = {result3.output}")

    print("\n" + "=" * 50 + "\n")

    # Run the agent
    print("Running agent...")
    summary = agent.run(max_iterations=10)

    print("\nRun Summary:")
    for key, value in summary.items():
        print(f"  {key}: {value}")

    # Check goal completion
    print("\nGoal Completion Status:")
    print(f"Main goal completed: {main_goal.is_completed()}")
    print(f"All sub-goals completed: {main_goal.all_sub_goals_completed()}")

    # Show reasoning history
    print(f"\nReasoning steps taken: {len(agent.reasoning_history)}")
    if agent.reasoning_history:
        print("\nFirst few reasoning steps:")
        for i, step in enumerate(agent.reasoning_history[:3], 1):
            print(f"\nStep {i}:")
            print(f"  {step}")


if __name__ == "__main__":
    main()
