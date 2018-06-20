/* eslint-disable prefer-template */
const { resolveAndRunStepDefinition } = require("./resolveStepDefinition");
const { getTags } = require("./getTags");

const stepTest = stepDetails => {
  cy.log(`${stepDetails.keyword} ${stepDetails.text}`);
  resolveAndRunStepDefinition(stepDetails);
};

const getExampleValues = example => {
  const exampleValues = [];
  example.tableBody.forEach((row, rowIndex) => {
    example.tableHeader.cells.forEach((header, headerIndex) => {
      exampleValues[rowIndex] = Object.assign({}, exampleValues[rowIndex], {
        [header.value]: row.cells[headerIndex].value
      });
    });
  });
  return exampleValues;
};

/**
 * Gives us a chance to override the tags from within our cypress-cucumber-preprocessor test suite.
 * (Sorry, bit hacky!)
 * Otherwise uses CLI args from the process.
 */
const deriveTagConfig = backgroundSection => {
  if (backgroundSection && backgroundSection.steps.length >= 1) {
    const isInternalTest = backgroundSection.steps[0].text.match(
      /I pass the CLI option '(.+)'/
    );
    if (isInternalTest) {
      return getTags(isInternalTest[0]);
    }
  }
  return getTags();
};

/**
 * User wants to ignore scenario, e.g. `--tags ~@ignore`
 */
const scenarioExplicitlyIgnored = (tagsConfig, scenarioTags) => {
  let ignore = false;
  scenarioTags.forEach(scenarioTag => {
    tagsConfig.ignore.forEach(tagToIgnore => {
      if (scenarioTag.name === tagToIgnore) {
        ignore = true;
      }
    });
  });
  return ignore;
};
/**
 * User wants to ignore feature, e.g. `--tags ~@ignore`
 */
const featureFileExplicitlyIgnored = scenarioExplicitlyIgnored;

/**
 * User wants to explicitly run only these scenarios, e.g. `--tags @smoke-tests`
 */
const scenarioMustBeExplicitlyTagged = (
  tagsConfig,
  scenarioTags,
  featureTags
) => {
  if (tagsConfig.only.length === 0) {
    return false;
  }
  const scenarioTagNames = scenarioTags.map(scenarioTag => scenarioTag.name);
  let doesNotValidate = false;
  tagsConfig.only.forEach(requiredTag => {
    if (
      !scenarioTagNames.includes(requiredTag) &&
      !featureTags.includes(requiredTag)
    ) {
      doesNotValidate = true;
    }
  });
  return doesNotValidate;
};

const createTestFromScenario = (scenario, backgroundSection, featureTags) => {
  const scenarioTags = scenario.tags;
  const tagsConfig = deriveTagConfig(backgroundSection);

  if (
    featureFileExplicitlyIgnored(tagsConfig, featureTags) ||
    scenarioExplicitlyIgnored(tagsConfig, scenarioTags) ||
    scenarioMustBeExplicitlyTagged(tagsConfig, scenarioTags, featureTags)
  ) {
    // console.info(`Skipping Scenario: ${scenario.name}`);
    return;
  }

  if (scenario.examples) {
    scenario.examples.forEach(example => {
      if (
        scenarioExplicitlyIgnored(tagsConfig, example.tags) ||
        scenarioMustBeExplicitlyTagged(tagsConfig, example.tags, featureTags)
      ) {
        return;
      }

      getExampleValues(example).forEach((exampleValue, index) => {
        it(`${scenario.name} (example #${index + 1})`, () => {
          if (backgroundSection) {
            backgroundSection.steps.forEach(stepTest);
          }
          scenario.steps.forEach(step => {
            const newStep = Object.assign({}, step);
            Object.entries(exampleValue).forEach(column => {
              if (newStep.text.includes("<" + column[0] + ">")) {
                newStep.text = newStep.text.replace(
                  "<" + column[0] + ">",
                  column[1]
                );
              }
            });
            stepTest(newStep);
          });
        });
      });
    });
  } else {
    it(scenario.name, () => {
      if (backgroundSection) {
        backgroundSection.steps.forEach(stepTest);
      }
      scenario.steps.forEach(step => stepTest(step));
    });
  }
};

module.exports = {
  createTestFromScenario
};
