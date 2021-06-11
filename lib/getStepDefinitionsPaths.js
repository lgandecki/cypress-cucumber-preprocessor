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
  let commonPath = `${stepDefinitionPath()}/common`;
  const defaultGlobPattern = `${stepDefinitionPath()}/**/*.+(js|ts|tsx)`;

  if (config) {
    if (config.commonPath) {
      commonPath = path.resolve(stepDefinitionPath(), config.commonPath);
    }
    const commonDefinitionsPattern = `${commonPath}/**/*.+(js|ts|tsx)`;

    if (config.nonGlobalStepDefinitions) {
      let nonGlobalPath = getStepDefinitionPathsFrom(filePath);

      if (config.integrationFolder) {
        nonGlobalPath = nonGlobalPath.replace(
          `${appRoot}/${config.integrationFolder}`,
          stepDefinitionPath()
        );
      } else {
        nonGlobalPath = `${stepDefinitionPath()}/${path.basename(
          filePath,
          path.extname(filePath)
        )}`;
      }

      const nonGlobalPattern = `${nonGlobalPath}/**/*.+(js|ts|tsx)`;

      paths = paths.concat(
        glob.sync(nonGlobalPattern),
        glob.sync(commonDefinitionsPattern)
      );
    } else {
      paths = paths.concat(
        glob.sync(commonDefinitionsPattern),
        glob.sync(defaultGlobPattern)
      );
    }
  } else {
    paths = paths.concat(glob.sync(defaultGlobPattern));
  }
  return paths;
};

module.exports = { getStepDefinitionsPaths };
