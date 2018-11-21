/* eslint-disable no-eval */
const log = require("debug")("cypress:cucumber");
const glob = require("glob");
const stepDefinitionPath = require("./stepDefinitionPath.js");

// This is the template for the file that we will send back to cypress instead of the text of a
// feature file
const createCucumber = (spec, toRequire) =>
  `
  const {resolveAndRunStepDefinition, defineParameterType, given, when, then} = require('cypress-cucumber-preprocessor/resolveStepDefinition');
  const Given = window.Given = window.given = given;
  const When = window.When = window.when = when;
  const Then = window.Then = window.then = then;
  window.defineParameterType = defineParameterType;
  const { createTestsFromFeature } = require('cypress-cucumber-preprocessor/createTestsFromFeature');
  ${eval(toRequire).join("\n")}
  const {Parser, Compiler} = require('gherkin');
  const spec = \`${spec}\`
  const gherkinAst = new Parser().parse(spec);

  createTestsFromFeature(gherkinAst);
  `;

const createPattern = () => `${stepDefinitionPath()}/**/*.+(js|ts)`;

const pattern = createPattern();

const getStepDefinitionsPaths = () => [].concat(glob.sync(pattern));

module.exports = spec => {
  log("compiling", spec);
  const stepDefinitionsToRequire = getStepDefinitionsPaths().map(
    sdPath => `require('${sdPath}')`
  );
  return createCucumber(spec, stepDefinitionsToRequire);
};
