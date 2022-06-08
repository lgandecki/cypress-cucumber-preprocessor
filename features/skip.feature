Feature: skip

  Scenario: calling skip()
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { When } = require("@badeball/cypress-cucumber-preprocessor");
      When("a step", function() {
        this.skip();
      });
      """
    When I run cypress
    Then it passes
    And it should appear to have skipped the scenario "a scenario name"
