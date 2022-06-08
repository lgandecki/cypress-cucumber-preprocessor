Feature:  unambiguous step definitions

  Scenario: step matching two definitions
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function() {});
      Given(/a step/, function() {});
      """
    When I run cypress
    Then it fails
    And the output should contain
      """
      Error: Multiple matching step definitions for: a step
       a step
       /a step/
      """
