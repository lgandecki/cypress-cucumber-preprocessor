Feature: scenario outlines and examples

  Scenario: placeholder in step
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a <value> step
        Examples:
          | value |
          | foo   |
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a foo step", function() {})
      """
    When I run cypress
    Then it passes

  Scenario: placeholder in docstring
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a doc string step
            \"\"\"
            a <value> doc string
            \"\"\"
        Examples:
          | value |
          | foo   |
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a doc string step", function(docString) {
        expect(docString).to.equal("a foo doc string")
      })
      """
    When I run cypress
    Then it passes

  Scenario: placeholder in table
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a table step
            | <value> |
        Examples:
          | value |
          | foo   |
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a table step", function(tableData) {
        expect(tableData.raw()[0][0]).to.equal("foo")
      })
      """
    When I run cypress
    Then it passes
