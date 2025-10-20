from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

setup(
    name="auto-gpt-github-agent",
    version="0.1.0",
    author="Auto-GPT Team",
    description="An autonomous AI agent for analyzing and improving GitHub repositories",
    long_description=long_description,
    long_description_content_type="text/markdown",
    packages=find_packages(),
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
    install_requires=[
        "gitpython>=3.1.40",
        "openai>=1.3.0",
        "python-dotenv>=1.0.0",
        "requests>=2.31.0",
        "pathspec>=0.11.2",
    ],
    entry_points={
        "console_scripts": [
            "autogpt-github=autogpt.main:main",
        ],
    },
)
