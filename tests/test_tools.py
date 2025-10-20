"""Tests for Tool system."""

from autogpt.tools.base import ToolRegistry, EchoTool, CalculatorTool


def test_echo_tool():
    """Test the Echo tool."""
    tool = EchoTool()
    assert tool.name == "echo"

    result = tool.execute(message="Hello, World!")
    assert result.success is True
    assert result.output == "Hello, World!"


def test_calculator_tool_add():
    """Test calculator addition."""
    tool = CalculatorTool()
    result = tool.execute(operation="add", a=5, b=3)

    assert result.success is True
    assert result.output == 8


def test_calculator_tool_subtract():
    """Test calculator subtraction."""
    tool = CalculatorTool()
    result = tool.execute(operation="subtract", a=10, b=3)

    assert result.success is True
    assert result.output == 7


def test_calculator_tool_multiply():
    """Test calculator multiplication."""
    tool = CalculatorTool()
    result = tool.execute(operation="multiply", a=4, b=5)

    assert result.success is True
    assert result.output == 20


def test_calculator_tool_divide():
    """Test calculator division."""
    tool = CalculatorTool()
    result = tool.execute(operation="divide", a=15, b=3)

    assert result.success is True
    assert result.output == 5


def test_calculator_tool_divide_by_zero():
    """Test calculator division by zero."""
    tool = CalculatorTool()
    result = tool.execute(operation="divide", a=10, b=0)

    assert result.success is False
    assert "Division by zero" in result.error


def test_calculator_tool_invalid_operation():
    """Test calculator with invalid operation."""
    tool = CalculatorTool()
    result = tool.execute(operation="invalid", a=5, b=3)

    assert result.success is False
    assert "Unknown operation" in result.error


def test_tool_registry_register():
    """Test registering a tool."""
    registry = ToolRegistry()
    tool = EchoTool()

    registry.register(tool)
    assert "echo" in registry.list_tools()


def test_tool_registry_get():
    """Test getting a tool from registry."""
    registry = ToolRegistry()
    tool = EchoTool()
    registry.register(tool)

    retrieved = registry.get("echo")
    assert retrieved is not None
    assert retrieved.name == "echo"


def test_tool_registry_get_nonexistent():
    """Test getting a non-existent tool."""
    registry = ToolRegistry()
    tool = registry.get("nonexistent")
    assert tool is None


def test_tool_registry_list_tools():
    """Test listing all tools."""
    registry = ToolRegistry()
    registry.register(EchoTool())
    registry.register(CalculatorTool())

    tools = registry.list_tools()
    assert len(tools) == 2
    assert "echo" in tools
    assert "calculator" in tools


def test_tool_registry_get_all_tools():
    """Test getting all tools."""
    registry = ToolRegistry()
    echo = EchoTool()
    calc = CalculatorTool()

    registry.register(echo)
    registry.register(calc)

    all_tools = registry.get_all_tools()
    assert len(all_tools) == 2
    assert "echo" in all_tools
    assert "calculator" in all_tools
