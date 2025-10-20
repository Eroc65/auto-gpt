"""
Configuration management for Auto-GPT GitHub Agent
"""
import os
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


class Config:
    """Configuration class for the GitHub Agent"""
    
    def __init__(self):
        # API Keys
        self.openai_api_key: Optional[str] = os.getenv("OPENAI_API_KEY")
        self.github_token: Optional[str] = os.getenv("GITHUB_TOKEN")
        
        # Agent settings
        self.max_iterations: int = int(os.getenv("MAX_ITERATIONS", "10"))
        self.verbose: bool = os.getenv("VERBOSE", "true").lower() == "true"
        
        # Output settings
        self.output_dir: str = os.getenv("OUTPUT_DIR", "./output")
        
        # Repository settings
        self.clone_depth: int = int(os.getenv("CLONE_DEPTH", "1"))
        
    def validate(self) -> bool:
        """Validate that required configuration is present"""
        if not self.openai_api_key:
            print("Warning: OPENAI_API_KEY not set. Some features may be limited.")
            return False
        return True


# Global config instance
config = Config()
