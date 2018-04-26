const { createTestFromScenario } = require("./createTestFromScenario");

const createTestsFromFeature = parsedFeature => {
  describe(parsedFeature.feature.name, () => {
    const featureTags = parsedFeature.feature.tags;
    const backgroundSection = parsedFeature.feature.children.find(
      section => section.type === "Background"
    );
    const otherSections = parsedFeature.feature.children.filter(
      section => section.type !== "Background"
    );
    otherSections.forEach(section => {
      createTestFromScenario(section, backgroundSection, featureTags);
    });
  });
};

module.exports = {
  createTestsFromFeature
};
