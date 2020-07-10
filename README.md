[![styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![CircleCI](https://circleci.com/gh/TheBrainFamily/cypress-cucumber-preprocessor.svg?style=shield)](https://circleci.com/gh/TheBrainFamily/cypress-cucumber-preprocessor)
# Run cucumber/gherkin-syntaxed specs with Cypress.io

The **cypress-cucumber-preprocessor** adds support for using feature files when testing with Cypress.

You can follow the documentation below, or if you prefer to hack on a working example, take a look at [https://github.com/TheBrainFamily/cypress-cucumber-example](https://github.com/TheBrainFamily/cypress-cucumber-example
)

#### Table of contents
* [Get started](#get-started)
  * [Installation](#installation)
  * [Cypress Configuration](#cypress-configuration)
  * [Configuration](#configuration)
* [How to organize the tests](#how-to-organize-the-tests)
  * [Single feature files](#single-feature-files)
  * [Bundled features files](#bundled-features-files)
  * [Step definitions](#step-definitions)
    * [Step definitions creation](#step-definitions-creation)
    * [Reusable step definitions](#reusable-step-definitions)
* [How to write tests](#how-to-write-tests)
  * [Cucumber Expressions](#cucumber-expressions)
  * [Given/When/Then functions](#cucumber-functions)
  * [Data table parameters](#data-table-parameters)
  * [Custom Parameter Type Resolves](#custom-parameter-type-resolves)
  * [Before and After hooks](#before-and-after-hooks)
  * [Background section](#background-section)
  * [Sharing context](#sharing-context)
  * [Smart tagging](#smart-tagging)
* [How to run the tests](#excluding-tests)
  * [Running tagged tests](#running-tagged-tests)
  * [Ignoring specific scenarios using tags when executing test runner](#ignoring-specific-scenarios-using-tags-when-executing-test-runner)
  * [Output](#output)
* [IDE support](#ide-support)
  * [Webstorm](#webstorm)
  * [Intellij IDEA](#intellij-IDEA)
  * [Visual Studio Code](#visual-Studio-Code)
* [TypeScript Support](#typeScript-support)
* [How to contribute](#how-to-contribute)
* [Roadmap](#roadmap)
* [Credits](#credits)
* [Oldschool/Legacy Cucumber style](#legacy)

## Get started

### Installation
Install the plugin by running:

```shell
npm install --save-dev cypress-cucumber-preprocessor
```

### Cypress Configuration
Add it to your plugins:

`cypress/plugins/index.js`
```javascript
const cucumber = require('cypress-cucumber-preprocessor').default

module.exports = (on, config) => {
  on('file:preprocessor', cucumber())
}
```

Add support for feature files to your Cypress configuration

`cypress.json`
```json
{
  "testFiles": "**/*.feature"
}
```

### Configuration
Please make use of [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) to create a configuration for the plugin, for example, by adding this section to your package.json:

```json
"cypress-cucumber-preprocessor": {
  "nonGlobalStepDefinitions": true
}
``` 

*This will become the default option in a future version*

#### Configuration option

Option | Default value | Description
------------ | ------------- | -------------
commonPath | `cypress/integration/common` when `nonGlobalStepDefinitions` is true <br> `cypress/support/step_definitions` when `nonGlobalStepDefinitions` is false <br> `${nonGlobalStepBaseDir}/common` when `nonGlobalStepBaseDir` is defined | Define the path to a folder containing all common step definitions of your tests. When `nonGlobalStepBaseDir` is defined this path is defined from that base location. e.g `${nonGlobalStepBaseDir}/${commonPath}`.
nonGlobalStepDefinitions | false | If true use the Cypress Cucumber Preprocessor Style pattern for placing step definitions files. If false, we will use the "oldschool" (everything is global) Cucumber style.
nonGlobalStepBaseDir| undefined | If defined and `nonGlobalStepDefinitions` is also true then step definition searches for folders with the features name will start from the directory provided here. The cwd is already taken into account. e.g `test/step_definitions`.
stepDefinitions | `cypress/integration` when `nonGlobalStepDefinitions` is true <br> `cypress/support/step_definitions` when `nonGlobalStepDefinitions` is false | Path to the folder containing our step definitions.

## How to organize the tests

### Single feature files
Put your feature files in `cypress/integration/`

Example: cypress/integration/Google.feature
```gherkin
Feature: The Facebook

  I want to open a social network page
  
  @focus
  Scenario: Opening a social network page
    Given I open Google page
    Then I see "google" in the title
```

*The @focus tag is not necessary, but we want to you to notice it so you look it up below. **It will speed up your workflow significantly**!*

### Bundled features files

When running Cypress tests in a headless mode, the execution time can get pretty bloated, this happens because by default Cypress will relaunch the browser between every feature file.
The **cypress-cucumber-preprocessor** gives you the option to bundle all feature files before running the tests, therefore reducing the execution time.

You can take advantage of this by creating `.features` files. You choose to have only one in the root of the directory `cypress/integrations` or per directory.

You also have to add support for `.features` files to your Cypress configuration

`cypress.json`
```json
{
  "testFiles": "**/*.{feature,features}"
}
```

To run the bundled tests:
```shell
cypress run --spec **/*.features
``` 

### Step definitions

**This is the RECOMMENDED way**

#### Step definitions creation
The `.feature` file will use steps definitions from a directory with the same name as your `.feature` file. The javascript files containing the step definitions can have other names if you want to break them into different concerns.

Easier to show than to explain, so, assuming the feature file is in `cypress/integration/Google.feature` , as proposed above, the preprocessor will read all the files inside `cypress/integration/Google/`, so: 

`cypress/integration/Google/google.js` (or any other .js file in the same path)
```javascript
import { Given } from "cypress-cucumber-preprocessor/steps";

const url = 'https://google.com'
Given('I open Google page', () => {
  cy.visit(url)
})
```

This is a good place to put *before/beforeEach/after/afterEach* hooks related to **that particular feature**. This is incredibly hard to get right with pure cucumber.  

#### Reusable step definitions

We also have a way to create reusable step definitions. Put them in `cypress/integration/common/`

Example:
cypress/integration/common/i_see_string_in_the_title.js
```javascript
import { Then } from "cypress-cucumber-preprocessor/steps";

Then(`I see {string} in the title`, (title) => {
  cy.title().should('include', title)
})
```

This is a good place to put global *before/beforeEach/after/afterEach* hooks. 

## How to write tests

### Cucumber Expressions
We use https://docs.cucumber.io/cucumber/cucumber-expressions/ to parse your .feature file, please use that document as your reference

<a name="cucumber-functions"></a>

### Given/When/Then functions
Since Given/When/Then are on global scope please use
```javascript
/* global Given, When, Then */
```
to make IDE/linter happy or import them directly as shown in the above examples.

### Data table parameters

To create steps that use gherkin data tables, the step definition needs to take an object and handle it like in these examples: [Example Feature](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor/blob/master/cypress/integration/DataTable.feature), [Example Step Definition](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor/blob/master/cypress/support/step_definitions/dataTable.js).

### Custom Parameter Type Resolves

Thanks to @Oltodo we can now use Custom Parameter Type Resolves. 
Here is an [example](cypress/support/step_definitions/customParameterTypes.js) with related [.feature file](cypress/integration/CustomParameterTypes.feature)

### Before and After hooks
The **cypress-cucumber-preprocessor** supports both Mocha's `before/beforeEach/after/afterEach` hooks and Cucumber's `Before` and `After` hooks.

The Cucumber hooks implementation fully supports tagging as described in [the cucumber js documentation](https://github.com/cucumber/cucumber-js/blob/master/docs/support_files/hooks.md). So they can be conditionally selected based on the tags applied to the Scenario. This is not possible with Mocha hooks.

Cucumber Before hooks run after all Mocha before and beforeEach hooks have completed and the Cucumber After hooks run before all the Mocha afterEach and after hooks.

Example: 
```javascript
const {
  Before,
  After,
  Given,
  Then
} = require("cypress-cucumber-preprocessor/steps");

// this will get called before each scenario
Before(() => {
  beforeCounter += 1;
  beforeWithTagCounter = 0;
});

// this will only get called before scenarios tagged with @foo
Before({ tags: "@foo" }, () => {
  beforeWithTagCounter += 1;
});

Given("My Step Definition", () => {
  // ...test code here
})
```

Note: to avoid confusion with the similarly named Mocha before and after hooks, the Cucumber hooks are not exported onto global scope. So they need explicitly importing as shown above.

### Background section
Adding a background section to your feature will enable you to run steps before every scenario. For example, we have a counter that needs to be reset before each scenario. We can create a given step for resetting the counter. 

```javascript
let counter = 0;

Given("counter has been reset", () => {
  counter = 0;
});

When("counter is incremented", () => {
  counter += 1;
});

Then("counter equals {int}", value => {
  expect(counter).to.equal(value);
});
```

```gherkin
Feature: Background Section
  
   Background:
    Given counter has been reset

   Scenario: Basic example #1
     When counter is incremented
     Then counter equals 1
    
   Scenario: Basic example #2
     When counter is incremented
     When counter is incremented
     Then counter equals 2
```

### Sharing context
You can share context between step definitions using `cy.as()` alias.

Example:
```javascript
Given('I go to the add new item page', () => {
  cy.visit('/addItem');
});

When('I add a new item', () => { 
  cy.get('input[name="addNewItem"]').as('addNewItemInput');
  cy.get('@addNewItemInput').type('My item');
  cy.get('button[name="submitItem"]').click();
})

Then('I see new item added', () => {
  cy.get('td:contains("My item")');
});

Then('I can add another item', () => {
  expect(cy.get('@addNewItemInput').should('be.empty');
});

```

For more information please visit: https://docs.cypress.io/api/commands/as.html

### Smart tagging
Start your tests without setting any tags. And then put a @focus on the scenario (or scenarios) you want to focus on while development or bug fixing.

For example:
```gherkin
Feature: Smart Tagging

  As a cucumber cypress plugin which handles Tags
  I want to allow people to select tests to run if focused
  So they can work more efficiently and have a shorter feedback loop

  Scenario: This scenario should not run if @focus is on another scenario
    Then this unfocused scenario should not run

  @focus
  Scenario: This scenario is focused and should run
    Then this focused scenario should run

  @this-tag-affects-nothing
  Scenario: This scenario should also not run
    Then this unfocused scenario should not run

  @focus
  Scenario: This scenario is also focused and also should run
    Then this focused scenario should run
```

## How to run the tests
Run your Cypress Launcher the way you would usually do, for example:

```bash
./node_modules/.bin/cypress open
```

click on a `.feature` file on the list of specs, and see the magic happening!

### Running tagged tests
You can use tags to select which test should run using [cucumber's tag expressions](https://github.com/cucumber/cucumber/tree/master/tag-expressions).
Keep in mind we are using newer syntax, eg. `'not @foo and (@bar or @zap)'`.
In order to initialize tests using tags you will have to run cypress and pass TAGS environment variable.

Example:
```shell
  ./node_modules/.bin/cypress-tags run -e TAGS='not @foo and (@bar or @zap)'
```

Please note - we use our own cypress-tags wrapper to speed things up.
This wrapper calls the cypress executable from local modules and if not found it falls back to the globally installed one.
For more details and examples please take a look to the [example repo](https://github.com/TheBrainFamily/cypress-cucumber-example).

### Ignoring specific scenarios using tags when executing test runner
You can also use tags to skip or ignore specific tests/scenarios when running cypress test runner (where you don't have the abilitiy to pass parameters like in the examples above for the execution)

The trick consists in adding the "env" property with the "TAGS" subproperty in the cypress.json configuration file. It would look something like this:

```javascript
{
    "env": {
        "TAGS": "not @ignore"
    },
    //rest of configuration options
    "baseUrl": "yourBaseUrl",       
    "ignoreTestFiles": "*.js",
    //etc
}
```

Then, any scenarios tagged with @ignore will be skipped when running the tests using the cypress test runner

### Limiting to a subset of feature files
You can use a glob expression to select which feature files should be included.

Example:
```shell
  ./node_modules/.bin/cypress-tags run -e GLOB='cypress/integration/**/*.feature'
```

### Output
The **cypress-cucumber-preprocessor** can generate a `cucumber.json` file output as it runs the features files. This is separate from, and in addition to, any Mocha reporter configured in Cypress.

These files are intended to be used with one of the many available Cucumber report generator packages. 
Seems to work fine with both https://github.com/jenkinsci/cucumber-reports-plugin and https://github.com/wswebcreation/multiple-cucumber-html-reporter

Output, by default, is written to the folder `cypress/cucumber-json`, and one file is generated per feature.
 
This behaviour is configurable. Use [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) to create a configuration for the plugin, see step definition discussion above and add the following to the cypress-cucumber-preprocessor section in package.json to turn it off or change the defaults:

```
  "cypress-cucumber-preprocessor": {
    "cucumberJson": {
      "generate": true,
      "outputFolder": "cypress/cucumber-json",
      "filePrefix": "",
      "fileSuffix": ".cucumber"
    }
  }
```

#### Cucumber.json options
Option | Default value | Description
------------ | ------------- | -------------
outputFolder | `cypress/cucumber-json` | The folder to write the files to
filePrefix | `''` *(no prefix)* | A separate json file is generated for each feature based on the name of the feature file. All generated file names will be prefixed with this option if specified
fileSuffix | `.cucumber` | A suffix to add to each generated filename
generate | `false` | Flag to output cucumber.json or not


## IDE support

### WebStorm
If you want WebStorm to resolve your steps, use the capitalized `Given/When/Then` function names (instead of the initial given/when/then).

Note, only WebStorm 2019.2 and later versions are able to [resolve steps located outside of a step_definitions folder](https://youtrack.jetbrains.com/issue/WEB-11505)

### Intellij IDEA
Intellij IDEA Community Edition does not support cucumber in javascript, but the Ultimate Edition can provide the same level support for step resolution as WebStorm.

To enable cucumber step resolution in Intellij IDEA Ulimate edition you will need to download and enable the JetBrains [Cucumber JS plugin](https://plugins.jetbrains.com/plugin/7418-cucumber-js/). In WebStorm this plugin is already bundled into the distribution.

### Visual Studio Code
To get vscode to resolve your steps, install the [Cucumber (Gherkin) Full Support](https://marketplace.visualstudio.com/items?itemName=alexkrechik.cucumberautocomplete) extension from the marketplace.

You will also need to tell the extension the locations of your feature and step definition files [as described here](https://github.com/alexkrechik/VSCucumberAutoComplete#settings-example).

Note, that unlike WebStorm which will correctly identify multiple implementations of matching steps, the vscode extension currently resolves to the first matching occurence it finds on its path.

## TypeScript Support

### Install

Install the plug-in type definitions:

```shell
npm install --save-dev @types/cypress-cucumber-preprocessor
```

### With out-of-the-box support

As of [Cypress
v4.4.0](https://github.com/cypress-io/cypress/releases/tag/v4.4.0), TypeScript
is supported out-of-the-box. To use it, add this to your `plugins/index.js`:

```javascript
const browserify = require('@cypress/browserify-preprocessor');
const cucumber = require('cypress-cucumber-preprocessor').default;
const resolve = require('resolve');

module.exports = (on, config) => {
  const options = {
    ...browserify.defaultOptions,
    typescript: resolve.sync('typescript', { baseDir: config.projectRoot }),
  };

  on('file:preprocessor', cucumber(options));
};
```

### With Webpack
You can also use a Webpack loader to process feature files (TypeScript supported). To see how it is done please take 
a look here: [cypress-cucumber-webpack-typescript-example](https://github.com/TheBrainFamily/cypress-cucumber-webpack-typescript-example)

### Without Webpack
If you want to use TypeScript, add this to your plugins/index.js:

```javascript
const cucumber = require("cypress-cucumber-preprocessor").default;
const browserify = require("@cypress/browserify-preprocessor");

module.exports = (on) => {
  const options = browserify.defaultOptions;

  options.browserifyOptions.plugin.unshift(['tsify']);
  // Or, if you need a custom tsconfig.json for your test files:
  // options.browserifyOptions.plugin.unshift(['tsify', {project: 'path/to/other/tsconfig.json'}]);
  
  on("file:preprocessor", cucumber(options));
};
```

...and install *tsify*. I'm assuming you already have typescript installed. :-)

```bash
npm install tsify
```

Then in your .ts files you need to make sure you either require/import the functions defining step definitions, or declare them as global:

```typescript
declare const Given, When, Then;
// OR
import { Given, Then, When } from "cypress-cucumber-preprocessor/steps";
```

To see an example take a look here: [https://github.com/TheBrainFamily/cypress-cucumber-typescript-example/](https://github.com/TheBrainFamily/cypress-cucumber-typescript-example/)

<a name="legacy"></a>

## How to contribute

Install all dependencies:
```bash
npm install
```

Link the package:
```bash
npm link 
npm link cypress-cucumber-preprocessor
```

Run tests:
```bash
npm test
```

### Submitting your PR
This repo uses [commitizen](https://github.com/commitizen/cz-cli) to manage commits messages and [semantic-release](https://github.com/semantic-release/semantic-release) to use those commit messages to automatically release this package with proper release version.
 
If you are confused please ask questions or/and read the documentation of these two fantastic tools! As far as the development goes, you should just do git commit from the command line, and commitizen will guide you through creating a proper commit message.

### Issues

Please let me know if you find any issues or have suggestions for improvements by opening a new issue.

## Roadmap

- (Under discussion) Add option to customize mocha template [#3](https://github.com/TheBrainFamily/cypress-cucumber-preprocessor/issues/3)

<a name="credits"></a>

## Credit where it's due!

Based/inspired by the great work from [gherkin-testcafe](https://github.com/sitegeist/gherkin-testcafe), although, with this package we don't have to run Cypress programmatically - with an external runner, we can use Cypress as we are used to :)

Thanks to the Cypress team for the fantastic work and very exciting tool! :-)

Thanks to @fcurella for fantastic work with making the **cypress-cucumber-preprocessor** reactive to file changes. :-)

___

## Oldschool/Legacy Cucumber style
**Not recommended. Please let us know if you decide to use it!**

### Why avoid it
The problem with the legacy structure is that everything is global. This is problematic for multiple reasons.

- It makes it harder to create `.feature` files that read nicely - you have to make sure you are not stepping on toes of already existing step definitions. You should be able to write your tests without worrying about reusability, complex regexp matches, or anything like that. Just write a story. Explain what you want to see without getting into the details. Reuse in the .js files, not in something you should consider an always up-to-date, human-readable documentation.
- The startup times get much worse - because we have to analyze all the different step definitions so we can match the .feature files to the test.
- Hooks are problematic. If you put before() in a step definition file, you might think that it will run only for the .feature file related to that step definition. You try the feature you work on, everything seems fine and you push the code. Here comes a surprise - it will run for ALL .feature files in your whole project. Very unintuitive. And good luck debugging problems caused by that! This problem was not unique to this plugin, but to the way cucumberjs operates. 

Let's look how this differs with the proposed structure. Assuming you want to have a hook before ./Google.feature file, just create a ./Google/before.js and put the hook there. This should take care of long requested feature - [https://github.com/TheBrainFamily/cypress-cucumber-preprocessor/issues/25](#25)

If you have a few tests the "oldschool" style is completely fine. But for a large enterprise-grade application, with hundreds or sometimes thousands of .feature files, the fact that everything is global becomes a maintainability nightmare. 

We suggest to put: 
```json
  "ignoreTestFiles": "*.js"
```
in your cypress.json to have a clean view of your tests in the cypress dashbord, and also so cypress doesn't try to run your step definition files as tests in CI. 

### Step Definition location configuration
Step definition files are by default in: `cypress/support/step_definitions`. If you want to put them somewhere please use [cosmiconfig](https://github.com/davidtheclark/cosmiconfig) format. For example, add to your package.json :

```javascript
  "cypress-cucumber-preprocessor": {
    "step_definitions": "cypress/support/step_definitions/"
  }
```

Follow your configuration or use the defaults and put your step definitions in `cypress/support/step_definitions`

Examples:
cypress/support/step_definitions/google.js
```javascript
import { Given } from "cypress-cucumber-preprocessor/steps";

const url = 'https://google.com'
Given('I open Google page', () => {
  cy.visit(url)
})
```

cypress/support/step_definitions/shared.js
```javascript
import { Then } from "cypress-cucumber-preprocessor/steps";

Then(`I see {string} in the title`, (title) => {
  cy.title().should('include', title)
})
```
