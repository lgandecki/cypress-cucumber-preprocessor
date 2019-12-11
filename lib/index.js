/* eslint-disable no-eval */
const fs = require("fs");
const through = require("through");
const browserify = require("@cypress/browserify-preprocessor");
const log = require("debug")("cypress:cucumber");
const chokidar = require("chokidar");
const compile = require("./loader.js");
const compileFeatures = require("./featuresLoader.js");
const stepDefinitionPath = require("./stepDefinitionPath.js");
const cypressOptions = require("./cypressOptions");

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

const preprocessor = (
  cypressConfig,
  options = browserify.defaultOptions
) => async file => {
  let browserifyOptions = options;
  // Mapping of arguments to enable backward compatibility
  if (arguments.length === 1 && cypressConfig.browserifyOptions) {
    browserifyOptions = cypressConfig;
    // eslint-disable-next-line
    console.warn("Not passing cypress config to cucumber preprocessor will result in default values to be used.");
  } else {
    cypressOptions.set(cypressConfig);
  }

  if (options.browserifyOptions.transform.indexOf(transform) === -1) {
    options.browserifyOptions.transform.unshift(transform);
  }

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
  return browserify(browserifyOptions)(file);
};

module.exports = {
  default: preprocessor,
  transform
};
