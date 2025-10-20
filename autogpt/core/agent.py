"""Core Agent implementation."""

from typing import Optional, List, Dict, Any
from autogpt.core.goal import Goal, GoalManager, GoalStatus
from autogpt.tools.base import ToolRegistry, Tool, ToolResult
from autogpt.memory.base import Memory
from autogpt.config.settings import AgentConfig


class ReasoningStep:
    """Represents a reasoning step in the agent's thought process."""

    def __init__(
        self,
        thought: str,
        action: Optional[str] = None,
        observation: Optional[str] = None,
    ):
        """Initialize a reasoning step.

        Args:
            thought: The agent's thought
            action: Action taken (if any)
            observation: Observation from the action (if any)
        """
        self.thought = thought
        self.action = action
        self.observation = observation

    def __str__(self) -> str:
        """String representation of the reasoning step."""
        parts = [f"Thought: {self.thought}"]
        if self.action:
            parts.append(f"Action: {self.action}")
        if self.observation:
            parts.append(f"Observation: {self.observation}")
        return "\n".join(parts)


class Agent:
    """Autonomous agent with self-directed reasoning and goal execution.

    The Agent class provides the core functionality for:
    - Self-directed reasoning
    - Recursive goal execution
    - Dynamic tool use
    - Memory management
    """

    def __init__(self, name: str = "AutoGPT", config: Optional[AgentConfig] = None):
        """Initialize the agent.

        Args:
            name: Name of the agent
            config: Configuration for the agent
        """
        self.name = name
        self.config = config or AgentConfig()
        self.goal_manager = GoalManager()
        self.tool_registry = ToolRegistry()
        self.memory = Memory(max_short_term=self.config.max_short_term_memory)
        self.reasoning_history: List[ReasoningStep] = []
        self._setup_default_tools()

    def _setup_default_tools(self) -> None:
        """Set up default tools available to the agent."""
        from autogpt.tools.base import EchoTool, CalculatorTool

        self.tool_registry.register(EchoTool())
        self.tool_registry.register(CalculatorTool())

    def add_goal(self, goal: Goal) -> None:
        """Add a goal for the agent to work on.

        Args:
            goal: The goal to add
        """
        self.goal_manager.add_goal(goal)
        self.memory.add_to_short_term(
            f"New goal added: {goal.description}",
            importance=goal.priority,
            tags=["goal"],
        )

    def add_tool(self, tool: Tool) -> None:
        """Add a tool to the agent's toolbox.

        Args:
            tool: The tool to add
        """
        self.tool_registry.register(tool)
        self.memory.add_to_short_term(
            f"New tool available: {tool.name} - {tool.description}",
            importance=5,
            tags=["tool"],
        )

    def think(self, context: str) -> str:
        """Perform reasoning about the current context.

        Args:
            context: The current context to reason about

        Returns:
            The agent's reasoning/thought process
        """
        # Simple reasoning based on available information
        thought = f"Analyzing context: {context}"

        # Check what tools are available
        available_tools = self.tool_registry.list_tools()
        if available_tools:
            thought += f"\nAvailable tools: {', '.join(available_tools)}"

        # Check current goals
        next_goal = self.goal_manager.get_next_goal()
        if next_goal:
            thought += f"\nNext goal to work on: {next_goal.description}"

        # Check recent memories
        recent_memories = self.memory.get_short_term()
        if recent_memories:
            thought += f"\nRecent context from memory: {len(recent_memories)} items"

        return thought

    def execute_tool(self, tool_name: str, **kwargs) -> ToolResult:
        """Execute a tool by name.

        Args:
            tool_name: Name of the tool to execute
            **kwargs: Parameters for the tool

        Returns:
            Result of the tool execution
        """
        tool = self.tool_registry.get(tool_name)
        if not tool:
            return ToolResult(success=False, error=f"Tool '{tool_name}' not found")

        try:
            result = tool.execute(**kwargs)

            # Remember the action
            self.memory.add_to_short_term(
                f"Executed tool '{tool_name}' with result: {result.output}",
                importance=5,
                tags=["action", "tool"],
            )

            # Record reasoning step
            reasoning_step = ReasoningStep(
                thought=f"Using tool {tool_name}",
                action=f"{tool_name}({kwargs})",
                observation=str(result.output) if result.success else result.error,
            )
            self.reasoning_history.append(reasoning_step)

            return result
        except Exception as e:
            return ToolResult(success=False, error=f"Error executing tool: {str(e)}")

    def execute_goal(self, goal: Goal) -> bool:
        """Execute a single goal.

        Args:
            goal: The goal to execute

        Returns:
            True if goal was completed successfully, False otherwise
        """
        goal.mark_in_progress()

        # Record reasoning
        reasoning_step = ReasoningStep(
            thought=f"Working on goal: {goal.description}",
            action="Analyzing goal and sub-goals",
        )
        self.reasoning_history.append(reasoning_step)

        # If goal has sub-goals, execute them first
        if goal.sub_goals:
            for sub_goal in goal.sub_goals:
                if not self.execute_goal(sub_goal):
                    goal.mark_failed("Sub-goal execution failed")
                    return False

        # Simple execution - in a real implementation, this would involve
        # more sophisticated planning and reasoning
        if goal.all_sub_goals_completed() or not goal.sub_goals:
            goal.mark_completed(result="Goal completed")
            self.memory.add_to_long_term(
                f"Completed goal: {goal.description}",
                importance=8,
                tags=["goal", "completed"],
            )
            return True

        return False

    def run(self, max_iterations: Optional[int] = None) -> Dict[str, Any]:
        """Run the agent's main loop.

        Args:
            max_iterations: Maximum number of iterations to run (None for unlimited)

        Returns:
            Summary of the run including completed goals and actions taken
        """
        iterations = 0
        completed_goals = []

        while True:
            if max_iterations and iterations >= max_iterations:
                break

            # Get next goal
            next_goal = self.goal_manager.get_next_goal()
            if not next_goal:
                break  # No more goals to execute

            # Execute the goal
            success = self.execute_goal(next_goal)
            if success:
                completed_goals.append(next_goal)

            iterations += 1

        return {
            "iterations": iterations,
            "completed_goals": len(completed_goals),
            "total_goals": len(self.goal_manager.get_all_goals()),
            "reasoning_steps": len(self.reasoning_history),
        }

    def get_status(self) -> Dict[str, Any]:
        """Get current status of the agent.

        Returns:
            Dictionary containing agent status information
        """
        all_goals = self.goal_manager.get_all_goals()

        return {
            "name": self.name,
            "total_goals": len(all_goals),
            "pending_goals": len(
                [g for g in all_goals if g.status == GoalStatus.PENDING]
            ),
            "completed_goals": len(self.goal_manager.get_completed_goals()),
            "available_tools": self.tool_registry.list_tools(),
            "short_term_memories": len(self.memory.get_short_term()),
            "long_term_memories": len(self.memory.get_long_term()),
            "reasoning_steps": len(self.reasoning_history),
        }
