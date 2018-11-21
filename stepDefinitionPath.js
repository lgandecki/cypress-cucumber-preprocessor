const fs = require("fs");
const path = require("path");
const cosmiconfig = require("cosmiconfig");

module.exports = () => {
  const appRoot = process.cwd();

  const explorer = cosmiconfig("cypress-cucumber-preprocessor", { sync: true });
  const loaded = explorer.load();
  if (loaded && loaded.config && loaded.config.step_definitions) {
    return path.resolve(appRoot, loaded.config.step_definitions);
  }

  // XXX Deprecated, left here for backward compability
  const cypressOptions = JSON.parse(
    fs.readFileSync(`${appRoot}/cypress.json`, "utf-8")
  );
  if (cypressOptions && cypressOptions.fileServerFolder) {
    return `${cypressOptions.fileServerFolder}/support/step_definitions`;
  }

  return `${appRoot}/cypress/support/step_definitions`;
};
