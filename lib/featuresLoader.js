const glob = require("glob");
const path = require("path");
const fs = require("fs");
const { Parser } = require("gherkin");
const log = require("debug")("cypress:cucumber");
const jsStringEscape = require("js-string-escape");

const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
const { cucumberTemplate } = require("./cucumberTemplate");
const { getCucumberJsonConfig } = require("./getCucumberJsonConfig");
const {
  isNonGlobalStepDefinitionsMode
} = require("./isNonGlobalStepDefinitionsMode");

const createCucumber = (
  specs,
  globalToRequire,
  nonGlobalToRequire,
  cucumberJson
) =>
  `
    ${cucumberTemplate}
  window.cucumberJson = ${JSON.stringify(cucumberJson)};

  var moduleCache = arguments[5];

  // Stolen from https://github.com/browserify/browserify/issues/1444
  function clearFromCache(instance)
  {
      for(var key in moduleCache)
      {
          if(moduleCache[key].exports == instance)
          {
              delete moduleCache[key];
              return;
          }
      }
      throw "could not clear instance from module cache";
  }

  ${globalToRequire.join("\n")}

  ${specs
    .map(
      ({ spec, filePath, name }) => `
        describe(\`${name}\`, function() {
        window.currentFeatureName = \`${name}\`
        ${nonGlobalToRequire &&
          nonGlobalToRequire
            .find(fileSteps => fileSteps[filePath])
            [filePath].join("\n")}
            
        createTestsFromFeature('${path.basename(filePath)}', \`${jsStringEscape(
        spec
      )}\`);
        })
        `
    )
    .join("\n")}
  `;

module.exports = function(_, filePath = this.resourcePath) {
  log("compiling", filePath);

  const features = glob.sync(`${path.dirname(filePath)}/**/*.feature`);

  let globalStepDefinitionsToRequire = [];
  let nonGlobalStepDefinitionsToRequire;

  if (isNonGlobalStepDefinitionsMode()) {
    nonGlobalStepDefinitionsToRequire = features.map(featurePath => ({
      [featurePath]: getStepDefinitionsPaths(featurePath).map(
        sdPath => `clearFromCache(require('${sdPath}'))`
      )
    }));
  } else {
    globalStepDefinitionsToRequire = [
      ...new Set(
        features.reduce(
          requires =>
            requires.concat(
              getStepDefinitionsPaths(filePath).map(
                sdPath => `require('${sdPath}')`
              )
            ),
          []
        )
      )
    ];
  }

  const specs = features
    .map(featurePath => ({
      spec: fs.readFileSync(featurePath).toString(),
      filePath: featurePath
    }))
    .map(feature =>
      Object.assign({}, feature, {
        name: new Parser().parse(feature.spec.toString()).feature.name
      })
    );

  return createCucumber(
    specs,
    globalStepDefinitionsToRequire,
    nonGlobalStepDefinitionsToRequire,
    getCucumberJsonConfig()
  );
};
