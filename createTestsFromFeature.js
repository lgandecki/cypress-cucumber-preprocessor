const { createTestFromScenario } = require("./createTestFromScenario");

const createTestsFromFeature = parsedFeature => {
  // eslint-disable-next-line prefer-arrow-callback
  describe(parsedFeature.feature.name, function() {
    const backgroundSection = parsedFeature.feature.children.find(
      section => section.type === "Background"
    );
    const otherSections = parsedFeature.feature.children.filter(
      section => section.type !== "Background"
    );
    otherSections.forEach(section => {
      createTestFromScenario(section, backgroundSection);
    });
  });
};

module.exports = {
  createTestsFromFeature
};
