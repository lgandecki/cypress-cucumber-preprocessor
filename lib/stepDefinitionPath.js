const fs = require("fs");
const path = require("path");
const cosmiconfig = require("cosmiconfig");
const cypressExecutionInstance = require("./cypressExecutionInstance");

module.exports = () => {
  const appRoot = process.cwd();
  const cypressExecutionArguments = cypressExecutionInstance.getArguments();
  const cypressConfigPath =
    cypressExecutionArguments && cypressExecutionArguments["config-file"]
      ? path.resolve(appRoot, cypressExecutionArguments["config-file"])
      : `${appRoot}/cypress.json`;
  const cypressOptions = JSON.parse(
    fs.readFileSync(cypressConfigPath, "utf-8")
  );

  const explorer = cosmiconfig("cypress-cucumber-preprocessor", { sync: true });
  const loaded = explorer.load();
  if (loaded && loaded.config) {
    const { config } = loaded;
    if (config.nonGlobalStepDefinitions && config.step_definitions) {
      throw new Error(
        "Error! You can't have both step_definitions folder and nonGlobalStepDefinitions setup in cypress-cucumber-preprocessor configuration"
      );
    }
    if (config.nonGlobalStepDefinitions) {
      return path.resolve(
        appRoot,
        cypressOptions.integrationFolder || "cypress/integration"
      );
    }
    if (config.step_definitions) {
      return path.resolve(appRoot, config.step_definitions);
    }
  }

  // XXX Deprecated, left here for backward compability

  if (cypressOptions && cypressOptions.fileServerFolder) {
    return `${cypressOptions.fileServerFolder}/support/step_definitions`;
  }

  return `${appRoot}/cypress/support/step_definitions`;
};
