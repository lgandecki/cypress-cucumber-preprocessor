# Installation

```
$ npm install @badeball/cypress-cucumber-preprocessor
```

# Example setup

[Configure](https://docs.cypress.io/guides/references/configuration) `specPattern` with `"**/*.feature"` and `setupNodeEvents` with a bundler, using EG. `cypress.config.ts`.

```ts
import { defineConfig } from "cypress";
import * as createBundler from "@bahmutov/cypress-esbuild-preprocessor";
import { addCucumberPreprocessorPlugin } from "@badeball/cypress-cucumber-preprocessor";
import createEsbuildPlugin from "@badeball/cypress-cucumber-preprocessor/esbuild";

export default defineConfig({
  e2e: {
    specPattern: "**/*.feature",
    async setupNodeEvents(
      on: Cypress.PluginEvents,
      config: Cypress.PluginConfigOptions
    ): Promise<Cypress.PluginConfigOptions> {
      // This is required for the preprocessor to be able to generate JSON reports after each run, and more,
      await addCucumberPreprocessorPlugin(on, config);

      on(
        "file:preprocessor",
        createBundler({
          plugins: [createEsbuildPlugin(config)],
        })
      );

      // Make sure to return the config object as it might have been modified by the plugin.
      return config;
    },
  },
});
```

The example above illustrates how to use the preprocessor together with Esbuild, which is the recommended bundler if you have no particular requirements (it's by far the fastest). See [examples/](../examples) for how-to using Browserify, Esbuild or Webpack, in all language flavors (CJS, ESM, TS).

Read more about the preprocessor's configuration options at [docs/configuration.md](configuration.md).

# Write a test

Write Gherkin documents and add a file for type definitions with a corresponding name (read more about how step definitions are resolved in [docs/step-definitions.md](step-definitions.md)). Reading [docs/cucumber-basics.md](cucumber-basics.md) is highly recommended.

```cucumber
# cypress/e2e/duckduckgo.feature
Feature: duckduckgo.com
  Scenario: visiting the frontpage
    When I visit duckduckgo.com
    Then I should see a search bar
```

```ts
// cypress/e2e/duckduckgo.ts
import { When, Then } from "@badeball/cypress-cucumber-preprocessor";

When("I visit duckduckgo.com", () => {
  cy.visit("https://www.duckduckgo.com");
});

Then("I should see a search bar", () => {
  cy.get("input").should(
    "have.attr",
    "placeholder",
    "Search the web without being tracked"
  );
});
```
