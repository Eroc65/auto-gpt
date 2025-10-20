"""Utility functions for Auto-GPT."""

from typing import Any, Dict
import yaml


def load_yaml_config(file_path: str) -> Dict[str, Any]:
    """Load configuration from a YAML file.

    Args:
        file_path: Path to the YAML file

    Returns:
        Dictionary containing the configuration
    """
    with open(file_path, "r") as f:
        return yaml.safe_load(f)


def save_yaml_config(config: Dict[str, Any], file_path: str) -> None:
    """Save configuration to a YAML file.

    Args:
        config: Configuration dictionary
        file_path: Path to save the YAML file
    """
    with open(file_path, "w") as f:
        yaml.safe_dump(config, f, default_flow_style=False)
