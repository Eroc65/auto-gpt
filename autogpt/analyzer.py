"""
Repository analyzer - identifies purpose and structure
"""
import os
from pathlib import Path
from typing import Dict, List, Optional
from autogpt.logger import logger


class RepositoryAnalyzer:
    """Analyzes repository structure and purpose"""
    
    def __init__(self):
        self.common_config_files = [
            "README.md", "README.rst", "README.txt",
            "package.json", "requirements.txt", "setup.py",
            "Cargo.toml", "go.mod", "pom.xml", "build.gradle",
            ".gitignore", "LICENSE", "Makefile", "Dockerfile"
        ]
        
        self.language_indicators = {
            ".py": "Python",
            ".js": "JavaScript",
            ".ts": "TypeScript",
            ".java": "Java",
            ".go": "Go",
            ".rs": "Rust",
            ".cpp": "C++",
            ".c": "C",
            ".cs": "C#",
            ".rb": "Ruby",
            ".php": "PHP",
            ".swift": "Swift",
            ".kt": "Kotlin",
            ".scala": "Scala"
        }
    
    def analyze(self, repo_path: Path) -> Dict:
        """
        Analyze repository structure and purpose
        
        Args:
            repo_path: Path to the repository
            
        Returns:
            Analysis results as a dictionary
        """
        analysis = {
            "structure": self._analyze_structure(repo_path),
            "purpose": self._identify_purpose(repo_path),
            "technologies": self._identify_technologies(repo_path),
            "entry_points": self._find_entry_points(repo_path),
            "documentation": self._analyze_documentation(repo_path)
        }
        
        return analysis
    
    def _analyze_structure(self, repo_path: Path) -> Dict:
        """Analyze directory structure"""
        structure = {
            "root_files": [],
            "root_dirs": [],
            "has_tests": False,
            "has_docs": False,
            "has_src": False
        }
        
        try:
            for item in repo_path.iterdir():
                if item.name.startswith('.'):
                    continue
                
                if item.is_file():
                    structure["root_files"].append(item.name)
                elif item.is_dir():
                    structure["root_dirs"].append(item.name)
                    
                    # Check for common directories
                    if item.name.lower() in ["test", "tests", "__tests__", "spec"]:
                        structure["has_tests"] = True
                    elif item.name.lower() in ["docs", "doc", "documentation"]:
                        structure["has_docs"] = True
                    elif item.name.lower() in ["src", "source", "lib"]:
                        structure["has_src"] = True
        except Exception as e:
            logger.error(f"Error analyzing structure: {str(e)}")
        
        return structure
    
    def _identify_purpose(self, repo_path: Path) -> Dict:
        """Identify repository purpose from README and structure"""
        purpose = {
            "type": "unknown",
            "description": "",
            "keywords": []
        }
        
        # Try to read README
        readme_files = ["README.md", "README.rst", "README.txt", "README"]
        for readme_name in readme_files:
            readme_path = repo_path / readme_name
            if readme_path.exists():
                try:
                    with open(readme_path, 'r', encoding='utf-8') as f:
                        content = f.read()[:1000]  # Read first 1000 chars
                        purpose["description"] = content
                        
                        # Extract potential project type
                        content_lower = content.lower()
                        if any(word in content_lower for word in ["library", "framework"]):
                            purpose["type"] = "library"
                        elif any(word in content_lower for word in ["api", "server", "backend"]):
                            purpose["type"] = "backend"
                        elif any(word in content_lower for word in ["web app", "frontend", "react", "vue"]):
                            purpose["type"] = "frontend"
                        elif any(word in content_lower for word in ["cli", "command", "tool"]):
                            purpose["type"] = "cli-tool"
                        
                        break
                except Exception as e:
                    logger.error(f"Error reading README: {str(e)}")
        
        return purpose
    
    def _identify_technologies(self, repo_path: Path) -> Dict:
        """Identify technologies used in the repository"""
        technologies = {
            "languages": {},
            "frameworks": [],
            "build_tools": []
        }
        
        try:
            # Count files by extension
            for item in repo_path.rglob("*"):
                if ".git" in item.parts or not item.is_file():
                    continue
                
                ext = item.suffix
                if ext in self.language_indicators:
                    lang = self.language_indicators[ext]
                    technologies["languages"][lang] = technologies["languages"].get(lang, 0) + 1
            
            # Check for framework indicators
            if (repo_path / "package.json").exists():
                technologies["build_tools"].append("npm/node")
            if (repo_path / "requirements.txt").exists():
                technologies["build_tools"].append("pip")
            if (repo_path / "Cargo.toml").exists():
                technologies["build_tools"].append("cargo")
            if (repo_path / "go.mod").exists():
                technologies["build_tools"].append("go modules")
            if (repo_path / "pom.xml").exists():
                technologies["build_tools"].append("maven")
            if (repo_path / "build.gradle").exists():
                technologies["build_tools"].append("gradle")
                
        except Exception as e:
            logger.error(f"Error identifying technologies: {str(e)}")
        
        return technologies
    
    def _find_entry_points(self, repo_path: Path) -> List[str]:
        """Find potential entry points (main files)"""
        entry_points = []
        
        common_entry_files = [
            "main.py", "app.py", "index.js", "main.js", 
            "server.js", "index.ts", "main.go", "main.rs"
        ]
        
        for filename in common_entry_files:
            if (repo_path / filename).exists():
                entry_points.append(filename)
        
        # Check src directory
        src_dir = repo_path / "src"
        if src_dir.exists():
            for filename in common_entry_files:
                if (src_dir / filename).exists():
                    entry_points.append(f"src/{filename}")
        
        return entry_points
    
    def _analyze_documentation(self, repo_path: Path) -> Dict:
        """Analyze documentation quality"""
        docs = {
            "has_readme": False,
            "has_license": False,
            "has_contributing": False,
            "has_docs_dir": False,
            "readme_length": 0
        }
        
        # Check for README
        for readme in ["README.md", "README.rst", "README.txt"]:
            readme_path = repo_path / readme
            if readme_path.exists():
                docs["has_readme"] = True
                try:
                    docs["readme_length"] = readme_path.stat().st_size
                except:
                    pass
                break
        
        # Check for LICENSE
        for license_file in ["LICENSE", "LICENSE.md", "LICENSE.txt"]:
            if (repo_path / license_file).exists():
                docs["has_license"] = True
                break
        
        # Check for CONTRIBUTING
        for contrib in ["CONTRIBUTING.md", "CONTRIBUTING.rst", "CONTRIBUTING.txt"]:
            if (repo_path / contrib).exists():
                docs["has_contributing"] = True
                break
        
        # Check for docs directory
        for docs_dir in ["docs", "doc", "documentation"]:
            if (repo_path / docs_dir).exists():
                docs["has_docs_dir"] = True
                break
        
        return docs
