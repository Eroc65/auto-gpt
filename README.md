# Auto-GPT GitHub Agent

Auto-GPT is an experimental open-source framework that transforms large language models like GPT into autonomous agents capable of self-directed reasoning, recursive goal execution, and dynamic tool use. Unlike traditional chat interfaces, this GitHub Agent autonomously analyzes and improves repositories.

## Features

- **Autonomous Goal Setting**: The agent sets and pursues goals without prompting
- **Task Breakdown**: Automatically breaks down complex tasks into executable steps
- **Repository Analysis**: Identifies purpose, structure, and technologies
- **Improvement Proposals**: Suggests improvements based on best practices
- **Change Implementation**: Scaffolds and implements improvements automatically
- **Comprehensive Logging**: Logs all reasoning and actions for transparency
- **Detailed Reports**: Generates markdown and JSON reports with changelogs

## Installation

```bash
# Clone the repository
git clone https://github.com/Eroc65/auto-gpt.git
cd auto-gpt

# Install dependencies
pip install -r requirements.txt

# Or install as a package
pip install -e .
```

## Quick Start

### Command Line Interface

```bash
# Analyze a repository (dry run - no changes made)
python -m autogpt.main https://github.com/username/repo

# Analyze and implement improvements
python -m autogpt.main https://github.com/username/repo --implement

# Specify output directory
python -m autogpt.main https://github.com/username/repo --output ./results

# Generate JSON report instead of markdown
python -m autogpt.main https://github.com/username/repo --format json

# Enable verbose logging
python -m autogpt.main https://github.com/username/repo --verbose
```

### Python API

```python
from autogpt.agent import GitHubAgent
from autogpt.reporter import ReportGenerator

# Create agent
agent = GitHubAgent()

# Execute full workflow (dry run)
summary = agent.execute("https://github.com/username/repo", implement=False)

# Generate report
reporter = ReportGenerator()
report_path = reporter.generate_report(summary)

print(f"Report: {report_path}")
print(f"Improvements proposed: {summary['improvements_proposed']}")
```

## Capabilities

### 1. Repository Cloning
- Clones GitHub repositories efficiently
- Supports shallow cloning for faster operations

### 2. Structure Analysis
- Identifies project type (library, application, CLI tool, etc.)
- Detects programming languages and frameworks
- Analyzes directory organization
- Identifies entry points and main files

### 3. Documentation Analysis
- Checks for README, LICENSE, and CONTRIBUTING files
- Evaluates documentation quality and completeness
- Identifies missing documentation

### 4. Improvement Proposals
The agent proposes improvements in several categories:

**Documentation**
- Add or expand README
- Add LICENSE file
- Add CONTRIBUTING guide

**Structure**
- Add tests directory
- Organize code into src directory
- Improve project organization

**Best Practices**
- Add .gitignore
- Add CI/CD configuration
- Add code quality tools

### 5. Implementation
The agent can implement improvements including:
- Creating README.md with proper structure
- Adding LICENSE (MIT by default)
- Creating CONTRIBUTING.md
- Setting up test directory with sample tests
- Adding .gitignore with common patterns
- Configuring GitHub Actions CI

## Architecture

```
autogpt/
├── __init__.py          # Package initialization
├── agent.py             # Core autonomous agent
├── analyzer.py          # Repository analyzer
├── cloner.py            # Repository cloner
├── config.py            # Configuration management
├── implementer.py       # Change implementation
├── logger.py            # Logging utilities
├── main.py              # CLI entry point
├── proposer.py          # Improvement proposer
└── reporter.py          # Report generation
```

## Configuration

Create a `.env` file in the project root:

```env
# Optional: OpenAI API key for enhanced analysis
OPENAI_API_KEY=your_key_here

# Optional: GitHub token for private repos
GITHUB_TOKEN=your_token_here

# Agent settings
MAX_ITERATIONS=10
VERBOSE=true

# Output settings
OUTPUT_DIR=./output
```

## Output

The agent generates several outputs:

### 1. Summary Report
Contains:
- Repository information
- Analysis results
- Proposed improvements (categorized by priority)
- Implemented changes
- Agent reasoning log

### 2. Changelog
Lists all changes made to the repository (when `--implement` is used)

### 3. Logs
Detailed logs of all agent actions and decisions

## Examples

See `examples.py` for more detailed usage examples:

```bash
python examples.py
```

## How It Works

1. **Goal Setting**: Agent autonomously sets the goal to analyze and improve the repository
2. **Task Breakdown**: Breaks down the goal into subtasks (clone, analyze, propose, implement)
3. **Execution**: Executes each task sequentially, logging reasoning
4. **Reflection**: Reflects on results and adjusts approach
5. **Iteration**: Can iterate multiple times to refine improvements
6. **Reporting**: Generates comprehensive reports of findings and changes

## Development

```bash
# Run in development mode
pip install -e .

# The package will be available as:
autogpt-github

# Or run directly:
python -m autogpt.main <repo-url>
```

## License

MIT License - See LICENSE file for details

## Contributing

Contributions are welcome! Please see CONTRIBUTING.md for guidelines.

## Roadmap

- [ ] Integration with OpenAI for enhanced analysis
- [ ] Support for more programming languages
- [ ] Custom improvement rules
- [ ] Interactive mode for user feedback
- [ ] Git commit and PR creation
- [ ] Support for multiple repositories in batch

## Disclaimer

This is an experimental tool. Always review changes before accepting them. Use dry-run mode first to see what changes would be made.
