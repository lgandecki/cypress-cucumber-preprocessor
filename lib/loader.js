/* eslint-disable no-eval */
const log = require("debug")("cypress:cucumber");
const path = require("path");
const cosmiconfig = require("cosmiconfig");
const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

// This is the template for the file that we will send back to cypress instead of the text of a
// feature file
const createCucumber = (filePath, cucumberJson, spec, toRequire) =>
  `
  const {resolveAndRunStepDefinition, defineParameterType, given, when, then, and, but, defineStep} = require('cypress-cucumber-preprocessor/lib/resolveStepDefinition');
  const Given = window.Given = window.given = given;
  const When = window.When = window.when = when;
  const Then = window.Then = window.then = then;
  const And = window.And = window.and = and;
  const But = window.But = window.but = but;
  window.defineParameterType = defineParameterType;
  window.defineStep = defineStep;
  const { createTestsFromFeature } = require('cypress-cucumber-preprocessor/lib/createTestsFromFeature');
  ${eval(toRequire).join("\n")}
  const spec = \`${spec}\`;
  const filePath = '${filePath}';
  window.cucumberJson = ${JSON.stringify(cucumberJson)};
     
  createTestsFromFeature(filePath, spec);
  `;

module.exports = function(spec, filePath = this.resourcePath) {
  const explorer = cosmiconfig("cypress-cucumber-preprocessor", { sync: true });
  const loaded = explorer.load();
  const cucumberJson =
    loaded && loaded.config && loaded.config.cucumberJson
      ? loaded.config.cucumberJson
      : { generate: false };

  log("compiling", spec);
  log("cucumber.json", JSON.stringify(cucumberJson));
  const stepDefinitionsToRequire = getStepDefinitionsPaths(filePath).map(
    sdPath => `require('${sdPath}')`
  );
  return createCucumber(
    path.basename(filePath),
    cucumberJson,
    spec,
    stepDefinitionsToRequire
  );
};
