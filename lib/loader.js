/* eslint-disable no-eval */
const log = require("debug")("cypress:cucumber");
const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

// This is the template for the file that we will send back to cypress instead of the text of a
// feature file
const createCucumber = (spec, toRequire) =>
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
  const {Parser, Compiler} = require('gherkin');
  const spec = \`${spec}\`
  const gherkinAst = new Parser().parse(spec);

  createTestsFromFeature(gherkinAst);
  `;

module.exports = function(spec, filePath = this.resourcePath) {
  log("compiling", spec);
  const stepDefinitionsToRequire = getStepDefinitionsPaths(filePath).map(
    sdPath => `require('${sdPath}')`
  );
  return createCucumber(spec, stepDefinitionsToRequire);
};
