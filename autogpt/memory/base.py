"""Memory management for agents."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from datetime import datetime


class MemoryEntry(BaseModel):
    """Represents a single memory entry."""

    content: str = Field(..., description="Content of the memory")
    timestamp: datetime = Field(
        default_factory=datetime.now, description="When the memory was created"
    )
    importance: int = Field(default=0, description="Importance score (0-10)")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )
    tags: List[str] = Field(default_factory=list, description="Tags for categorization")


class Memory:
    """Memory system for storing and retrieving information.

    Provides both short-term (working) and long-term memory capabilities.
    """

    def __init__(self, max_short_term: int = 10):
        """Initialize the memory system.

        Args:
            max_short_term: Maximum number of entries in short-term memory
        """
        self.short_term: List[MemoryEntry] = []
        self.long_term: List[MemoryEntry] = []
        self.max_short_term = max_short_term

    def add_to_short_term(
        self,
        content: str,
        importance: int = 0,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Add an entry to short-term memory.

        Args:
            content: Content to remember
            importance: Importance score (0-10)
            tags: Optional tags for categorization
            metadata: Optional additional metadata
        """
        entry = MemoryEntry(
            content=content,
            importance=importance,
            tags=tags or [],
            metadata=metadata or {},
        )

        self.short_term.append(entry)

        # Move to long-term if short-term is full
        if len(self.short_term) > self.max_short_term:
            oldest = self.short_term.pop(0)
            if oldest.importance >= 5:  # Only keep important memories
                self.long_term.append(oldest)

    def add_to_long_term(
        self,
        content: str,
        importance: int = 0,
        tags: Optional[List[str]] = None,
        metadata: Optional[Dict[str, Any]] = None,
    ) -> None:
        """Add an entry directly to long-term memory.

        Args:
            content: Content to remember
            importance: Importance score (0-10)
            tags: Optional tags for categorization
            metadata: Optional additional metadata
        """
        entry = MemoryEntry(
            content=content,
            importance=importance,
            tags=tags or [],
            metadata=metadata or {},
        )
        self.long_term.append(entry)

    def get_short_term(self) -> List[MemoryEntry]:
        """Get all short-term memories.

        Returns:
            List of short-term memory entries
        """
        return self.short_term

    def get_long_term(self) -> List[MemoryEntry]:
        """Get all long-term memories.

        Returns:
            List of long-term memory entries
        """
        return self.long_term

    def search(self, query: str, search_long_term: bool = True) -> List[MemoryEntry]:
        """Search for memories containing the query string.

        Args:
            query: Search query
            search_long_term: Whether to search long-term memory

        Returns:
            List of matching memory entries
        """
        results = []

        # Search short-term memory
        for entry in self.short_term:
            if query.lower() in entry.content.lower():
                results.append(entry)

        # Search long-term memory if requested
        if search_long_term:
            for entry in self.long_term:
                if query.lower() in entry.content.lower():
                    results.append(entry)

        return results

    def search_by_tag(
        self, tag: str, search_long_term: bool = True
    ) -> List[MemoryEntry]:
        """Search for memories by tag.

        Args:
            tag: Tag to search for
            search_long_term: Whether to search long-term memory

        Returns:
            List of matching memory entries
        """
        results = []

        # Search short-term memory
        for entry in self.short_term:
            if tag in entry.tags:
                results.append(entry)

        # Search long-term memory if requested
        if search_long_term:
            for entry in self.long_term:
                if tag in entry.tags:
                    results.append(entry)

        return results

    def clear_short_term(self) -> None:
        """Clear all short-term memory."""
        self.short_term.clear()

    def clear_long_term(self) -> None:
        """Clear all long-term memory."""
        self.long_term.clear()

    def clear_all(self) -> None:
        """Clear all memory."""
        self.clear_short_term()
        self.clear_long_term()
