const log = require("debug")("cypress:cucumber");
const path = require("path");
const { Parser } = require("gherkin");
const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
const { cucumberTemplate } = require("./cucumberTemplate");
const { getCucumberJsonConfig } = require("./getCucumberJsonConfig");
const { createTestTemplateFromFeature } = require("./createTestsFromFeature");

// This is the template for the file that we will send back to cypress instead of the text of a
// feature file
const createCucumber = (
  filePath,
  cucumberJson,
  spec,
  toRequire,
  parsedFeature
) =>
  `
  ${cucumberTemplate}

  window.cucumberJson = ${JSON.stringify(cucumberJson)};
  describe(\`${parsedFeature.name}\`, function() {
    ${toRequire.join("\n")}
    ${createTestTemplateFromFeature(filePath, spec, parsedFeature)};
  });
  `;

// eslint-disable-next-line func-names
module.exports = function (spec, filePath = this.resourcePath) {
  log("compiling", spec);
  const stepDefinitionsToRequire = getStepDefinitionsPaths(filePath).map(
    (sdPath) => `require('${sdPath}')`
  );

  const parsedFeature = new Parser().parse(spec.toString()).feature;
  return createCucumber(
    path.basename(filePath),
    getCucumberJsonConfig(),
    spec,
    stepDefinitionsToRequire,
    parsedFeature
  );
};
