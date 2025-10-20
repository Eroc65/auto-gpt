"""
Core autonomous agent with goal-setting and task execution
"""
from pathlib import Path
from typing import Dict, List, Optional
from autogpt.cloner import RepositoryCloner
from autogpt.analyzer import RepositoryAnalyzer
from autogpt.proposer import ImprovementProposer
from autogpt.implementer import ImprovementImplementer
from autogpt.logger import logger


class GitHubAgent:
    """
    Autonomous AI agent for analyzing and improving GitHub repositories
    
    Capabilities:
    - Set and pursue goals without prompting
    - Break down tasks and execute
    - Use tools (clone, analyze, propose, implement)
    - Reflect and iterate
    - Chain thoughts across steps
    """
    
    def __init__(self, config=None):
        self.config = config
        self.cloner = RepositoryCloner()
        self.analyzer = RepositoryAnalyzer()
        self.proposer = ImprovementProposer()
        self.repo_path: Optional[Path] = None
        self.analysis: Optional[Dict] = None
        self.improvements: List[Dict] = []
        self.implemented: List[Dict] = []
        self.reasoning_log: List[str] = []
    
    def log_reasoning(self, message: str):
        """Log agent's reasoning process"""
        self.reasoning_log.append(message)
        logger.info(f"[REASONING] {message}")
    
    def set_goal(self, repo_url: str):
        """
        Autonomous goal setting: analyze and improve a repository
        
        Args:
            repo_url: GitHub repository URL to work on
        """
        self.log_reasoning(f"Goal set: Analyze and improve repository at {repo_url}")
        self.log_reasoning("Breaking down into subtasks:")
        self.log_reasoning("1. Clone repository")
        self.log_reasoning("2. Analyze structure and purpose")
        self.log_reasoning("3. Propose improvements")
        self.log_reasoning("4. Implement improvements")
        self.log_reasoning("5. Generate report")
    
    def execute_task_clone(self, repo_url: str) -> bool:
        """
        Task 1: Clone repository
        
        Args:
            repo_url: GitHub repository URL
            
        Returns:
            True if successful
        """
        self.log_reasoning("Executing task: Clone repository")
        
        self.repo_path = self.cloner.clone(repo_url, depth=1)
        
        if self.repo_path:
            self.log_reasoning(f"Successfully cloned to {self.repo_path}")
            return True
        else:
            self.log_reasoning("Failed to clone repository")
            return False
    
    def execute_task_analyze(self) -> bool:
        """
        Task 2: Analyze repository
        
        Returns:
            True if successful
        """
        if not self.repo_path:
            self.log_reasoning("Cannot analyze: no repository cloned")
            return False
        
        self.log_reasoning("Executing task: Analyze repository structure and purpose")
        
        self.analysis = self.analyzer.analyze(self.repo_path)
        
        # Log analysis insights
        structure = self.analysis.get("structure", {})
        purpose = self.analysis.get("purpose", {})
        tech = self.analysis.get("technologies", {})
        
        self.log_reasoning(f"Identified project type: {purpose.get('type', 'unknown')}")
        self.log_reasoning(f"Languages detected: {list(tech.get('languages', {}).keys())}")
        self.log_reasoning(f"Has tests: {structure.get('has_tests', False)}")
        self.log_reasoning(f"Has documentation: {structure.get('has_docs', False)}")
        
        return True
    
    def execute_task_propose(self) -> bool:
        """
        Task 3: Propose improvements
        
        Returns:
            True if successful
        """
        if not self.analysis:
            self.log_reasoning("Cannot propose improvements: no analysis available")
            return False
        
        self.log_reasoning("Executing task: Propose improvements")
        
        self.improvements = self.proposer.propose_improvements(self.analysis)
        
        self.log_reasoning(f"Identified {len(self.improvements)} potential improvements")
        
        # Log improvements by priority
        high_priority = [i for i in self.improvements if i.get("priority") == "high"]
        medium_priority = [i for i in self.improvements if i.get("priority") == "medium"]
        low_priority = [i for i in self.improvements if i.get("priority") == "low"]
        
        self.log_reasoning(f"High priority: {len(high_priority)}")
        self.log_reasoning(f"Medium priority: {len(medium_priority)}")
        self.log_reasoning(f"Low priority: {len(low_priority)}")
        
        return True
    
    def execute_task_implement(self, dry_run: bool = False) -> bool:
        """
        Task 4: Implement improvements
        
        Args:
            dry_run: If True, only simulate implementation
            
        Returns:
            True if successful
        """
        if not self.improvements:
            self.log_reasoning("No improvements to implement")
            return False
        
        self.log_reasoning(f"Executing task: Implement improvements (dry_run={dry_run})")
        
        implementer = ImprovementImplementer(self.repo_path)
        
        # Implement high priority items first
        for improvement in sorted(self.improvements, 
                                 key=lambda x: {"high": 0, "medium": 1, "low": 2}.get(x.get("priority", "low"), 3)):
            
            self.log_reasoning(f"Implementing: {improvement['title']}")
            
            success = implementer.implement(improvement, dry_run=dry_run)
            
            if success:
                self.implemented.append(improvement)
                self.log_reasoning(f"Successfully implemented: {improvement['title']}")
            else:
                self.log_reasoning(f"Skipped or failed: {improvement['title']}")
        
        self.log_reasoning(f"Implemented {len(self.implemented)} out of {len(self.improvements)} improvements")
        
        return True
    
    def execute(self, repo_url: str, implement: bool = False) -> Dict:
        """
        Execute the full agent workflow
        
        Args:
            repo_url: GitHub repository URL
            implement: Whether to actually implement changes (False for dry run)
            
        Returns:
            Summary dictionary
        """
        self.log_reasoning("Starting autonomous agent execution")
        
        # Set goal
        self.set_goal(repo_url)
        
        # Execute tasks
        if not self.execute_task_clone(repo_url):
            return {"error": "Failed to clone repository"}
        
        if not self.execute_task_analyze():
            return {"error": "Failed to analyze repository"}
        
        if not self.execute_task_propose():
            return {"error": "Failed to propose improvements"}
        
        self.execute_task_implement(dry_run=not implement)
        
        # Generate summary
        summary = self.generate_summary()
        
        self.log_reasoning("Agent execution completed")
        
        return summary
    
    def generate_summary(self) -> Dict:
        """
        Generate execution summary
        
        Returns:
            Summary dictionary
        """
        return {
            "repository": str(self.repo_path) if self.repo_path else None,
            "analysis": self.analysis,
            "improvements_proposed": len(self.improvements),
            "improvements_implemented": len(self.implemented),
            "improvements": self.improvements,
            "implemented": self.implemented,
            "reasoning_log": self.reasoning_log
        }
