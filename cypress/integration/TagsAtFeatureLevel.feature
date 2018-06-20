@explicit-tag
Feature: Tags at Feature Level

  I should be able to set tags at the top of my feature file
  
  Background:
    Given I pass the CLI option '--tags @explicit-tag'

  Scenario: Not tagged with @explicit-tag
    Then this step marks the 'not explicitly tagged feature' as done
  
  @explicit-tag
  Scenario: Tagged with @explicit-tag
    Then the 'not explicitly tagged feature' scenario SHOULD have run
    # (because the @explicit-tag at the Feature level should allow everything)