/* eslint-disable global-require */
/* global jest */
const fs = require("fs");
const { Parser } = require("gherkin");
const { createTestsFromFeature } = require("./createTestsFromFeature");
const {
  defineParameterType,
  when,
  then,
  given
} = require("./resolveStepDefinition");

window.defineParameterType = defineParameterType;
window.when = when;
window.then = then;
window.given = given;
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

describe("Scenario Outline", () => {
  require("../cypress/support/step_definitions/scenario_outline_integer");
  require("../cypress/support/step_definitions/scenario_outline_string");
  require("../cypress/support/step_definitions/scenario_outline_data_table");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/ScenarioOutline.feature")
  );
});

describe("DocString", () => {
  require("../cypress/support/step_definitions/docString");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/DocString.feature")
  );
});

describe("Data table", () => {
  require("../cypress/support/step_definitions/dataTable");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/DataTable.feature")
  );
});

describe("Basic example", () => {
  require("../cypress/support/step_definitions/basic");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/Plugin.feature")
  );
});

describe("Background section", () => {
  require("../cypress/support/step_definitions/backgroundSection");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/BackgroundSection.feature")
  );
});

describe("Regexp", () => {
  require("../cypress/support/step_definitions/regexp");
  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/RegularExpressions.feature")
  );
});

describe("Custom Parameter Types", () => {
  require("../cypress/support/step_definitions/customParameterTypes");
  createTestsFromFeature(
    readAndParseFeatureFile(
      "./cypress/integration/CustomParameterTypes.feature"
    )
  );
});

describe("Tags implementation", () => {
  require("../cypress/support/step_definitions/tags_implementation");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/TagsImplementation.feature")
  );
});

describe("Tags with env TAGS set", () => {
  window.Cypress = {
    env: () => "@test-tag and not @ignore-tag"
  };
  require("../cypress/support/step_definitions/tags_implementation_with_env_set");

  createTestsFromFeature(
    readAndParseFeatureFile(
      "./cypress/integration/TagsImplementationWithEnvSet.feature"
    )
  );

  createTestsFromFeature(
    readAndParseFeatureFile(
      "./cypress/integration/TagsImplementationWithEnvSetScenarioLevel.feature"
    )
  );
});

describe("Smart tagging", () => {
  window.Cypress = {
    env: () => ""
  };
  require("../cypress/support/step_definitions/smart_tagging");

  createTestsFromFeature(
    readAndParseFeatureFile("./cypress/integration/SmartTagging.feature")
  );
});
