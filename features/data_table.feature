Feature: data tables

  Scenario: raw
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Cucumber     | Cucumis sativus |
            | Burr Gherkin | Cucumis anguria |
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a table step", function(table) {
        const expected = [
          ["Cucumber", "Cucumis sativus"],
          ["Burr Gherkin", "Cucumis anguria"]
        ];
        expect(table.raw()).to.deep.equal(expected);
      });
      """
    When I run cypress
    Then it passes

  Scenario: rows
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Vegetable | Rating |
            | Apricot   | 5      |
            | Brocolli  | 2      |
            | Cucumber  | 10     |
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a table step", function(table) {
        const expected = [
          ["Apricot", "5"],
          ["Brocolli", "2"],
          ["Cucumber", "10"]
        ];
        expect(table.rows()).to.deep.equal(expected);
      });
      """
    When I run cypress
    Then it passes

  Scenario: rowsHash
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Cucumber     | Cucumis sativus |
            | Burr Gherkin | Cucumis anguria |
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a table step", function(table) {
        const expected = {
          "Cucumber": "Cucumis sativus",
          "Burr Gherkin": "Cucumis anguria"
        };
        expect(table.rowsHash()).to.deep.equal(expected);
      });
      """
    When I run cypress
    Then it passes

  Scenario: hashes
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Vegetable | Rating |
            | Apricot   | 5      |
            | Brocolli  | 2      |
            | Cucumber  | 10     |
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a table step", function(table) {
        const expected = [
          {"Vegetable": "Apricot", "Rating": "5"},
          {"Vegetable": "Brocolli", "Rating": "2"},
          {"Vegetable": "Cucumber", "Rating": "10"}
        ];
        expect(table.hashes()).to.deep.equal(expected);
      });
      """
    When I run cypress
    Then it passes

  Scenario: empty cells
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a table step
            | Vegetable | Rating |
            | Apricot   |        |
            | Brocolli  |        |
            | Cucumber  |        |
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a table step", function(table) {
        const expected = [
          ["Apricot", ""],
          ["Brocolli", ""],
          ["Cucumber", ""]
        ];
        expect(table.rows()).to.deep.equal(expected);
      });
      """
    When I run cypress
    Then it passes
