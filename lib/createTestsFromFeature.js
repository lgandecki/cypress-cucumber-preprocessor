const { shouldProceedCurrentStep, getEnvTags } = require("./tagsHelper");

const createTestsFromFeature = (featureFile) => {
  const featureTags = featureFile.tags;
  const hasEnvTags = !!getEnvTags();
  const anyFocused =
    featureFile.children.filter(
      (section) => section.tags && section.tags.find((t) => t.name === "@focus")
    ).length > 0;
  const backgroundSection = featureFile.children.find(
    (section) => section.type === "Background"
  );
  const allScenarios = featureFile.children.filter(
    (section) => section.type !== "Background"
  );

  const scenariosToRun = allScenarios.filter((section) => {
    let shouldRun;
    // only just run focused if no env tags set
    // https://github.com/TheBrainFamily/cypress-cucumber-example#smart-tagging
    if (!hasEnvTags && anyFocused) {
      shouldRun = section.tags.find((t) => t.name === "@focus");
    } else {
      shouldRun =
        !hasEnvTags ||
        shouldProceedCurrentStep(section.tags.concat(featureTags)); // Concat handles inheritance of tags from feature
    }
    return shouldRun;
  });
  // create tests for all the scenarios
  // but flag only the ones that should be run
  scenariosToRun.forEach((section) => {
    // eslint-disable-next-line no-param-reassign
    section.shouldRun = true;
  });

  return { allScenarios, backgroundSection };
};

const createTestTemplateFromFeature = (filePath, spec, featureFile) => {
  const { allScenarios, backgroundSection } = createTestsFromFeature(
    featureFile
  );

  return `
    const testState = new CucumberDataCollector(
      ${JSON.stringify(filePath)},
      ${JSON.stringify(spec)},
      ${JSON.stringify(featureFile)}
    );
    createTestFromScenarios(
      ${JSON.stringify(allScenarios)},
      ${JSON.stringify(backgroundSection)},
      testState
    );
  `;
};

module.exports = {
  createTestsFromFeature,
  createTestTemplateFromFeature,
};
