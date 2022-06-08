Feature: custom parameter type
  Scenario: definition after usage
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step in blue
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given, defineParameterType } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step in {color}", function(color) {});
      defineParameterType({
        name: "color",
        regexp: /red|yellow|blue/,
        transformer(color) {
          return color;
        }
      });
      """
    When I run cypress
    Then it passes
