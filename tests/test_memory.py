"""Tests for Memory system."""

from autogpt.memory.base import Memory


def test_memory_creation():
    """Test creating a memory system."""
    memory = Memory(max_short_term=5)
    assert len(memory.get_short_term()) == 0
    assert len(memory.get_long_term()) == 0


def test_add_to_short_term():
    """Test adding to short-term memory."""
    memory = Memory()
    memory.add_to_short_term("Test memory", importance=5)

    short_term = memory.get_short_term()
    assert len(short_term) == 1
    assert short_term[0].content == "Test memory"
    assert short_term[0].importance == 5


def test_add_to_long_term():
    """Test adding to long-term memory."""
    memory = Memory()
    memory.add_to_long_term("Important memory", importance=8)

    long_term = memory.get_long_term()
    assert len(long_term) == 1
    assert long_term[0].content == "Important memory"


def test_short_term_overflow():
    """Test that short-term memory overflows to long-term."""
    memory = Memory(max_short_term=2)

    # Add 3 items with high importance
    memory.add_to_short_term("Memory 1", importance=8)
    memory.add_to_short_term("Memory 2", importance=7)
    memory.add_to_short_term("Memory 3", importance=9)

    # Short-term should have 2 items
    assert len(memory.get_short_term()) == 2
    # Long-term should have 1 item (the overflow)
    assert len(memory.get_long_term()) == 1


def test_short_term_overflow_low_importance():
    """Test that low importance items are not kept when overflowing."""
    memory = Memory(max_short_term=2)

    # Add items with low importance
    memory.add_to_short_term("Memory 1", importance=2)
    memory.add_to_short_term("Memory 2", importance=3)
    memory.add_to_short_term("Memory 3", importance=1)

    # Short-term should have 2 items
    assert len(memory.get_short_term()) == 2
    # Long-term should have 0 items (low importance not kept)
    assert len(memory.get_long_term()) == 0


def test_memory_search():
    """Test searching memory."""
    memory = Memory()
    memory.add_to_short_term("The cat sat on the mat")
    memory.add_to_short_term("The dog ran in the park")
    memory.add_to_long_term("The cat climbed a tree")

    results = memory.search("cat")
    assert len(results) == 2

    results = memory.search("dog")
    assert len(results) == 1


def test_memory_search_short_term_only():
    """Test searching only short-term memory."""
    memory = Memory()
    memory.add_to_short_term("Short-term cat")
    memory.add_to_long_term("Long-term cat")

    results = memory.search("cat", search_long_term=False)
    assert len(results) == 1


def test_memory_search_by_tag():
    """Test searching by tag."""
    memory = Memory()
    memory.add_to_short_term("Goal 1", tags=["goal", "important"])
    memory.add_to_short_term("Action 1", tags=["action"])
    memory.add_to_long_term("Goal 2", tags=["goal"])

    results = memory.search_by_tag("goal")
    assert len(results) == 2

    results = memory.search_by_tag("action")
    assert len(results) == 1


def test_clear_short_term():
    """Test clearing short-term memory."""
    memory = Memory()
    memory.add_to_short_term("Test 1")
    memory.add_to_short_term("Test 2")

    memory.clear_short_term()
    assert len(memory.get_short_term()) == 0


def test_clear_long_term():
    """Test clearing long-term memory."""
    memory = Memory()
    memory.add_to_long_term("Test 1")
    memory.add_to_long_term("Test 2")

    memory.clear_long_term()
    assert len(memory.get_long_term()) == 0


def test_clear_all():
    """Test clearing all memory."""
    memory = Memory()
    memory.add_to_short_term("Short-term")
    memory.add_to_long_term("Long-term")

    memory.clear_all()
    assert len(memory.get_short_term()) == 0
    assert len(memory.get_long_term()) == 0


def test_memory_entry_with_metadata():
    """Test memory entry with metadata."""
    memory = Memory()
    memory.add_to_short_term(
        "Test", importance=7, tags=["test"], metadata={"source": "test_function"}
    )

    entry = memory.get_short_term()[0]
    assert entry.metadata["source"] == "test_function"
    assert "test" in entry.tags
