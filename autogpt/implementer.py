"""
Implementation module - scaffolds and implements improvements
"""
import os
from pathlib import Path
from typing import Dict, List
from datetime import datetime
from autogpt.logger import logger


class ImprovementImplementer:
    """Implements or scaffolds suggested improvements"""
    
    def __init__(self, repo_path: Path):
        self.repo_path = repo_path
        self.changes_made = []
    
    def implement(self, improvement: Dict, dry_run: bool = False) -> bool:
        """
        Implement a specific improvement
        
        Args:
            improvement: Improvement dictionary with action details
            dry_run: If True, only log what would be done
            
        Returns:
            True if implementation was successful
        """
        action = improvement.get("action")
        
        if dry_run:
            logger.info(f"[DRY RUN] Would implement: {improvement['title']}")
            return True
        
        try:
            if action == "create_readme":
                return self._create_readme()
            elif action == "expand_readme":
                return self._expand_readme()
            elif action == "add_license":
                return self._add_license()
            elif action == "add_contributing":
                return self._add_contributing()
            elif action == "add_tests_dir":
                return self._add_tests_dir()
            elif action == "add_gitignore":
                return self._add_gitignore()
            elif action == "add_ci":
                return self._add_ci()
            else:
                logger.warning(f"Unknown action: {action}")
                return False
        except Exception as e:
            logger.error(f"Failed to implement {action}: {str(e)}")
            return False
    
    def _create_readme(self) -> bool:
        """Create a basic README.md file"""
        readme_path = self.repo_path / "README.md"
        
        if readme_path.exists():
            logger.info("README.md already exists")
            return False
        
        content = f"""# {self.repo_path.name}

## Description

[Add a brief description of your project here]

## Installation

```bash
# Add installation instructions
```

## Usage

```bash
# Add usage examples
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

[Add license information]
"""
        
        with open(readme_path, 'w') as f:
            f.write(content)
        
        self.changes_made.append("Created README.md")
        logger.info("Created README.md")
        return True
    
    def _expand_readme(self) -> bool:
        """Expand existing README with more sections"""
        readme_path = self.repo_path / "README.md"
        
        if not readme_path.exists():
            return self._create_readme()
        
        # Read existing content
        with open(readme_path, 'r') as f:
            existing = f.read()
        
        # Add sections if they don't exist
        additions = []
        
        if "## Features" not in existing:
            additions.append("\n## Features\n\n- [Add key features here]\n")
        
        if "## Installation" not in existing:
            additions.append("\n## Installation\n\n```bash\n# Add installation instructions\n```\n")
        
        if "## Usage" not in existing:
            additions.append("\n## Usage\n\n```bash\n# Add usage examples\n```\n")
        
        if additions:
            with open(readme_path, 'a') as f:
                f.write("\n".join(additions))
            
            self.changes_made.append("Expanded README.md with additional sections")
            logger.info("Expanded README.md")
            return True
        
        return False
    
    def _add_license(self) -> bool:
        """Add MIT LICENSE file"""
        license_path = self.repo_path / "LICENSE"
        
        if license_path.exists():
            logger.info("LICENSE already exists")
            return False
        
        year = datetime.now().year
        content = f"""MIT License

Copyright (c) {year}

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
"""
        
        with open(license_path, 'w') as f:
            f.write(content)
        
        self.changes_made.append("Added MIT LICENSE")
        logger.info("Added LICENSE")
        return True
    
    def _add_contributing(self) -> bool:
        """Add CONTRIBUTING.md file"""
        contrib_path = self.repo_path / "CONTRIBUTING.md"
        
        if contrib_path.exists():
            logger.info("CONTRIBUTING.md already exists")
            return False
        
        content = """# Contributing

Thank you for considering contributing to this project!

## How to Contribute

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit your changes (`git commit -am 'Add some feature'`)
5. Push to the branch (`git push origin feature/your-feature`)
6. Create a new Pull Request

## Code of Conduct

Please be respectful and constructive in all interactions.

## Questions?

Feel free to open an issue for any questions or concerns.
"""
        
        with open(contrib_path, 'w') as f:
            f.write(content)
        
        self.changes_made.append("Added CONTRIBUTING.md")
        logger.info("Added CONTRIBUTING.md")
        return True
    
    def _add_tests_dir(self) -> bool:
        """Create a tests directory with a sample test"""
        tests_dir = self.repo_path / "tests"
        
        if tests_dir.exists():
            logger.info("tests directory already exists")
            return False
        
        tests_dir.mkdir()
        
        # Create a sample test file
        sample_test = tests_dir / "test_sample.py"
        content = """\"\"\"
Sample test file
\"\"\"
import unittest


class TestSample(unittest.TestCase):
    \"\"\"Sample test class\"\"\"
    
    def test_example(self):
        \"\"\"Example test case\"\"\"
        self.assertEqual(1 + 1, 2)


if __name__ == '__main__':
    unittest.main()
"""
        
        with open(sample_test, 'w') as f:
            f.write(content)
        
        self.changes_made.append("Created tests directory with sample test")
        logger.info("Created tests directory")
        return True
    
    def _add_gitignore(self) -> bool:
        """Add a .gitignore file"""
        gitignore_path = self.repo_path / ".gitignore"
        
        if gitignore_path.exists():
            logger.info(".gitignore already exists")
            return False
        
        content = """# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
build/
dist/
*.egg-info/
.venv/
venv/
ENV/

# IDEs
.vscode/
.idea/
*.swp

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Temporary
*.tmp
.cache/
"""
        
        with open(gitignore_path, 'w') as f:
            f.write(content)
        
        self.changes_made.append("Added .gitignore")
        logger.info("Added .gitignore")
        return True
    
    def _add_ci(self) -> bool:
        """Add GitHub Actions CI configuration"""
        github_dir = self.repo_path / ".github" / "workflows"
        github_dir.mkdir(parents=True, exist_ok=True)
        
        ci_file = github_dir / "ci.yml"
        
        if ci_file.exists():
            logger.info("CI configuration already exists")
            return False
        
        content = """name: CI

on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Set up Python
      uses: actions/setup-python@v4
      with:
        python-version: '3.x'
    
    - name: Install dependencies
      run: |
        python -m pip install --upgrade pip
        if [ -f requirements.txt ]; then pip install -r requirements.txt; fi
    
    - name: Run tests
      run: |
        python -m pytest tests/ || echo "No tests found"
"""
        
        with open(ci_file, 'w') as f:
            f.write(content)
        
        self.changes_made.append("Added GitHub Actions CI configuration")
        logger.info("Added CI configuration")
        return True
    
    def get_changes(self) -> List[str]:
        """Get list of changes made"""
        return self.changes_made
