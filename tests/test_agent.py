"""Tests for Agent."""

from autogpt.core.agent import Agent
from autogpt.core.goal import Goal
from autogpt.tools.base import Tool, ToolResult


class MockTool(Tool):
    """Mock tool for testing."""

    @property
    def name(self) -> str:
        return "mock_tool"

    @property
    def description(self) -> str:
        return "A mock tool for testing"

    def execute(self, **kwargs) -> ToolResult:
        return ToolResult(success=True, output="Mock result")


def test_agent_creation():
    """Test creating an agent."""
    agent = Agent(name="TestAgent")
    assert agent.name == "TestAgent"
    assert agent.goal_manager is not None
    assert agent.tool_registry is not None
    assert agent.memory is not None


def test_agent_add_goal():
    """Test adding a goal to the agent."""
    agent = Agent()
    goal = Goal(description="Test goal")

    agent.add_goal(goal)

    all_goals = agent.goal_manager.get_all_goals()
    assert len(all_goals) == 1
    assert all_goals[0].description == "Test goal"


def test_agent_add_tool():
    """Test adding a tool to the agent."""
    agent = Agent()
    tool = MockTool()

    agent.add_tool(tool)

    tools = agent.tool_registry.list_tools()
    assert "mock_tool" in tools


def test_agent_default_tools():
    """Test that agent has default tools."""
    agent = Agent()
    tools = agent.tool_registry.list_tools()

    assert "echo" in tools
    assert "calculator" in tools


def test_agent_execute_tool():
    """Test executing a tool."""
    agent = Agent()
    result = agent.execute_tool("echo", message="Hello")

    assert result.success is True
    assert result.output == "Hello"


def test_agent_execute_nonexistent_tool():
    """Test executing a non-existent tool."""
    agent = Agent()
    result = agent.execute_tool("nonexistent")

    assert result.success is False
    assert "not found" in result.error


def test_agent_think():
    """Test agent thinking/reasoning."""
    agent = Agent()
    agent.add_goal(Goal(description="Test goal"))

    thought = agent.think("Current context")

    assert "Analyzing context" in thought
    assert "Test goal" in thought


def test_agent_execute_simple_goal():
    """Test executing a simple goal."""
    agent = Agent()
    goal = Goal(description="Simple goal")

    success = agent.execute_goal(goal)

    assert success is True
    assert goal.is_completed()


def test_agent_execute_goal_with_subgoals():
    """Test executing a goal with sub-goals."""
    agent = Agent()

    main_goal = Goal(description="Main goal")
    sub_goal1 = Goal(description="Sub-goal 1")
    sub_goal2 = Goal(description="Sub-goal 2")

    main_goal.add_sub_goal(sub_goal1)
    main_goal.add_sub_goal(sub_goal2)

    success = agent.execute_goal(main_goal)

    assert success is True
    assert main_goal.is_completed()
    assert sub_goal1.is_completed()
    assert sub_goal2.is_completed()


def test_agent_run():
    """Test running the agent."""
    agent = Agent()

    goal1 = Goal(description="Goal 1", priority=1)
    goal2 = Goal(description="Goal 2", priority=2)

    agent.add_goal(goal1)
    agent.add_goal(goal2)

    summary = agent.run(max_iterations=10)

    assert summary["completed_goals"] == 2
    assert summary["total_goals"] == 2
    assert summary["iterations"] == 2


def test_agent_run_with_max_iterations():
    """Test running agent with iteration limit."""
    agent = Agent()

    # Add many goals
    for i in range(10):
        agent.add_goal(Goal(description=f"Goal {i}"))

    summary = agent.run(max_iterations=3)

    assert summary["iterations"] == 3
    assert summary["completed_goals"] == 3


def test_agent_get_status():
    """Test getting agent status."""
    agent = Agent()
    agent.add_goal(Goal(description="Goal 1"))
    agent.add_goal(Goal(description="Goal 2"))

    status = agent.get_status()

    assert status["name"] == "AutoGPT"
    assert status["total_goals"] == 2
    assert status["pending_goals"] == 2
    assert status["completed_goals"] == 0
    assert "echo" in status["available_tools"]


def test_agent_reasoning_history():
    """Test that agent tracks reasoning history."""
    agent = Agent()

    agent.execute_tool("echo", message="Test")

    assert len(agent.reasoning_history) > 0
    assert agent.reasoning_history[0].action is not None
