# Contributing to Auto-GPT

Thank you for your interest in contributing to Auto-GPT! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/auto-gpt.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Set up the development environment:
   ```bash
   cd auto-gpt
   pip install -e ".[dev]"
   ```

## Development Guidelines

### Code Style

- Follow PEP 8 guidelines
- Use type hints for function signatures
- Write docstrings for all public classes and methods
- Format code with `black`: `black autogpt/`
- Run linter: `flake8 autogpt/`
- Type check: `mypy autogpt/`

### Testing

- Write tests for all new functionality
- Ensure all tests pass: `pytest`
- Aim for high test coverage: `pytest --cov=autogpt`
- Test files should mirror the source structure in the `tests/` directory

### Commit Messages

- Use clear, descriptive commit messages
- Follow the format: `type: description`
- Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`
- Example: `feat: add web search tool`

### Pull Requests

1. Update your branch with the latest main:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. Ensure all tests pass and code is formatted

3. Create a pull request with:
   - Clear title describing the change
   - Description of what changed and why
   - Link to any related issues
   - Screenshots for UI changes (if applicable)

4. Be responsive to review feedback

## What to Contribute

### Bug Fixes

- Check existing issues first
- Create an issue if one doesn't exist
- Reference the issue in your PR

### New Features

- Discuss major features in an issue first
- Keep features focused and modular
- Include tests and documentation
- Update README if needed

### Documentation

- Fix typos and clarify existing docs
- Add examples and tutorials
- Improve API documentation
- Add inline code comments where helpful

### Tests

- Improve test coverage
- Add edge case tests
- Add integration tests

## Areas for Contribution

We welcome contributions in these areas:

- **New Tools**: Add tools for web browsing, file operations, API calls, etc.
- **Reasoning Algorithms**: Improve the agent's decision-making
- **Memory Systems**: Enhanced memory with vector storage, persistence
- **LLM Integration**: Connect with various LLM providers
- **Performance**: Optimize execution speed and resource usage
- **Documentation**: Examples, tutorials, API docs
- **Testing**: Increase coverage, add integration tests

## Code Review Process

1. Maintainers will review your PR
2. Address any feedback or questions
3. Once approved, your PR will be merged
4. Your contribution will be acknowledged

## Community

- Be respectful and inclusive
- Help others in issues and discussions
- Share your use cases and feedback

## Questions?

- Open an issue for bugs or feature requests
- Use discussions for questions and ideas
- Check existing issues and discussions first

Thank you for contributing to Auto-GPT!
