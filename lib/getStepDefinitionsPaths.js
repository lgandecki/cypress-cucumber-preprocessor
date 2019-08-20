const glob = require("glob");
const path = require("path");
const cosmiconfig = require("cosmiconfig");
const stepDefinitionPath = require("./stepDefinitionPath.js");
const { getStepDefinitionPathsFrom } = require("./getStepDefinitionPathsFrom");

const getStepDefinitionsPaths = filePath => {
  let paths = [];
  const explorer = cosmiconfig("cypress-cucumber-preprocessor", { sync: true });
  const loaded = explorer.load();
  if (loaded && loaded.config) {
    if (loaded.config.nonGlobalStepDefinitions) {
      const nonGlobalPattern = `${getStepDefinitionPathsFrom(
        filePath
      )}/**/*.+(js|ts)`;

      const commonPath =
        loaded.config.commonPath || `${stepDefinitionPath()}/common/`;
      const commonDefinitionsPattern = `${commonPath}**/*.+(js|ts)`;
      paths = paths.concat(glob.sync(nonGlobalPattern));
      paths = paths.concat(glob.sync(commonDefinitionsPattern));
    }
    if (loaded.config.stepDefinitionsAtTestRoot) {
      const testRootPattern = `${path.dirname(
        filePath
      )}/step_definitions/**/*.+(js|ts)`;
      paths = paths.concat(glob.sync(testRootPattern));
    }
  } else {
    const pattern = `${stepDefinitionPath()}/**/*.+(js|ts)`;
    paths = paths.concat(glob.sync(pattern));
  }
  return paths;
};

module.exports = { getStepDefinitionsPaths };
