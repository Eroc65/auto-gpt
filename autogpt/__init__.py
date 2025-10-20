"""
Auto-GPT: An experimental open-source framework for autonomous AI agents.

This package provides the core components for building autonomous agents
with self-directed reasoning, recursive goal execution, and dynamic tool use.
"""

__version__ = "0.1.0"

from autogpt.core.agent import Agent
from autogpt.core.goal import Goal, GoalStatus

__all__ = ["Agent", "Goal", "GoalStatus", "__version__"]
