/* eslint-disable global-require */
/* global jest */
const fs = require("fs");
const { Parser } = require("gherkin");
const {
  defineParameterType,
  defineStep,
  when,
  then,
  given,
  and,
  but
} = require("./resolveStepDefinition");

window.defineParameterType = defineParameterType;
window.when = when;
window.then = then;
window.given = given;
window.and = and;
window.but = but;
window.defineStep = defineStep;
window.cy = {
  log: jest.fn()
};

window.Cypress = {
  env: jest.fn()
};

const readAndParseFeatureFile = featureFilePath => {
  const spec = fs.readFileSync(featureFilePath);
  return new Parser().parse(spec.toString());
};

module.exports = {
  readAndParseFeatureFile
};
