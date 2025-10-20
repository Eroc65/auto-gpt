"""
Repository cloner and analyzer
"""
import os
import shutil
from pathlib import Path
from typing import Dict, List, Optional
import git
from autogpt.logger import logger


class RepositoryCloner:
    """Handles cloning and initial analysis of GitHub repositories"""
    
    def __init__(self, output_dir: str = "./repos"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def clone(self, repo_url: str, depth: int = 1) -> Optional[Path]:
        """
        Clone a repository from a URL
        
        Args:
            repo_url: GitHub repository URL
            depth: Clone depth (1 for shallow clone)
            
        Returns:
            Path to cloned repository or None if failed
        """
        try:
            # Extract repo name from URL
            repo_name = repo_url.rstrip('/').split('/')[-1].replace('.git', '')
            repo_path = self.output_dir / repo_name
            
            # Remove existing directory if it exists
            if repo_path.exists():
                logger.info(f"Removing existing directory: {repo_path}")
                shutil.rmtree(repo_path)
            
            logger.info(f"Cloning repository: {repo_url}")
            logger.info(f"Destination: {repo_path}")
            
            # Clone the repository
            if depth > 0:
                git.Repo.clone_from(repo_url, repo_path, depth=depth)
            else:
                git.Repo.clone_from(repo_url, repo_path)
            
            logger.info("Repository cloned successfully")
            return repo_path
            
        except Exception as e:
            logger.error(f"Failed to clone repository: {str(e)}")
            return None
    
    def get_repo_info(self, repo_path: Path) -> Dict:
        """
        Get basic information about a repository
        
        Args:
            repo_path: Path to the repository
            
        Returns:
            Dictionary containing repository information
        """
        info = {
            "path": str(repo_path),
            "name": repo_path.name,
            "files": [],
            "directories": [],
            "languages": {},
            "size_bytes": 0
        }
        
        try:
            # Count files and directories
            for item in repo_path.rglob("*"):
                # Skip .git directory
                if ".git" in item.parts:
                    continue
                
                if item.is_file():
                    info["files"].append(str(item.relative_to(repo_path)))
                    info["size_bytes"] += item.stat().st_size
                    
                    # Track language by extension
                    ext = item.suffix
                    if ext:
                        info["languages"][ext] = info["languages"].get(ext, 0) + 1
                elif item.is_dir():
                    info["directories"].append(str(item.relative_to(repo_path)))
            
            info["file_count"] = len(info["files"])
            info["dir_count"] = len(info["directories"])
            
        except Exception as e:
            logger.error(f"Error analyzing repository: {str(e)}")
        
        return info
