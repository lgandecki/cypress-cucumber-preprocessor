const log = require("debug")("cypress:cucumber");
const path = require("path");
const { Parser } = require("gherkin");
const jsStringEscape = require("js-string-escape");
const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
const { cucumberTemplate } = require("./cucumberTemplate");
const { getCucumberJsonConfig } = require("./getCucumberJsonConfig");
const cypressExecutionInstance = require("./cypressExecutionInstance");

// This is the template for the file that we will send back to cypress instead of the text of a
// feature file
const createCucumber = (filePath, cucumberJson, spec, toRequire, name) =>
  `
  ${cucumberTemplate}
  
  window.cucumberJson = ${JSON.stringify(cucumberJson)};
  describe(\`${name}\`, function() {
    ${toRequire.join("\n")}
    createTestsFromFeature('${filePath}', \`${jsStringEscape(spec)}\`);
  });
  `;

// eslint-disable-next-line func-names
module.exports = async function(spec, filePath = this.resourcePath) {
  const callback = this.async();
  try {
    await cypressExecutionInstance.load();

    const stepDefinitionsToRequire = getStepDefinitionsPaths(filePath).map(
      sdPath => `require('${sdPath}')`
    );
    const { name } = new Parser().parse(spec.toString()).feature;
    const specFileContent = createCucumber(
      path.basename(filePath),
      getCucumberJsonConfig(),
      spec,
      stepDefinitionsToRequire,
      name
    );

    log("compiling", spec);
    callback(null, specFileContent);
  } catch (error) {
    callback(error);
  }
};
