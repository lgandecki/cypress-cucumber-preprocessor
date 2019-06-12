/* eslint-disable global-require */
/* global jest */
const { readAndParseFeatureFile } = require("./setup");
const { createTestsFromFeature } = require("./createTestsFromFeature");

describe("Tags inheritance", () => {
  window.Cypress = {
    env: () => "@inherited-tag and @own-tag"
  };

  require("../cypress/support/step_definitions/tags_implementation_with_env_set");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/TagsInheritance.feature")
  );
});
