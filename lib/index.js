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

  // this callback simulates the behaviour of webpack async loader
  // and it's the way to make compatible with browserify transform
  // See https://webpack.js.org/api/loaders/#asynchronous-loaders
  function asyncCallback(error, testData) {
    if (error) {
      throw error;
    }
    return testData;
  }

  async function end() {
    if (file.match(".features$")) {
      log("compiling features ", file);
      const specFileContent = await compileFeatures.call(
        { async: () => asyncCallback, resourcePath: file },
        [data]
      );
      this.queue(specFileContent);
    } else if (file.match(".feature$")) {
      log("compiling feature ", file);
      const specFileContent = await compile.call(
        { async: () => asyncCallback, resourcePath: file },
        [data]
      );
      this.queue(specFileContent);
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
