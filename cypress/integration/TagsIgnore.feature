Feature: Tags Ignore

  I should be able to pass ~@tagName to ignore scenario tagged with that tag

  Background:
    Given I pass the CLI option '--tags ~@ignore'

  @ignore
  Scenario: Scenario tagged as @ignore
    Then this step marks the '@ignore' as done

  Scenario: Validate scenario tagged as @ignore
    Then the '@ignore' scenario should NOT have been run

  Scenario: Clear the state
    Then clear the state