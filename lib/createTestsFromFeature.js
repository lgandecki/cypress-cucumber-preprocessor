const { CucumberDataCollector } = require("./cukejson/cucumberDataCollector");
const { createTestFromScenarios } = require("./createTestFromScenario");
const { shouldProceedCurrentStep, getEnvTags } = require("./tagsHelper");

const createTestsFromFeature = (filePath, spec) => {
  const testState = new CucumberDataCollector(filePath, spec);
  const featureTags = testState.feature.tags;
  const hasEnvTags = !!getEnvTags();
  const anyFocused =
    testState.feature.children.filter(
      (section) => section.tags && section.tags.find((t) => t.name === "@focus")
    ).length > 0;
  const backgroundSection = testState.feature.children.find(
    (section) => section.type === "Background"
  );
  const allScenarios = testState.feature.children.filter(
    (section) => section.type !== "Background"
  );

  // tags on features should be inherited by scenario's (https://cucumber.io/docs/cucumber/api/#tags)
  allScenarios.forEach((section) => {
    // eslint-disable-next-line no-param-reassign
    section.tags = section.tags.concat(featureTags);
  });

  const scenariosToRun = allScenarios.filter((section) => {
    let shouldRun;
    // only just run focused if no env tags set
    // https://github.com/TheBrainFamily/cypress-cucumber-example#smart-tagging
    if (!hasEnvTags && anyFocused) {
      shouldRun = section.tags.find((t) => t.name === "@focus");
    } else {
      shouldRun = !hasEnvTags || shouldProceedCurrentStep(section.tags);
    }
    return shouldRun;
  });
  // create tests for all the scenarios
  // but flag only the ones that should be run
  scenariosToRun.forEach((section) => {
    // eslint-disable-next-line no-param-reassign
    section.shouldRun = true;
  });
  createTestFromScenarios(allScenarios, backgroundSection, testState);
};

module.exports = {
  createTestsFromFeature,
};
