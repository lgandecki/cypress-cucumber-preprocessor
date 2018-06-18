Feature: Tags Examples

  @ignore
  Scenario: Scenario tagged as @ignore
    Then the '@ignore' scenario was run

  @smoke-tests
  Scenario: Scenario tagged as @ignore
    Then the 'smoke-tests' scenario was run

  @foo @bar
  Scenario: Scenario tagged as @foo and @bar
    Then the 'foo' / 'bar' scenario was run