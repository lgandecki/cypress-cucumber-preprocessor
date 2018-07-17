/* eslint-disable no-eval */
const fs = require("fs");
const { EventEmitter } = require("events");
const through = require("through");
const path = require("path");
const browserify = require("@cypress/browserify-preprocessor");
const log = require("debug")("cypress:cucumber");
const glob = require("glob");
const cosmiconfig = require("cosmiconfig");

const watchers = {};

// This is the template for the file that we will send back to cypress instead of the text of a
// feature file
const createCucumber = (spec, toRequire) =>
  `
  const {resolveAndRunStepDefinition, defineParameterType, given, when, then} = require('cypress-cucumber-preprocessor/resolveStepDefinition');
  const Given = window.Given = window.given = given;
  const When = window.When = window.when = when;
  const Then = window.Then = window.then = then;
  window.defineParameterType = defineParameterType;
  const { createTestFromScenario } = require('cypress-cucumber-preprocessor/createTestFromScenario');
  const { createTestsFromFeature } = require('cypress-cucumber-preprocessor/createTestsFromFeature');
  ${eval(toRequire).join("\n")}
  const {Parser, Compiler} = require('gherkin');
  const spec = \`${spec}\`
  const gherkinAst = new Parser().parse(spec);
  
  createTestsFromFeature(gherkinAst);
  `;

const stepDefinitionPath = () => {
  const appRoot = process.cwd();

  const explorer = cosmiconfig("cypress-cucumber-preprocessor", { sync: true });
  const loaded = explorer.load();
  if (loaded && loaded.config && loaded.config.step_definitions) {
    return path.resolve(appRoot, loaded.config.step_definitions);
  }

  // XXX Deprecated, left here for backward compability
  const cypressOptions = JSON.parse(
    fs.readFileSync(`${appRoot}/cypress.json`, "utf-8")
  );
  if (cypressOptions && cypressOptions.fileServerFolder) {
    return `${cypressOptions.fileServerFolder}/support/step_definitions`;
  }

  return `${appRoot}/cypress/support/step_definitions`;
};
const createPattern = () => `${stepDefinitionPath()}/**/*.+(js|ts)`;

const pattern = createPattern();

const stepDefinitionsPaths = [].concat(glob.sync(pattern));

const compile = spec => {
  log("compiling", spec);
  const stepDefinitionsToRequire = stepDefinitionsPaths.map(
    sdPath => `require('${sdPath}')`
  );
  return createCucumber(spec, stepDefinitionsToRequire);
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
