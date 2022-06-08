Feature: filter spec

  Scenario: 1 / 2 specs matching
    Given additional preprocessor configuration
      """
      {
        "filterSpecs": true
      }
      """
    And a file named "cypress/e2e/a.feature" with:
      """
      @foo
      Feature: some feature
        Scenario: first scenario
          Given a step
      """
    And a file named "cypress/e2e/b.feature" with:
      """
      @bar
      Feature: some other feature
        Scenario: second scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function() {})
      """
    When I run cypress with "--env tags=@foo"
    Then it passes
    And it should appear to not have ran spec "b.feature"
