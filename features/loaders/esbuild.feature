@no-default-plugin
Feature: esbuild + typescript
  Scenario:
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature name
        Scenario: a scenario name
          Given a step
      """
    And a file named "cypress/plugins/index.ts" with:
      """
      import createBundler from "@bahmutov/cypress-esbuild-preprocessor";
      import { createEsbuildPlugin } from "@badeball/cypress-cucumber-preprocessor/esbuild";

      export default (
        on: Cypress.PluginEvents,
        config: Cypress.PluginConfigOptions
      ): void => {
        on(
          "file:preprocessor",
          createBundler({
            plugins: [createEsbuildPlugin(config)]
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
