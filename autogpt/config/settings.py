"""Configuration management for Auto-GPT."""

from typing import Optional
from pydantic import BaseModel, Field


class AgentConfig(BaseModel):
    """Configuration for an Agent."""

    max_short_term_memory: int = Field(
        default=10, description="Maximum number of items in short-term memory"
    )
    max_iterations: Optional[int] = Field(
        default=None,
        description="Maximum iterations for agent execution (None for unlimited)",
    )
    enable_reasoning_history: bool = Field(
        default=True, description="Whether to track reasoning history"
    )
    tool_timeout: int = Field(
        default=30, description="Timeout for tool execution in seconds"
    )


class SystemConfig(BaseModel):
    """System-wide configuration."""

    log_level: str = Field(
        default="INFO", description="Logging level (DEBUG, INFO, WARNING, ERROR)"
    )
    enable_telemetry: bool = Field(
        default=False, description="Whether to enable telemetry"
    )
