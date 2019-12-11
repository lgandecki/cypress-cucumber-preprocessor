const path = require("path");
const cosmiconfig = require("cosmiconfig");
const cypressOptions = require("./cypressOptions");

module.exports = () => {
  const appRoot = process.cwd();

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
        cypressOptions.get("integrationFolder") || "cypress/integration"
      );
    }
    if (config.step_definitions) {
      return path.resolve(appRoot, config.step_definitions);
    }
  }

  // XXX Deprecated, left here for backward compability

  if (cypressOptions.get("fileServerFolder")) {
    return `${cypressOptions.get("fileServerFolder")}/support/step_definitions`;
  }

  return `${appRoot}/cypress/support/step_definitions`;
};
