const path = require("path");

module.exports = {
  getStepDefinitionPathsFrom: (filePath) =>
    filePath.replace(path.extname(filePath), ""),
};
