const cosmiconfig = require("cosmiconfig");

let explorer;

exports.getConfig = () => {
  if (!explorer) {
    explorer = cosmiconfig("cypress-cucumber-preprocessor", {
      sync: true,
      rcExtensions: true,
    });
  }

  const loaded = explorer.load();
  return loaded && loaded.config;
};
