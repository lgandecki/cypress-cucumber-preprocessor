/* eslint-disable global-require */
/* global jest */
const fs = require("fs");
const { Parser } = require("gherkin");
const { createTestsFromFeature } = require("./createTestsFromFeature");
const { when, then, given } = require("./resolveStepDefinition");

window.when = when;
window.then = then;
window.given = given;
window.cy = {
  log: jest.fn()
};

const readAndParseFeatureFile = featureFilePath => {
  const spec = fs.readFileSync(featureFilePath);
  return new Parser().parse(spec.toString());
};

describe("Scenario Outline", () => {
  require("./cypress/support/step_definitions/scenario_outline_integer");
  require("./cypress/support/step_definitions/scenario_outline_string");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/ScenarioOutline.feature")
  );
});

describe("DocString", () => {
  require("./cypress/support/step_definitions/docString");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/DocString.feature")
  );
});

describe("Data table", () => {
  require("./cypress/support/step_definitions/dataTable");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/DataTable.feature")
  );
});

describe("Basic example", () => {
  require("./cypress/support/step_definitions/basic");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/Plugin.feature")
  );
});

describe("Background section", () => {
  require("./cypress/support/step_definitions/backgroundSection");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/BackgroundSection.feature")
  );
});

describe("Regexp", () => {
  require("./cypress/support/step_definitions/regexp");
  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/RegularExpressions.feature")
  );
});
