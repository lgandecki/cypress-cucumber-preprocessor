/* eslint-disable no-eval */
const fs = require("fs");
const { EventEmitter } = require("events");
const through = require("through");

const browserify = require("@cypress/browserify-preprocessor");

const log = require("debug")("cypress:cucumber");
const glob = require("glob");

const watchers = {};

// This is the template for the file that we will send back to cypress instead of the text of a
// feature file
const createCucumber = (spec, definitions) =>
  `
  const {resolveAndRunStepDefinition, given, when, then} = require('cypress-cucumber-preprocessor/resolveStepDefinition');
  const { createTestFromScenario } = require('cypress-cucumber-preprocessor/createTestFromScenario');
  const { createTestsFromFeature } = require('cypress-cucumber-preprocessor/createTestsFromFeature');
  ${eval(definitions).join("\n")}
  const {Parser, Compiler} = require('gherkin');
  const spec = \`${spec}\`
  const gherkinAst = new Parser().parse(spec);
  
  createTestsFromFeature(gherkinAst);
  `;

const createPattern = () => {
  const appRoot = process.cwd();
  return `${appRoot}/cypress/support/step_definitions/**/*.js`;
};

const pattern = createPattern();

const stepDefinitionsPaths = [].concat(glob.sync(pattern));

const compile = spec => {
  log("compiling", spec);

  const definitions = [];
  stepDefinitionsPaths.forEach(path => {
    definitions.push(
      `{ ${fs
        .readFileSync(path)
        .toString()
        .replace(
          "cypress-cucumber-preprocessor",
          "cypress-cucumber-preprocessor/resolveStepDefinition"
        )}}`
    );
  });

  return createCucumber(spec, JSON.stringify(definitions));
};

const touch = filename => {
  fs.utimesSync(filename, new Date(), new Date());
};

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

const preprocessor = (options = browserify.defaultOptions) => file => {
  if (options.browserifyOptions.transform.indexOf(transform) === -1) {
    options.browserifyOptions.transform.unshift(transform);
  }

  if (file.shouldWatch) {
    stepDefinitionsPaths.forEach(stepPath => {
      if (watchers[stepPath] === undefined) {
        const stepFile = new EventEmitter();
        stepFile.filePath = stepPath;

        const bundleDir = file.outputPath.split("/").slice(0, -2);
        const outputName = stepPath.split("/").slice(-3);
        stepFile.outputPath = bundleDir.concat(outputName).join("/");
        stepFile.shouldWatch = file.shouldWatch;

        stepFile.on("rerun", () => {
          touch(file.filePath);
        });
        watchers[stepPath] = browserify(options)(stepFile);
      } else {
        log(`Watcher already set for ${stepPath}`);
      }
    });
  }
  return browserify(options)(file);
};

module.exports = {
  default: preprocessor,
  transform
};
