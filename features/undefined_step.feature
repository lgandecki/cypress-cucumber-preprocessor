Feature: undefined Steps

  Scenario:
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given an undefined step
      """
    When I run cypress
    Then it fails
    And the output should contain
      """
      Step implementation missing for: an undefined step
      """
