/* eslint-disable no-eval */
const fs = require("fs");
const through = require("through");
const browserify = require("@cypress/browserify-preprocessor");
const log = require("debug")("cypress:cucumber");
const chokidar = require("chokidar");
const compile = require("./loader.js");
const compileFeatures = require("./featuresLoader.js");
const stepDefinitionPath = require("./stepDefinitionPath.js");

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

// Include our transform in Browserify options
const wrapOptions = options => {
  let wrappedTransform;
  if (
    !options.browserifyOptions ||
    !Array.isArray(options.browserifyOptions.transform)
  ) {
    wrappedTransform = [transform];
  } else if (!options.browserifyOptions.transform.includes(transform)) {
    wrappedTransform = [transform, ...options.browserifyOptions.transform];
  } else {
    wrappedTransform = options.browserifyOptions.transform;
  }

  return {
    ...options,
    browserifyOptions: {
      ...(options.browserifyOptions || {}),
      transform: wrappedTransform
    }
  };
};

const preprocessor = (options = browserify.defaultOptions) => {
  if (typeof options !== "object") {
    throw new Error("Preprocessor options must be an object");
  }

  const wrappedOptions = wrapOptions(options);

  return async file => {
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
    return browserify(wrappedOptions)(file);
  };
};

module.exports = {
  default: preprocessor,
  transform
};
