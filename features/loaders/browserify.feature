@no-default-plugin
Feature: browserify + typescript
  Scenario:
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    And a file named "cypress/plugins/index.ts" with:
      """
      import browserify from "@cypress/browserify-preprocessor";
      import { preprocessor } from "@badeball/cypress-cucumber-preprocessor/browserify";

      export default (
        on: Cypress.PluginEvents,
        config: Cypress.PluginConfigOptions
      ): void => {
        on(
          "file:preprocessor",
          preprocessor(config, {
            ...browserify.defaultOptions,
            typescript: require.resolve("typescript")
          })
        );
      };
      """
    And a file named "cypress/support/step_definitions/steps.ts" with:
      """
      import { Given } from "@badeball/cypress-cucumber-preprocessor";
      Given("a step", function(this: Mocha.Context) {});
      """
    When I run cypress
    Then it passes
