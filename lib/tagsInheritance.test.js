/* eslint-disable global-require */
const {
  resolveFeatureFromFile,
} = require("./testHelpers/resolveFeatureFromFile");

describe("Tags inheritance", () => {
  window.Cypress = {
    ...window.Cypress,
    env: () => "@inherited-tag and @own-tag",
  };

  require("../cypress/support/step_definitions/tags_implementation_with_env_set");
  resolveFeatureFromFile("./cypress/integration/TagsInheritance.feature");
});
