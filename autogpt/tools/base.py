"""Tool system for dynamic tool use by agents."""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional, List
from pydantic import BaseModel, Field


class ToolResult(BaseModel):
    """Result of a tool execution."""

    success: bool = Field(..., description="Whether the tool executed successfully")
    output: Any = Field(default=None, description="Output from the tool")
    error: Optional[str] = Field(default=None, description="Error message if failed")
    metadata: Dict[str, Any] = Field(
        default_factory=dict, description="Additional metadata"
    )


class Tool(ABC):
    """Base class for all tools that can be used by agents.

    Tools provide specific capabilities to agents, such as web search,
    file operations, calculations, etc.
    """

    @property
    @abstractmethod
    def name(self) -> str:
        """Get the name of the tool."""
        pass

    @property
    @abstractmethod
    def description(self) -> str:
        """Get a description of what the tool does."""
        pass

    @abstractmethod
    def execute(self, **kwargs) -> ToolResult:
        """Execute the tool with the given parameters.

        Args:
            **kwargs: Tool-specific parameters

        Returns:
            ToolResult containing the execution result
        """
        pass

    def validate_input(self, **kwargs) -> bool:
        """Validate input parameters before execution.

        Args:
            **kwargs: Parameters to validate

        Returns:
            True if input is valid, False otherwise
        """
        return True


class ToolRegistry:
    """Registry for managing available tools."""

    def __init__(self):
        self._tools: Dict[str, Tool] = {}

    def register(self, tool: Tool) -> None:
        """Register a tool.

        Args:
            tool: The tool to register
        """
        self._tools[tool.name] = tool

    def get(self, name: str) -> Optional[Tool]:
        """Get a tool by name.

        Args:
            name: Name of the tool

        Returns:
            The tool if found, None otherwise
        """
        return self._tools.get(name)

    def list_tools(self) -> List[str]:
        """List all registered tool names.

        Returns:
            List of tool names
        """
        return list(self._tools.keys())

    def get_all_tools(self) -> Dict[str, Tool]:
        """Get all registered tools.

        Returns:
            Dictionary mapping tool names to tools
        """
        return self._tools.copy()


# Example built-in tools


class EchoTool(Tool):
    """Simple tool that echoes back the input."""

    @property
    def name(self) -> str:
        return "echo"

    @property
    def description(self) -> str:
        return "Echoes back the provided message"

    def execute(self, message: str = "", **kwargs) -> ToolResult:
        """Echo the message back.

        Args:
            message: Message to echo

        Returns:
            ToolResult with the echoed message
        """
        return ToolResult(success=True, output=message)


class CalculatorTool(Tool):
    """Simple calculator tool for basic arithmetic."""

    @property
    def name(self) -> str:
        return "calculator"

    @property
    def description(self) -> str:
        return "Performs basic arithmetic operations (add, subtract, multiply, divide)"

    def execute(self, operation: str, a: float, b: float, **kwargs) -> ToolResult:
        """Perform arithmetic operation.

        Args:
            operation: Operation to perform (add, subtract, multiply, divide)
            a: First operand
            b: Second operand

        Returns:
            ToolResult with the calculation result
        """
        try:
            if operation == "add":
                result = a + b
            elif operation == "subtract":
                result = a - b
            elif operation == "multiply":
                result = a * b
            elif operation == "divide":
                if b == 0:
                    return ToolResult(success=False, error="Division by zero")
                result = a / b
            else:
                return ToolResult(
                    success=False, error=f"Unknown operation: {operation}"
                )

            return ToolResult(success=True, output=result)
        except Exception as e:
            return ToolResult(success=False, error=str(e))
