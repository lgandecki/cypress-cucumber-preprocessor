# cypress-cucumber-preprocessor

[![Build status](https://github.com/badeball/cypress-cucumber-preprocessor/actions/workflows/build.yml/badge.svg)](https://github.com/badeball/cypress-cucumber-preprocessor/actions/workflows/build.yml)
[![Npm package weekly downloads](https://badgen.net/npm/dw/@badeball/cypress-cucumber-preprocessor)](https://npmjs.com/package/@badeball/cypress-cucumber-preprocessor)

This preprocessor aims to provide a developer experience and behavior similar to that of [Cucumber](https://cucumber.io/), to Cypress.

> :information_source: The repositor has recently moved from `github.com/TheBrainFamily` to `github.com/badeball`. Read more about the transfer of ownership [here](https://github.com/badeball/cypress-cucumber-preprocessor/issues/689).

## Installation

```
$ npm install @badeball/cypress-cucumber-preprocessor
```

## Introduction

The preprocessor (with its dependencies) parses Gherkin documents and allows you to write tests as shown below.

```cucumber
# cypress/e2e/duckduckgo.feature
Feature: duckduckgo.com
  Scenario: visting the frontpage
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

## User guide

For further documentation see [docs](docs/readme.md) and [docs/quick-start.md](docs/quick-start.md).

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## Building

Building can be done once using:

```
$ npm run build
```

Or upon file changes with:

```
$ npm run watch
```

There are multiple types of tests, all ran using npm scripts:

```
$ npm run test:fmt
$ npm run test:types
$ npm run test:unit
$ npm run test:integration # make sure to build first
$ npm run test # runs all of the above
```

## Attribution

A special thanks goes out to [Łukasz Gandecki](https://github.com/lgandecki) for developing and maintaning the cypress-cucumber integration before me, in addition to [all other contributors](https://github.com/badeball/cypress-cucumber-preprocessor/graphs/contributors). Some of the work has partially been sponsored by [Klaveness Digital](https://www.klavenessdigital.com/).
