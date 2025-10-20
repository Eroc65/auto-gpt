"""Example demonstrating memory usage."""

from autogpt import Agent, Goal


def main():
    """Run an example demonstrating memory features."""
    # Create an agent
    agent = Agent(name="MemoryAgent")

    print("Demonstrating Memory System")
    print("=" * 50)

    # Add some memories
    print("\nAdding memories...")
    agent.memory.add_to_short_term(
        "The capital of France is Paris", importance=8, tags=["geography", "fact"]
    )

    agent.memory.add_to_short_term(
        "Python is a programming language", importance=7, tags=["programming", "fact"]
    )

    agent.memory.add_to_long_term(
        "Always validate user input",
        importance=9,
        tags=["programming", "best-practice"],
    )

    print(f"Short-term memories: {len(agent.memory.get_short_term())}")
    print(f"Long-term memories: {len(agent.memory.get_long_term())}")

    # Search memories
    print("\n" + "=" * 50)
    print("\nSearching for 'programming'...")
    results = agent.memory.search("programming")
    print(f"Found {len(results)} results:")
    for result in results:
        print(f"  - {result.content} (importance: {result.importance})")

    # Search by tag
    print("\n" + "=" * 50)
    print("\nSearching by tag 'fact'...")
    results = agent.memory.search_by_tag("fact")
    print(f"Found {len(results)} results:")
    for result in results:
        print(f"  - {result.content}")

    # Add goals and execute them - this will create more memories
    print("\n" + "=" * 50)
    print("\nExecuting goals (this will create memories)...")

    goal1 = Goal(description="Calculate 15 + 25", priority=5)
    goal2 = Goal(description="Echo a message", priority=3)

    agent.add_goal(goal1)
    agent.add_goal(goal2)

    agent.run(max_iterations=5)

    # Show updated memory stats
    print("\n" + "=" * 50)
    print("\nMemory after goal execution:")
    print(f"Short-term memories: {len(agent.memory.get_short_term())}")
    print(f"Long-term memories: {len(agent.memory.get_long_term())}")

    print("\nRecent short-term memories:")
    for memory in agent.memory.get_short_term()[-3:]:
        print(f"  - {memory.content}")

    # Search for goal-related memories
    print("\n" + "=" * 50)
    print("\nSearching for goal-related memories...")
    goal_memories = agent.memory.search_by_tag("goal")
    print(f"Found {len(goal_memories)} goal-related memories")


if __name__ == "__main__":
    main()
