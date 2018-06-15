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
/* global given */
// you can have external state, and also require things!
const url = 'https://google.com'

given('I open Google page', () => {
  cy.visit(url)
})
```

cypress/support/step_definitions/shared.js
```javascript
/* global then */
then(`I see {string} in the title`, (title) => {
  cy.title().should('include', title)
})
```

Since given/when/then are on global scope please use
```javascript
/* global then, when, given */
```
to make IDE/linter happy

We had a pattern to import those explicitly, but for some reason it was messing up the watch mode on Linux :-( (#10)

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

## TypeScript

You can use this package with TypeScript!

```javascript
module.exports = on => {
  on('file:preprocessor', cypressTypeScriptPreprocessor)
  on('file:preprocessor', cucumber())
}
```

## TODO

(Maybe?) Option to customize mocha template ( #3 ) 

## Credit where it's due!

Based/inspired on great work on https://github.com/sitegeist/gherkin-testcafe , although, with this package we don't have to run cypress programmatically - with an external runner, we can use cypress as we are used to :)

Thanks to the Cypress team for the fantastic work and very exciting tool! :-)

Thanks to @fcurella for fantastic work with making the preprocessor reactive to file changes. :-)
