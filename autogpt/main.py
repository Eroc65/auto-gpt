"""
Main entry point for Auto-GPT GitHub Agent
"""
import argparse
import sys
from pathlib import Path
from autogpt.agent import GitHubAgent
from autogpt.reporter import ReportGenerator
from autogpt.config import config
from autogpt.logger import logger


def main():
    """Main entry point"""
    parser = argparse.ArgumentParser(
        description="Auto-GPT GitHub Agent - Autonomous AI for repository analysis and improvement"
    )
    
    parser.add_argument(
        "repo_url",
        help="GitHub repository URL to analyze and improve"
    )
    
    parser.add_argument(
        "--implement",
        action="store_true",
        help="Actually implement changes (default: dry run only)"
    )
    
    parser.add_argument(
        "--output",
        default="./output",
        help="Output directory for reports (default: ./output)"
    )
    
    parser.add_argument(
        "--format",
        choices=["markdown", "json"],
        default="markdown",
        help="Report format (default: markdown)"
    )
    
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Enable verbose logging"
    )
    
    args = parser.parse_args()
    
    # Configure verbosity
    if args.verbose:
        config.verbose = True
    
    # Print banner
    print("=" * 70)
    print("Auto-GPT GitHub Agent")
    print("Autonomous AI for Repository Analysis and Improvement")
    print("=" * 70)
    print()
    
    logger.info(f"Starting agent for repository: {args.repo_url}")
    logger.info(f"Implementation mode: {'ENABLED' if args.implement else 'DRY RUN'}")
    
    # Create agent
    agent = GitHubAgent(config)
    
    # Execute agent workflow
    try:
        summary = agent.execute(args.repo_url, implement=args.implement)
        
        if "error" in summary:
            logger.error(f"Agent execution failed: {summary['error']}")
            sys.exit(1)
        
        # Generate report
        reporter = ReportGenerator(args.output)
        report_path = reporter.generate_report(summary, format=args.format)
        
        logger.info(f"Report generated: {report_path}")
        
        # Generate changelog if changes were implemented
        if args.implement and summary.get('implemented'):
            changelog_path = reporter.generate_changelog(summary['implemented'])
            logger.info(f"Changelog generated: {changelog_path}")
        
        # Print summary
        print()
        print("=" * 70)
        print("EXECUTION SUMMARY")
        print("=" * 70)
        print(f"Repository: {summary.get('repository')}")
        print(f"Improvements proposed: {summary.get('improvements_proposed', 0)}")
        print(f"Improvements implemented: {summary.get('improvements_implemented', 0)}")
        print(f"Report: {report_path}")
        print("=" * 70)
        
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
