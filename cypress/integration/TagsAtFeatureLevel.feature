Feature: Tags at Feature Level

  I should be able to set tags at the top of my feature file
  
  Scenario: Tag at feature level
    Given I pass the CLI option '--tags ~@ignore'
    And I have a feature file like this:
    """
    @ignore
    Feature: Tags at feature level
    
      Scenario: A scenario that has NOT been tagged @ignore
        Then this step marks the internal '@ignore' as done
    """
    When I parse and run the feature file
    Then the internal '@ignore' scenario should NOT have been run