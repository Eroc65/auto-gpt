"""
Basic tests for Auto-GPT GitHub Agent
"""
import unittest
from pathlib import Path
from autogpt.analyzer import RepositoryAnalyzer
from autogpt.proposer import ImprovementProposer


class TestRepositoryAnalyzer(unittest.TestCase):
    """Test the RepositoryAnalyzer class"""
    
    def setUp(self):
        self.analyzer = RepositoryAnalyzer()
    
    def test_language_indicators(self):
        """Test that language indicators are properly defined"""
        self.assertIn(".py", self.analyzer.language_indicators)
        self.assertEqual(self.analyzer.language_indicators[".py"], "Python")
    
    def test_common_config_files(self):
        """Test that common config files are defined"""
        self.assertIn("README.md", self.analyzer.common_config_files)
        self.assertIn("package.json", self.analyzer.common_config_files)


class TestImprovementProposer(unittest.TestCase):
    """Test the ImprovementProposer class"""
    
    def setUp(self):
        self.proposer = ImprovementProposer()
    
    def test_propose_improvements_no_readme(self):
        """Test that missing README is detected"""
        analysis = {
            "documentation": {
                "has_readme": False,
                "has_license": True,
                "has_contributing": True
            },
            "structure": {
                "has_tests": True
            }
        }
        
        improvements = self.proposer.propose_improvements(analysis)
        
        # Should propose adding README
        readme_improvements = [i for i in improvements if i["action"] == "create_readme"]
        self.assertEqual(len(readme_improvements), 1)
        self.assertEqual(readme_improvements[0]["priority"], "high")
    
    def test_propose_improvements_no_tests(self):
        """Test that missing tests are detected"""
        analysis = {
            "documentation": {
                "has_readme": True,
                "has_license": True,
                "has_contributing": True
            },
            "structure": {
                "has_tests": False
            }
        }
        
        improvements = self.proposer.propose_improvements(analysis)
        
        # Should propose adding tests
        test_improvements = [i for i in improvements if i["action"] == "add_tests_dir"]
        self.assertEqual(len(test_improvements), 1)
        self.assertEqual(test_improvements[0]["priority"], "high")


if __name__ == '__main__':
    unittest.main()
