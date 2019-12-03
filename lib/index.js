/* eslint-disable no-eval */
const fs = require("fs");
const through = require("through");
const browserify = require("@cypress/browserify-preprocessor");
const log = require("debug")("cypress:cucumber");
const chokidar = require("chokidar");
const compile = require("./loader.js");
const compileFeatures = require("./featuresLoader.js");
const stepDefinitionPath = require("./stepDefinitionPath.js");
const cypressExecutionInstance = require("./cypressExecutionInstance");

const transform = file => {
  let data = "";

  function write(buf) {
    data += buf;
  }

  function end() {
    if (file.match(".features$")) {
      log("compiling features ", file);
      this.queue(compileFeatures(data, file));
    } else if (file.match(".feature$")) {
      log("compiling feature ", file);
      this.queue(compile(data, file));
    } else {
      this.queue(data);
    }
    this.queue(null);
  }

  return through(write, end);
};

const touch = filename => {
  fs.utimesSync(filename, new Date(), new Date());
};

let watcher;

const preprocessor = (options = browserify.defaultOptions) => async file => {
  if (options.browserifyOptions.transform.indexOf(transform) === -1) {
    options.browserifyOptions.transform.unshift(transform);
  }
  // load arguments from running Cypress instance
  await cypressExecutionInstance.load();

  if (file.shouldWatch) {
    if (watcher) {
      watcher.close();
    }
    watcher = chokidar
      .watch([`${stepDefinitionPath()}*.js`, `${stepDefinitionPath()}*.ts`], {
        ignoreInitial: true
      })
      .on("all", () => {
        touch(file.filePath);
      });
  }
  return browserify(options)(file);
};

module.exports = {
  default: preprocessor,
  transform
};
