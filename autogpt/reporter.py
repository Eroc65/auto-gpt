"""
Report generator for agent output
"""
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List
from autogpt.logger import logger


class ReportGenerator:
    """Generates reports and changelog for agent execution"""
    
    def __init__(self, output_dir: str = "./output"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
    
    def generate_report(self, summary: Dict, format: str = "markdown") -> str:
        """
        Generate a report from agent summary
        
        Args:
            summary: Agent execution summary
            format: Output format ("markdown" or "json")
            
        Returns:
            Path to generated report
        """
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        if format == "json":
            return self._generate_json_report(summary, timestamp)
        else:
            return self._generate_markdown_report(summary, timestamp)
    
    def _generate_markdown_report(self, summary: Dict, timestamp: str) -> str:
        """Generate markdown report"""
        report_path = self.output_dir / f"report_{timestamp}.md"
        
        with open(report_path, 'w') as f:
            f.write("# Auto-GPT GitHub Agent Report\n\n")
            f.write(f"**Generated:** {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            # Repository info
            f.write("## Repository\n\n")
            f.write(f"**Path:** {summary.get('repository', 'N/A')}\n\n")
            
            # Analysis
            f.write("## Analysis Summary\n\n")
            analysis = summary.get('analysis', {})
            
            # Purpose
            purpose = analysis.get('purpose', {})
            f.write(f"**Type:** {purpose.get('type', 'unknown')}\n\n")
            
            # Structure
            structure = analysis.get('structure', {})
            f.write("**Structure:**\n")
            f.write(f"- Has tests: {structure.get('has_tests', False)}\n")
            f.write(f"- Has documentation: {structure.get('has_docs', False)}\n")
            f.write(f"- Has src directory: {structure.get('has_src', False)}\n\n")
            
            # Technologies
            tech = analysis.get('technologies', {})
            languages = tech.get('languages', {})
            if languages:
                f.write("**Languages:**\n")
                for lang, count in sorted(languages.items(), key=lambda x: x[1], reverse=True):
                    f.write(f"- {lang}: {count} files\n")
                f.write("\n")
            
            # Documentation
            docs = analysis.get('documentation', {})
            f.write("**Documentation:**\n")
            f.write(f"- README: {docs.get('has_readme', False)}\n")
            f.write(f"- LICENSE: {docs.get('has_license', False)}\n")
            f.write(f"- CONTRIBUTING: {docs.get('has_contributing', False)}\n\n")
            
            # Improvements
            f.write("## Improvements\n\n")
            f.write(f"**Proposed:** {summary.get('improvements_proposed', 0)}\n")
            f.write(f"**Implemented:** {summary.get('improvements_implemented', 0)}\n\n")
            
            improvements = summary.get('improvements', [])
            if improvements:
                f.write("### Proposed Improvements\n\n")
                
                # Group by priority
                for priority in ['high', 'medium', 'low']:
                    priority_items = [i for i in improvements if i.get('priority') == priority]
                    if priority_items:
                        f.write(f"#### {priority.capitalize()} Priority\n\n")
                        for item in priority_items:
                            f.write(f"**{item['title']}**\n")
                            f.write(f"- Category: {item['category']}\n")
                            f.write(f"- Description: {item['description']}\n")
                            f.write(f"- Action: {item['action']}\n\n")
            
            # Implemented changes
            implemented = summary.get('implemented', [])
            if implemented:
                f.write("### Implemented Changes\n\n")
                for item in implemented:
                    f.write(f"- {item['title']}\n")
                f.write("\n")
            
            # Reasoning log
            reasoning = summary.get('reasoning_log', [])
            if reasoning:
                f.write("## Agent Reasoning Log\n\n")
                for i, entry in enumerate(reasoning, 1):
                    f.write(f"{i}. {entry}\n")
                f.write("\n")
        
        logger.info(f"Generated markdown report: {report_path}")
        return str(report_path)
    
    def _generate_json_report(self, summary: Dict, timestamp: str) -> str:
        """Generate JSON report"""
        report_path = self.output_dir / f"report_{timestamp}.json"
        
        with open(report_path, 'w') as f:
            json.dump(summary, f, indent=2)
        
        logger.info(f"Generated JSON report: {report_path}")
        return str(report_path)
    
    def generate_changelog(self, implemented: List[Dict], timestamp: str = None) -> str:
        """
        Generate a changelog file
        
        Args:
            implemented: List of implemented improvements
            timestamp: Optional timestamp for filename
            
        Returns:
            Path to changelog file
        """
        if not timestamp:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        changelog_path = self.output_dir / f"CHANGELOG_{timestamp}.md"
        
        with open(changelog_path, 'w') as f:
            f.write("# Changelog\n\n")
            f.write(f"## {datetime.now().strftime('%Y-%m-%d')}\n\n")
            f.write("### Added\n\n")
            
            for item in implemented:
                f.write(f"- {item['title']}: {item['description']}\n")
        
        logger.info(f"Generated changelog: {changelog_path}")
        return str(changelog_path)
