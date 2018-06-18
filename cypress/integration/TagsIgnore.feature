Feature: Tags Ignore

  I should be able to pass ~@tagName to ignore scenario tagged with that tag

  Background:
    Given I pass the CLI option '--tags ~@ignore'

  @ignore
  Scenario: Scenario tagged as @ignore
    Then this step marks the '@ignore' as done

  # this is a code smell because scenarios should be able to be run in isolation... but anyway...
  Scenario: Validate scenario tagged as @ignore
    Then the '@ignore' scenario should NOT have been run