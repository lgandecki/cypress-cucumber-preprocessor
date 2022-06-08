Feature: ambiguous keyword

  Scenario: wrongly keyworded step matching
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { When } = require("@badeball/cypress-cucumber-preprocessor");
      When("a step", function() {});
      """
    When I run cypress
    Then it passes
