# https://github.com/badeball/cypress-cucumber-preprocessor/issues/908

Feature: hide internals from cypress environment
  Scenario:
    And a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: hide internal state by default
          * the internal state should not be visible

        @reportInternalCucumberState
        Scenario: expose internal state with tag
          * the internal state should be visible
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Then } = require("@badeball/cypress-cucumber-preprocessor");
      const { INTERNAL_SPEC_PROPERTIES } = require("@badeball/cypress-cucumber-preprocessor/lib/constants");

      Then("the internal state should not be visible", () => {
        const serializedProperties = JSON.stringify(Cypress.env(INTERNAL_SPEC_PROPERTIES));

        expect(serializedProperties).to.be.undefined;
      });

      Then("the internal state should be visible", () => {
        const serializedProperties = JSON.stringify(Cypress.env(INTERNAL_SPEC_PROPERTIES));

        expect(serializedProperties).not.to.be.undefined;
      });
      """
    When I run cypress
    Then it passes
