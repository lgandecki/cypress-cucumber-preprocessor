const fs = require("fs");
const { sep } = require("path");
const { getConfig } = require("./getConfig");
const stepDefinitionPath = require("./stepDefinitionPath");

jest.mock("./getConfig");
jest.mock("fs", () => ({
  existsSync: jest.fn(),
}));

const defaultNonGlobalStepDefinitionsPath = `cypress${sep}integration`;

describe("load path from step definitions", () => {
  beforeEach(() => {
    getConfig.mockReset();
    fs.existsSync.mockReset();
  });

  test("Should throw an error if nonGlobalStepDefinitions and stepDefinitions are not set and the default is wrong", () => {
    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true,
    });
    fs.existsSync.mockReturnValue(false);

    const errorMessage = `We've tried to resolve your step definitions at ${defaultNonGlobalStepDefinitionsPath}, but that doesn't seem to exist. As of version 2.0.0 it's required to set step_definitions in your cypress-cucumber-preprocessor configuration. Look for nonGlobalStepDefinitions and add stepDefinitions right next to it. It should match your cypress configuration has set for integrationFolder. We no longer rely on getting information from that file as it was unreliable and problematic across Linux/MacOS/Windows especially since the config file could have been passed as an argument to cypress.`;
    expect(stepDefinitionPath).throw(errorMessage);
  });

  test("Should throw an error if nonGlobalStepDefinitions and stepDefinitions are set but the folder doesn't exist", () => {
    const stepDefinitions = "cypress/stepDefinitions";
    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true,
      stepDefinitions,
    });
    fs.existsSync.mockReturnValue(false);

    const errorMessage = `We've tried to resolve your step definitions at ${stepDefinitions}, but that doesn't seem to exist. As of version 2.0.0 it's required to set step_definitions in your cypress-cucumber-preprocessor configuration. Look for nonGlobalStepDefinitions and add stepDefinitions right next to it. It should match your cypress configuration has set for integrationFolder. We no longer rely on getting information from that file as it was unreliable and problematic across Linux/MacOS/Windows especially since the config file could have been passed as an argument to cypress.`;
    expect(stepDefinitionPath).throw(errorMessage);
  });

  test("should use the default stepDefinitions path for nonGlobalStepDefinitions", () => {
    const appRoot = process.cwd();
    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true,
    });
    fs.existsSync.mockReturnValue(true);

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}${sep}${defaultNonGlobalStepDefinitionsPath}`
    );
  });

  test("should use the stepDefinitions path for nonGlobalStepDefinitions", () => {
    const appRoot = process.cwd();
    getConfig.mockReturnValue({
      step_definitions: "./e2e/support/step-definitions",
    });

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}${sep}e2e${sep}support${sep}step-definitions`
    );
  });

  test("should use the stepDefinitions path", () => {
    const appRoot = process.cwd();
    getConfig.mockReturnValue({
      step_definitions: "./e2e/support/step-definitions",
    });

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}${sep}e2e${sep}support${sep}step-definitions`
    );
  });

  test("should return default path if stepDefinition are not configured and nonGlobalStepDefinitions are not set", () => {
    const appRoot = process.cwd();
    expect(stepDefinitionPath()).to.equal(
      `${appRoot}/cypress/support/step_definitions`
    );
  });

  test("should allow the backward compatible use of step_definitions in cosmiconfig", () => {
    const appRoot = process.cwd();
    getConfig.mockReturnValue({
      step_definitions: "./e2e/support/step-definitions",
    });

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}${sep}e2e${sep}support${sep}step-definitions`
    );
  });
});
