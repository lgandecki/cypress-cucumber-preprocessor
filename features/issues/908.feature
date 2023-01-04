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
      const { inspect } = require('util');
      const { Then } = require("@badeball/cypress-cucumber-preprocessor");
      const { INTERNAL_SPEC_PROPERTIES } = require("@badeball/cypress-cucumber-preprocessor/lib/constants");

      Then("the internal state should not be visible", () => {
        const properties = Cypress.env(INTERNAL_SPEC_PROPERTIES);
        const serializedProperties = JSON.stringify(properties);
        const inspectedProperties = inspect(properties, {depth: 0});

        expect(properties).not.to.be.undefined;
        expect(properties.pickle).to.be.undefined;
        expect(serializedProperties).to.be.undefined;
        expect(inspectedProperties).to.be.equal('{}');
      });

      Then("the internal state should be visible", () => {
        const properties = Cypress.env(INTERNAL_SPEC_PROPERTIES);
        const serializedProperties = JSON.stringify(properties);
        const inspectedProperties = inspect(properties, {depth: 0});

        expect(properties).not.to.be.undefined;
        expect(properties.pickle).not.to.be.undefined;
        expect(serializedProperties).not.to.be.undefined;
        // Must be more than an empty object, cannot test the exact string because
        // it contains random values in a random order.
        expect(inspectedProperties).to.have.length.of.at.least(3);
      });
      """
    When I run cypress
    Then it passes
