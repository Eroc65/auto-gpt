"""Goal management and execution system."""

from enum import Enum
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field
from datetime import datetime


class GoalStatus(Enum):
    """Status of a goal in the execution pipeline."""

    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"
    BLOCKED = "blocked"


class Goal(BaseModel):
    """Represents a goal in the Auto-GPT system.

    Goals can have sub-goals, allowing for recursive goal decomposition
    and execution.
    """

    description: str = Field(..., description="Description of the goal")
    status: GoalStatus = Field(default=GoalStatus.PENDING, description="Current status")
    priority: int = Field(
        default=0, description="Priority level (higher = more important)"
    )
    parent_id: Optional[str] = Field(
        default=None, description="ID of parent goal if this is a sub-goal"
    )
    sub_goals: List["Goal"] = Field(
        default_factory=list, description="List of sub-goals"
    )
    created_at: datetime = Field(
        default_factory=datetime.now, description="Creation timestamp"
    )
    completed_at: Optional[datetime] = Field(
        default=None, description="Completion timestamp"
    )
    result: Optional[Any] = Field(default=None, description="Result of goal execution")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )

    def add_sub_goal(self, goal: "Goal") -> None:
        """Add a sub-goal to this goal.

        Args:
            goal: The sub-goal to add
        """
        goal.parent_id = id(self)
        self.sub_goals.append(goal)

    def mark_completed(self, result: Any = None) -> None:
        """Mark this goal as completed.

        Args:
            result: Optional result of the goal execution
        """
        self.status = GoalStatus.COMPLETED
        self.completed_at = datetime.now()
        self.result = result

    def mark_failed(self, error: Optional[str] = None) -> None:
        """Mark this goal as failed.

        Args:
            error: Optional error message
        """
        self.status = GoalStatus.FAILED
        if error:
            self.metadata["error"] = error

    def mark_in_progress(self) -> None:
        """Mark this goal as in progress."""
        self.status = GoalStatus.IN_PROGRESS

    def is_completed(self) -> bool:
        """Check if the goal is completed."""
        return self.status == GoalStatus.COMPLETED

    def all_sub_goals_completed(self) -> bool:
        """Check if all sub-goals are completed."""
        return all(goal.is_completed() for goal in self.sub_goals)


class GoalManager:
    """Manages goals and their execution order."""

    def __init__(self):
        self.goals: List[Goal] = []

    def add_goal(self, goal: Goal) -> None:
        """Add a goal to the manager.

        Args:
            goal: The goal to add
        """
        self.goals.append(goal)

    def get_next_goal(self) -> Optional[Goal]:
        """Get the next goal to execute based on priority.

        Returns:
            The next goal to execute, or None if no goals are pending
        """
        pending_goals = [g for g in self.goals if g.status == GoalStatus.PENDING]
        if not pending_goals:
            return None
        return max(pending_goals, key=lambda g: g.priority)

    def get_all_goals(self) -> List[Goal]:
        """Get all goals.

        Returns:
            List of all goals
        """
        return self.goals

    def get_completed_goals(self) -> List[Goal]:
        """Get all completed goals.

        Returns:
            List of completed goals
        """
        return [g for g in self.goals if g.is_completed()]
