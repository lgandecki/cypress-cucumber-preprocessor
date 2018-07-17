[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![CircleCI](https://circleci.com/gh/TheBrainFamily/cypress-cucumber-preprocessor.svg?style=shield)](https://circleci.com/gh/TheBrainFamily/cypress-cucumber-preprocessor)
# Run cucumber/gherkin-syntaxed specs with cypress.io

Please take a look at an example here:

https://github.com/TheBrainFamily/cypress-cucumber-example


Important steps:

## Installation
Install this plugin:

```shell
npm install --save-dev cypress-cucumber-preprocessor
```

## Step definitions

Put your step definitions in cypress/support/step_definitions

Examples:
cypress/support/step_definitions/google.js
```javascript
/* global Given */
// you can have external state, and also require things!
const url = 'https://google.com'

Given('I open Google page', () => {
  cy.visit(url)
})
```

cypress/support/step_definitions/shared.js
```javascript
/* global Then */
Then(`I see {string} in the title`, (title) => {
  cy.title().should('include', title)
})
```

Since Given/When/Then are on global scope please use
```javascript
/* global Given, When, Then */
```
to make IDE/linter happy

We had a pattern to import those explicitly, but for some reason it was messing up the watch mode on Linux :-( (#10)

### Sharing context

You can share context between step definitions using `cy.as()` alias.

Example:
```javascript
given('I go to the add new item page', () => {
  cy.visit('/addItem');
});

when('I add a new item', () => { 
  cy.get('input[name="addNewItem"]').as('addNewItemInput');
  cy.get('@addNewItemInput').type('My item');
  cy.get('button[name="submitItem"]').click();
})

then('I see new item added', () => {
  cy.get('td:contains("My item")');
});

then('I can add another item', () => {
  expect(cy.get('@addNewItemInput').should('be.empty');
});

```

For more information please visit: https://docs.cypress.io/api/commands/as.html

## Spec/Feature files
Your feature file in cypress/integration:

Example: cypress/integration/Facebook.feature
```gherkin
Feature: The Facebook

  I want to open a social network page

  Scenario: Opening a social network page
    Given I open Facebook page
    Then I see "Facebook" in the title
```

## Configuration
Add it to your plugins:

cypress/plugins/index.js
```javascript
const cucumber = require('cypress-cucumber-preprocessor').default
module.exports = (on, config) => {
  on('file:preprocessor', cucumber())
}
```

Step definition files are by default in: cypress/support/step_definitions. If you want to put them somewhere please use [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) format. For example, add to your package.json :

```javascript
  "cypress-cucumber-preprocessor": {
    "step_definitions": "cypress/support/step_definitions/"
  }
```

## Running

Run your cypress the way you would normally do :) click on a .feature file on the list of specs, and see the magic happening!

## Cucumber Expressions

We use https://docs.cucumber.io/cucumber/cucumber-expressions/ to parse your .feature file, please use that document as your reference 

## Development

Install all dependencies:
```javascript
npm install
```

Link the package:
```javascript
npm link 
npm link cypress-cucumber-preprocessor
```

Run tests:
```javascript
npm test
```

## Disclaimer

Please let me know if you find any issues or have suggestions for improvements.

## Custom Parameter Type Resolves

Thanks to @Oltodo we can know use Custom Parameter Type Resolves. 
Here is an [example](cypress/support/step_definitions/customParameterTypes.js) with related [.feature file](cypress/integration/CustomParameterTypes.feature)

## WebStorm Support

If you want WebStorm to resolve your steps, use the capitalized Given/When/Then function names (instead of the initial given/when/then). 
Unfortunately, at this point WebStorm only understands regexp syntax:
 ```javascript
 Given(/^user navigated to the Start page?/, () => { });
```
Or a backtick syntax but without Cucumber Expressions :-(.
In other words, this works:
```javascript
Given(`user navigated to the start page`, () => { });
Then(/(.*?) is chosen/, choice => {})
```

But this doesn't:

```javascript
Then(`{word} is chosen`, choice => {})
```
 (See #56)


## TypeScript

If you want to use TypeScript put this in your plugins/index.js:

```javascript
const cucumber = require("cypress-cucumber-preprocessor").default;
const browserify = require("@cypress/browserify-preprocessor");

module.exports = (on) => {
  on("file:preprocessor", file => {
      browserify.defaultOptions.browserifyOptions.plugin.push(["tsify"])
      return cucumber(
        browserify.defaultOptions
      )(file);
  });
};
```

...and install tsify. I'm assuming you already have typescript installed. :-)

```bash
npm install tsify
```

Then in your .ts files you need to make sure you either require/import the functions defining step definitions, or declare them as global:

```typescript
declare const Given, When, Then;
// OR
const {given, when, then} = require('cypress-cucumber-preprocessor/resolveStepDefinition')
```

## TODO

Tags!
(Maybe?) Option to customize mocha template ( #3 ) 

## Credit where it's due!

Based/inspired on great work on https://github.com/sitegeist/gherkin-testcafe , although, with this package we don't have to run cypress programmatically - with an external runner, we can use cypress as we are used to :)

Thanks to the Cypress team for the fantastic work and very exciting tool! :-)

Thanks to @fcurella for fantastic work with making the preprocessor reactive to file changes. :-)
