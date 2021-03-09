/* eslint-disable global-require */
const fs = require("fs");
const { Parser } = require("gherkin");

const { createTestsFromFeature } = require("../createTestsFromFeature");
const { createTestFromScenarios } = require("../createTestFromScenario");
const { CucumberDataCollector } = require("../cukejson/cucumberDataCollector");

const resolveFeatureFromFile = (featureFile) => {
  const spec = fs.readFileSync(featureFile);
  const parsedFeature = new Parser().parse(spec.toString()).feature;

  const { filePath, allScenarios, backgroundSection } = createTestsFromFeature(
    parsedFeature
  );

  const testState = new CucumberDataCollector(filePath, spec, parsedFeature);

  createTestFromScenarios(allScenarios, backgroundSection, testState);
};

module.exports = {
  resolveFeatureFromFile,
};
