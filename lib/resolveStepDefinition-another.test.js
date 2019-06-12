/* eslint-disable global-require */
/* global jest */
const fs = require("fs");
const { Parser } = require("gherkin");
const { createTestsFromFeature } = require("./createTestsFromFeature");
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

describe("Tags inheritance", () => {
  window.Cypress = {
    env: () => "@inherited-tag and @own-tag"
  };

  Cypress.env = () => "@inherited-tag and @own-tag";
  require("../cypress/support/step_definitions/tags_implementation_with_env_set");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/TagsInheritance.feature")
  );
});
