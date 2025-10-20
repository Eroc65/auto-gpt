"""
Improvement proposer - suggests improvements based on analysis
"""
from pathlib import Path
from typing import Dict, List
from autogpt.logger import logger


class ImprovementProposer:
    """Proposes improvements for a repository based on analysis"""
    
    def __init__(self):
        pass
    
    def propose_improvements(self, analysis: Dict) -> List[Dict]:
        """
        Propose improvements based on repository analysis
        
        Args:
            analysis: Analysis results from RepositoryAnalyzer
            
        Returns:
            List of improvement suggestions
        """
        improvements = []
        
        # Check documentation
        improvements.extend(self._check_documentation(analysis))
        
        # Check structure
        improvements.extend(self._check_structure(analysis))
        
        # Check best practices
        improvements.extend(self._check_best_practices(analysis))
        
        return improvements
    
    def _check_documentation(self, analysis: Dict) -> List[Dict]:
        """Check for documentation improvements"""
        improvements = []
        docs = analysis.get("documentation", {})
        
        if not docs.get("has_readme"):
            improvements.append({
                "category": "documentation",
                "priority": "high",
                "title": "Add README.md",
                "description": "Repository lacks a README file. Add one to describe the project.",
                "action": "create_readme"
            })
        elif docs.get("readme_length", 0) < 100:
            improvements.append({
                "category": "documentation",
                "priority": "medium",
                "title": "Expand README.md",
                "description": "README is very brief. Consider adding more details about usage, installation, and features.",
                "action": "expand_readme"
            })
        
        if not docs.get("has_license"):
            improvements.append({
                "category": "documentation",
                "priority": "medium",
                "title": "Add LICENSE file",
                "description": "Repository lacks a LICENSE file. Consider adding one to clarify usage rights.",
                "action": "add_license"
            })
        
        if not docs.get("has_contributing"):
            improvements.append({
                "category": "documentation",
                "priority": "low",
                "title": "Add CONTRIBUTING.md",
                "description": "Add a CONTRIBUTING guide to help potential contributors.",
                "action": "add_contributing"
            })
        
        return improvements
    
    def _check_structure(self, analysis: Dict) -> List[Dict]:
        """Check for structural improvements"""
        improvements = []
        structure = analysis.get("structure", {})
        
        if not structure.get("has_tests"):
            improvements.append({
                "category": "structure",
                "priority": "high",
                "title": "Add test directory",
                "description": "No test directory found. Consider adding tests for better code quality.",
                "action": "add_tests_dir"
            })
        
        if not structure.get("has_src"):
            root_files = structure.get("root_files", [])
            # Check if there are code files in root
            code_extensions = [".py", ".js", ".ts", ".java", ".go"]
            has_code_in_root = any(
                any(f.endswith(ext) for ext in code_extensions)
                for f in root_files
            )
            
            if has_code_in_root:
                improvements.append({
                    "category": "structure",
                    "priority": "medium",
                    "title": "Organize code into src directory",
                    "description": "Consider moving source code into a dedicated 'src' directory for better organization.",
                    "action": "organize_src"
                })
        
        return improvements
    
    def _check_best_practices(self, analysis: Dict) -> List[Dict]:
        """Check for best practice improvements"""
        improvements = []
        structure = analysis.get("structure", {})
        root_files = structure.get("root_files", [])
        
        # Check for .gitignore
        if ".gitignore" not in root_files:
            improvements.append({
                "category": "best-practices",
                "priority": "medium",
                "title": "Add .gitignore",
                "description": "Add a .gitignore file to exclude build artifacts and dependencies.",
                "action": "add_gitignore"
            })
        
        # Check for CI/CD
        has_ci = any(f.startswith(".github") or f.startswith(".gitlab") for f in structure.get("root_dirs", []))
        if not has_ci:
            improvements.append({
                "category": "best-practices",
                "priority": "low",
                "title": "Add CI/CD configuration",
                "description": "Consider adding GitHub Actions or other CI/CD for automated testing.",
                "action": "add_ci"
            })
        
        return improvements
