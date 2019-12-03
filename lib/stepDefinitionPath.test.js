const fs = require("fs");
const cosmiconfig = require("cosmiconfig");
const stepDefinitionPath = require("./stepDefinitionPath.js");
const cypressExecutionInstance = require("./cypressExecutionInstance");

jest.mock("./cypressExecutionInstance", () => ({
  getArguments: jest.fn()
}));

jest.mock("fs", () => ({
  readFileSync: jest.fn()
}));

jest.mock("cosmiconfig");

describe("load path from step definitions", () => {
  beforeEach(() => {
    cosmiconfig.mockReset();
    fs.readFileSync.mockReset();
    cypressExecutionInstance.getArguments.mockReset();
  });

  test("Should throw error if both nonGlobalStepDefinitions and step_definitions are set in cosmic config", () => {
    const loadMock = jest.fn().mockReturnValue({
      config: {
        nonGlobalStepDefinitions: true,
        step_definitions: "e2e/step_definitions"
      }
    });
    cosmiconfig.mockReturnValue({
      load: loadMock
    });
    fs.readFileSync.mockReturnValue("{}");

    const errorMessage =
      "Error! You can't have both step_definitions folder and nonGlobalStepDefinitions setup in cypress-cucumber-preprocessor configuration";
    expect(stepDefinitionPath).throw(errorMessage);
  });

  test("should return default path if coscmicconfig and cypress.json has not config properties", () => {
    const appRoot = process.cwd();
    cosmiconfig.mockReturnValue({
      load: jest.fn()
    });
    fs.readFileSync.mockReturnValue("{}");

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}/cypress/support/step_definitions`
    );
    expect(fs.readFileSync.mock.calls[0][0]).to.equal(
      `${appRoot}/cypress.json`
    );
  });

  test("should use fileServerFolder from cypress options for backward compability", () => {
    const appRoot = process.cwd();
    const loadMock = jest.fn().mockReturnValue({
      config: {
        commonPath: "./e2e/step-definitions/common"
      }
    });
    cosmiconfig.mockReturnValue({
      load: loadMock
    });
    fs.readFileSync.mockReturnValue(`{
      "fileServerFolder": "./e2e"
    }`);

    expect(stepDefinitionPath()).to.equal(`./e2e/support/step_definitions`);
    expect(fs.readFileSync.mock.calls[0][0]).to.equal(
      `${appRoot}/cypress.json`
    );
  });

  test("should use config file for cypress when cypress is running with option --config-file", () => {
    const appRoot = process.cwd();
    cosmiconfig.mockReturnValue({
      load: jest.fn()
    });
    fs.readFileSync.mockReturnValue(`{
      "fileServerFolder": "./e2e"
    }`);
    cypressExecutionInstance.getArguments.mockReturnValue({
      "config-file": "./e2e/cypress.json"
    });

    expect(stepDefinitionPath()).to.equal(`./e2e/support/step_definitions`);
    expect(fs.readFileSync.mock.calls[0][0]).to.equal(
      `${appRoot}/e2e/cypress.json`
    );
  });

  test("should use nonGlobalStepDefinitions from cosmiconfig", () => {
    const appRoot = process.cwd();
    const loadMock = jest.fn().mockReturnValue({
      config: {
        nonGlobalStepDefinitions: true
      }
    });
    cosmiconfig.mockReturnValue({
      load: loadMock
    });
    fs.readFileSync.mockReturnValue(`{}`);

    expect(stepDefinitionPath()).to.equal(`${appRoot}/cypress/integration`);
    expect(fs.readFileSync.mock.calls[0][0]).to.equal(
      `${appRoot}/cypress.json`
    );
  });

  test("should use step_definitions from cosmiconfig", () => {
    const appRoot = process.cwd();
    const loadMock = jest.fn().mockReturnValue({
      config: {
        step_definitions: "./e2e/support/step-definitions"
      }
    });
    cosmiconfig.mockReturnValue({
      load: loadMock
    });
    fs.readFileSync.mockReturnValue(`{}`);

    expect(stepDefinitionPath()).to.equal(
      `${appRoot}/e2e/support/step-definitions`
    );
    expect(fs.readFileSync.mock.calls[0][0]).to.equal(
      `${appRoot}/cypress.json`
    );
  });
});
