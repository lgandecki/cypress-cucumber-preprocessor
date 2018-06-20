Feature: Tags Scenario Outline

  I should be able to pass ~@tagName to ignore Scenario Outline

  Background:
    Given I pass the CLI option '--tags ~@ignore'

  @ignore
  Scenario Outline: Scenario
    Then this step marks the 'scenario outline' as done
  Examples:
    | v |
    | 1 |
    | 2 |
  
  Scenario: Validate Tags for Scenario Outline
    Then the 'scenario outline' scenario should NOT have been run

  Scenario Outline: Scenario
    Then this step marks the '<scenario>' as done
  
    @ignore
    Examples:
      | scenario      |
      | to-be-ignored |
    
    @do-not-ignore
    Examples:
      | scenario      |
      | do-not-ignore |
  
  Scenario: Validate Tags for Scenario Outline Examples
    Then the 'to-be-ignored' scenario should NOT have been run
    And the 'do-not-ignore' scenario SHOULD have run

  Scenario: Clear the state
    Then clear the state