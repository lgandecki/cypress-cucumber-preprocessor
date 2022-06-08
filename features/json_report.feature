Feature: JSON formatter

  Background:
    Given additional preprocessor configuration
      """
      {
        "json": {
          "enabled": true
        }
      }
      """
    And I've ensured cucumber-json-formatter is installed

  Scenario: passed example
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function() {})
      """
    When I run cypress
    Then it passes
    And there should be a JSON output similar to "fixtures/passed-example.json"

  Scenario: passed outline
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario Outline: a scenario
          Given a step
          Examples:
            | value |
            | foo   |
            | bar   |
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function() {})
      """
    When I run cypress
    Then it passes
    And there should be a JSON output similar to "fixtures/passed-outline.json"

  Scenario: multiple features
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/e2e/b.feature" with:
      """
      Feature: another feature
        Scenario: another scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function() {})
      """
    When I run cypress
    Then it passes
    And there should be a JSON output similar to "fixtures/multiple-features.json"

  Scenario: failing step
    Given additional Cypress configuration
      """
      {
        "screenshotOnRunFailure": false
      }
      """
    And a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a failing step
          And another step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a failing step", function() {
        throw "some error"
      })
      Given("another step", function () {})
      """
    When I run cypress
    Then it fails
    And there should be a JSON output similar to "fixtures/failing-step.json"

  Scenario: undefined step
    Given additional Cypress configuration
      """
      {
        "screenshotOnRunFailure": false
      }
      """
    And a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given an undefined step
          And another step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a defined step", function () {})
      """
    When I run cypress
    Then it fails
    And there should be a JSON output similar to "fixtures/undefined-steps.json"

  Scenario: pending step
    Given additional Cypress configuration
      """
      {
        "screenshotOnRunFailure": false
      }
      """
    And a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a pending step
          And another pending step
          And an implemented step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a pending step", function () {
        return "pending";
      });
      Given("another pending step", function () {
        return "pending";
      });
      Given("an implemented step", () => {});
      """
    When I run cypress
    Then it passes
    And there should be a JSON output similar to "fixtures/pending-steps.json"

  Scenario: explicit screenshot
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function () {
        cy.visit("index.html");
        cy.get("div").screenshot();
      });
      """
    And a file named "index.html" with:
      """
      <!DOCTYPE HTML>
      <style>
        div {
          background: red;
          width: 20px;
          height: 20px;
        }
      </style>
      <div />
      """
    When I run cypress
    Then it passes
    And there should be a JSON output similar to "fixtures/attachments/screenshot.json"

  Scenario: screenshot of failed test
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a failing step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a failing step", function() {
        throw "some error"
      })
      """
    When I run cypress
    Then it fails
    And the JSON report should contain an image attachment for what appears to be a screenshot

  Scenario: retried
    Given additional Cypress configuration
      """
      {
        "screenshotOnRunFailure": false,
        "retries": 1
      }
      """
    And a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      let attempt = 0;
      Given("a step", () => {
        if (attempt++ === 0) {
          throw "some error";
        }
      });
      """
    When I run cypress
    Then it passes
    And there should be a JSON output similar to "fixtures/retried.json"
    # And there should be a JSON output similar to "fixtures/passed-example.json"

  Scenario: failing Before hook
    Given additional Cypress configuration
      """
      {
        "screenshotOnRunFailure": false
      }
      """
    And a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Before, Given } = require("@badeball/cypress-cucumber-preprocessor");
      Before(function() {
        throw "some error"
      })
      Given("a step", function() {})
      """
    When I run cypress
    Then it fails
    And there should be a JSON output similar to "fixtures/failing-before.json"

  Scenario: failing After hook
    Given additional Cypress configuration
      """
      {
        "screenshotOnRunFailure": false
      }
      """
    And a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { After, Given } = require("@badeball/cypress-cucumber-preprocessor");
      After(function() {
        throw "some error"
      })
      Given("a step", function() {})
      """
    When I run cypress
    Then it fails
    And there should be a JSON output similar to "fixtures/failing-after.json"

  Scenario: failing before hook
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function() {})
      """
    And a file named "cypress/support/e2e.ts" with:
      """
      before(() => {
        throw "some error"
      });
      """
    When I run cypress
    Then it fails
    And there should be no JSON output
    And the output should contain
      """
      Hook failures can't be represented in JSON reports, thus none is created for cypress/e2e/a.feature.
      """

  Scenario: failing beforeEach hook
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function() {})
      """
    And a file named "cypress/support/e2e.ts" with:
      """
      beforeEach(() => {
        throw "some error"
      });
      """
    When I run cypress
    Then it fails
    And there should be no JSON output
    And the output should contain
      """
      Hook failures can't be represented in JSON reports, thus none is created for cypress/e2e/a.feature.
      """

  Scenario: failing afterEach hook
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function() {})
      """
    And a file named "cypress/support/e2e.ts" with:
      """
      afterEach(() => {
        throw "some error"
      });
      """
    When I run cypress
    Then it fails
    And there should be no JSON output
    And the output should contain
      """
      Hook failures can't be represented in JSON reports, thus none is created for cypress/e2e/a.feature.
      """

  Scenario: failing after hook
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a step
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a step", function() {})
      """
    And a file named "cypress/support/e2e.ts" with:
      """
      after(() => {
        throw "some error"
      });
      """
    When I run cypress
    Then it fails
    And there should be no JSON output
    And the output should contain
      """
      Hook failures can't be represented in JSON reports, thus none is created for cypress/e2e/a.feature.
      """
