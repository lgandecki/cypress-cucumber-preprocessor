/* eslint-disable no-eval */
const fs = require("fs");
const through = require("through");
const browserify = require("@cypress/browserify-preprocessor");
const log = require("debug")("cypress:cucumber");
const chokidar = require("chokidar");
const compile = require("./loader.js");
const stepDefinitionPath = require("./stepDefinitionPath.js");

const transform = file => {
  let data = "";

  function write(buf) {
    data += buf;
  }

  function end() {
    if (file.match(".feature$")) {
      log("compiling feature ", file);
      this.queue(compile(data));
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
const preprocessor = (options = browserify.defaultOptions) => file => {
  if (options.browserifyOptions.transform.indexOf(transform) === -1) {
    options.browserifyOptions.transform.unshift(transform);
  }

  if (file.shouldWatch) {
    if (watcher) {
      watcher.close();
    }
    watcher = chokidar
      .watch(stepDefinitionPath(), { ignoreInitial: true })
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
