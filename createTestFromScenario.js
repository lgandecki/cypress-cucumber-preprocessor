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
 * Gives us a chance to override the tags from within our cypress-cucumber-preprocessor test suite. (Sorry, bit hacky!)
 * We can override by setting our first Background step as:
 *   `Given I pass the CLI option '(.+)'`
 * ...where `(.+)` is something like `--tags ~@ignore`
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

const explicitTagRequired = tagsConfig => tagsConfig.only.length > 0;

/**
 * User wants to explicitly run only these scenarios, e.g. `--tags @smoke-tests`
 */
const scenarioFailsExplicitTagCheck = (
  tagsConfig,
  scenarioTags,
  featureTags
) => {
  if (!explicitTagRequired(tagsConfig)) {
    return false;
  }
  const scenarioTagNames = scenarioTags.map(scenarioTag => scenarioTag.name);
  const scenarioSatisfiesTagCheck = tagsConfig.only.reduce(
    (soFarSoGood, requiredTag) =>
      // scenario may pass one tag check but fail another, so need to keep track
      soFarSoGood &&
      // tag can be satisfied at scenario or feature level.
      // @TODO - also need to allow satisfaction via Scenario Examples
      (scenarioTagNames.includes(requiredTag) ||
        featureTags.includes(requiredTag)),
    true // start value for `soFarSoGood`
  );
  return !scenarioSatisfiesTagCheck;
};

const createTestFromScenario = (scenario, backgroundSection, featureTags) => {
  const tagsConfig = deriveTagConfig(backgroundSection);

  if (
    featureFileExplicitlyIgnored(tagsConfig, featureTags) ||
    scenarioExplicitlyIgnored(tagsConfig, scenario.tags) ||
    scenarioFailsExplicitTagCheck(tagsConfig, scenario.tags, featureTags)
  ) {
    // console.info(`Skipping Scenario: ${scenario.name}`);
    return;
  }

  if (scenario.examples) {
    scenario.examples.forEach(example => {
      if (
        scenarioExplicitlyIgnored(tagsConfig, example.tags) ||
        scenarioFailsExplicitTagCheck(tagsConfig, example.tags, featureTags)
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
