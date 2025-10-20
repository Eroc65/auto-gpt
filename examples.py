"""
Example usage of Auto-GPT GitHub Agent
"""
from autogpt.agent import GitHubAgent
from autogpt.reporter import ReportGenerator


def example_basic():
    """Basic example: analyze a repository"""
    print("Example 1: Basic Analysis (Dry Run)")
    print("-" * 50)
    
    # Create agent
    agent = GitHubAgent()
    
    # Execute on a sample repository (dry run)
    summary = agent.execute(
        "https://github.com/example/sample-repo",
        implement=False  # Dry run only
    )
    
    # Generate report
    reporter = ReportGenerator()
    report_path = reporter.generate_report(summary)
    
    print(f"Report generated: {report_path}")
    print(f"Improvements proposed: {summary['improvements_proposed']}")


def example_with_implementation():
    """Example with actual implementation"""
    print("\nExample 2: Analysis with Implementation")
    print("-" * 50)
    
    # Create agent
    agent = GitHubAgent()
    
    # Execute and implement changes
    summary = agent.execute(
        "https://github.com/example/sample-repo",
        implement=True  # Actually implement changes
    )
    
    # Generate report and changelog
    reporter = ReportGenerator()
    report_path = reporter.generate_report(summary)
    
    if summary.get('implemented'):
        changelog_path = reporter.generate_changelog(summary['implemented'])
        print(f"Changelog: {changelog_path}")
    
    print(f"Report: {report_path}")
    print(f"Implemented: {summary['improvements_implemented']} changes")


def example_step_by_step():
    """Example with step-by-step control"""
    print("\nExample 3: Step-by-Step Control")
    print("-" * 50)
    
    # Create agent
    agent = GitHubAgent()
    
    # Set goal
    agent.set_goal("https://github.com/example/sample-repo")
    
    # Execute tasks individually
    if agent.execute_task_clone("https://github.com/example/sample-repo"):
        print("✓ Repository cloned")
    
    if agent.execute_task_analyze():
        print("✓ Analysis complete")
        print(f"  Project type: {agent.analysis['purpose']['type']}")
    
    if agent.execute_task_propose():
        print("✓ Improvements proposed")
        print(f"  Count: {len(agent.improvements)}")
    
    # Review improvements before implementing
    print("\nProposed improvements:")
    for i, improvement in enumerate(agent.improvements, 1):
        print(f"  {i}. [{improvement['priority']}] {improvement['title']}")
    
    # Implement
    agent.execute_task_implement(dry_run=True)
    print(f"\n✓ Dry run complete")


if __name__ == "__main__":
    print("Auto-GPT GitHub Agent - Examples")
    print("=" * 50)
    
    # Run examples
    # example_basic()
    # example_with_implementation()
    # example_step_by_step()
    
    print("\nNote: Uncomment examples to run them")
    print("Make sure to replace 'example/sample-repo' with a real repository")
