"""Tests for Goal management."""

from autogpt.core.goal import Goal, GoalStatus, GoalManager


def test_goal_creation():
    """Test creating a goal."""
    goal = Goal(description="Test goal", priority=5)
    assert goal.description == "Test goal"
    assert goal.priority == 5
    assert goal.status == GoalStatus.PENDING


def test_goal_with_sub_goals():
    """Test goal with sub-goals."""
    main_goal = Goal(description="Main goal")
    sub_goal1 = Goal(description="Sub-goal 1")
    sub_goal2 = Goal(description="Sub-goal 2")

    main_goal.add_sub_goal(sub_goal1)
    main_goal.add_sub_goal(sub_goal2)

    assert len(main_goal.sub_goals) == 2
    assert main_goal.sub_goals[0].description == "Sub-goal 1"


def test_goal_completion():
    """Test marking a goal as completed."""
    goal = Goal(description="Test goal")
    assert not goal.is_completed()

    goal.mark_completed(result="Success")
    assert goal.is_completed()
    assert goal.status == GoalStatus.COMPLETED
    assert goal.result == "Success"


def test_goal_failure():
    """Test marking a goal as failed."""
    goal = Goal(description="Test goal")
    goal.mark_failed(error="Something went wrong")

    assert goal.status == GoalStatus.FAILED
    assert goal.metadata["error"] == "Something went wrong"


def test_all_sub_goals_completed():
    """Test checking if all sub-goals are completed."""
    main_goal = Goal(description="Main goal")
    sub_goal1 = Goal(description="Sub-goal 1")
    sub_goal2 = Goal(description="Sub-goal 2")

    main_goal.add_sub_goal(sub_goal1)
    main_goal.add_sub_goal(sub_goal2)

    assert not main_goal.all_sub_goals_completed()

    sub_goal1.mark_completed()
    assert not main_goal.all_sub_goals_completed()

    sub_goal2.mark_completed()
    assert main_goal.all_sub_goals_completed()


def test_goal_manager_add_goal():
    """Test adding goals to the manager."""
    manager = GoalManager()
    goal1 = Goal(description="Goal 1", priority=1)
    goal2 = Goal(description="Goal 2", priority=2)

    manager.add_goal(goal1)
    manager.add_goal(goal2)

    assert len(manager.get_all_goals()) == 2


def test_goal_manager_get_next_goal():
    """Test getting the next goal based on priority."""
    manager = GoalManager()
    goal1 = Goal(description="Low priority", priority=1)
    goal2 = Goal(description="High priority", priority=10)
    goal3 = Goal(description="Medium priority", priority=5)

    manager.add_goal(goal1)
    manager.add_goal(goal2)
    manager.add_goal(goal3)

    next_goal = manager.get_next_goal()
    assert next_goal is not None
    assert next_goal.description == "High priority"


def test_goal_manager_no_pending_goals():
    """Test getting next goal when all are completed."""
    manager = GoalManager()
    goal = Goal(description="Test goal")
    goal.mark_completed()
    manager.add_goal(goal)

    next_goal = manager.get_next_goal()
    assert next_goal is None


def test_goal_manager_get_completed_goals():
    """Test getting completed goals."""
    manager = GoalManager()
    goal1 = Goal(description="Goal 1")
    goal2 = Goal(description="Goal 2")

    manager.add_goal(goal1)
    manager.add_goal(goal2)

    goal1.mark_completed()

    completed = manager.get_completed_goals()
    assert len(completed) == 1
    assert completed[0].description == "Goal 1"
