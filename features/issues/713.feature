# https://github.com/badeball/cypress-cucumber-preprocessor/issues/713

Feature: returning chains
  Scenario: returning a chain
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", () => cy.log("foo"))
      """
    When I run cypress
    Then it passes
