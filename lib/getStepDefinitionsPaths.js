const path = require("path");
const glob = require("glob");
const process = require("process");
const { getConfig } = require("./getConfig");
const stepDefinitionPath = require("./stepDefinitionPath.js");
const { getStepDefinitionPathsFrom } = require("./getStepDefinitionPathsFrom");

const getStepDefinitionsPaths = (filePath) => {
  const appRoot = process.cwd();
  let paths = [];
  const config = getConfig();
  if (config && config.nonGlobalStepDefinitions) {
    let nonGlobalPath = getStepDefinitionPathsFrom(filePath);
    let commonPath = config.commonPath || `${stepDefinitionPath()}/common/`;

    if (config.commonPath) {
      commonPath = path.resolve(appRoot, commonPath);
    }

    if (config.nonGlobalStepBaseDir) {
      const stepBase = `${appRoot}/${config.nonGlobalStepBaseDir}`;
      nonGlobalPath = nonGlobalPath.replace(stepDefinitionPath(), stepBase);
      commonPath = `${stepBase}/${config.commonPath || "common/"}`;
    }

    const nonGlobalPattern = `${nonGlobalPath}/**/*.+(js|ts)`;

    const commonDefinitionsPattern = `${commonPath}**/*.+(js|ts)`;
    paths = paths.concat(
      glob.sync(nonGlobalPattern),
      glob.sync(commonDefinitionsPattern)
    );
  } else {
    const pattern = `${stepDefinitionPath()}/**/*.+(js|ts)`;
    paths = paths.concat(glob.sync(pattern));
  }
  return paths;
};

module.exports = { getStepDefinitionsPaths };
