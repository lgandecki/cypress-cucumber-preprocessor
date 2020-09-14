const path = require("path");
const fs = require("fs");
const { getConfig } = require("./getConfig");

module.exports = () => {
  const appRoot = process.cwd();
  const config = getConfig();
  if (config) {
    // left for backward compability, but we need the consistency with other configuration options
    const confStepDefinitions = config.step_definitions
      ? config.step_definitions
      : config.stepDefinitions;

    if (config.nonGlobalStepDefinitions) {
      const relativePath =
        confStepDefinitions || `cypress${path.sep}integration`;
      const stepsPath = path.resolve(appRoot, relativePath);

      if (!fs.existsSync(stepsPath)) {
        throw new Error(
          `We've tried to resolve your step definitions at ${relativePath}, but that doesn't seem to exist. As of version 2.0.0 it's required to set step_definitions in your cypress-cucumber-preprocessor configuration. Look for nonGlobalStepDefinitions and add stepDefinitions right next to it. It should match your cypress configuration has set for integrationFolder. We no longer rely on getting information from that file as it was unreliable and problematic across Linux/MacOS/Windows especially since the config file could have been passed as an argument to cypress.`
        );
      }
      return stepsPath;
    }
    if (confStepDefinitions) {
      return path.resolve(appRoot, confStepDefinitions);
    }
  }

  return `${appRoot}/cypress/support/step_definitions`;
};
