Feature: Tags Scenario Outline

  I should be able to pass ~@tagName to ignore Scenario Outline

  Background:
    Given I pass the CLI option '--tags ~@ignore'

  @ignore
  Scenario Outline: Scenario
    Then this step marks the '@ignore' as done
  Examples:
    | v |
    | 1 |
    | 2 |
  
  Scenario: Validate Tags for Scenario Outline
    Then the '@ignore' scenario should NOT have been run

  Scenario: Clear the state
    Then clear the state