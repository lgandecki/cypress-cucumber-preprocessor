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

const overrideStep = (step, exampleValue) => {
  const newStep = Object.assign({}, step);
  Object.entries(exampleValue).forEach(column => {
    if (newStep.text.includes("<" + column[0] + ">")) {
      newStep.text = newStep.text.replace("<" + column[0] + ">", column[1]);
    }
  });
  return newStep;
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

const explicitTagRequired = tagsConfig => tagsConfig.only.length > 0;

/**
 * Given we have passed `--tags @ci`
 * If we have a Scenario Outline, and within it we have an Examples block
 * And the Examples block is tagged `@ci`
 * Then the Example block satisfies the tag requirements
 */
const atLeastOneExampleSatisfiesTagCheck = (requiredTag, scenario) => {
  if (!scenario.examples) {
    return false;
  }
  let satisfies = false;
  scenario.examples.forEach(example => {
    const exampleTagNames = example.tags.map(exampleTag => exampleTag.name);
    if (!satisfies) {
      satisfies = exampleTagNames.includes(requiredTag);
    }
  });
  return satisfies;
};

/**
 * User wants to explicitly run only these scenarios, e.g. `--tags @smoke-tests`
 */
const scenarioFailsExplicitTagCheck = (tagsConfig, scenario) => {
  const scenarioTagNames = scenario.tags.map(scenarioTag => scenarioTag.name);
  const scenarioSatisfiesTagCheck = tagsConfig.only.reduce(
    (soFarSoGood, requiredTag) =>
      // scenario may pass one tag check but fail another, so need to keep track
      soFarSoGood &&
      // tag can be satisfied at feature, scenario or example level
      (scenarioTagNames.includes(requiredTag) || // scenario level satisfaction
        atLeastOneExampleSatisfiesTagCheck(requiredTag, scenario)), // example level satisfaction
    true // start value for `soFarSoGood`
  );
  return !scenarioSatisfiesTagCheck;
};

/**
 * Children inherit tags from their parents, e.g.
 * A Feature tagged @ci should have that tag apply to its Scenarios
 * See https://docs.cucumber.io/cucumber/api/#tag-inheritance
 */
const inheritTags = (scenario, featureTags = []) => {
  /* eslint-disable no-param-reassign */
  scenario.tags = featureTags.concat(scenario.tags);
  if (scenario.examples) {
    scenario.examples.forEach(example => {
      example.tags = scenario.tags.concat(example.tags);
    });
  }
  /* eslint-enable no-param-reassign */
};

const runTest = ({
  scenarioName,
  scenario,
  backgroundSection,
  stepOverride = step => step
}) => {
  it(scenarioName, () => {
    if (backgroundSection) {
      backgroundSection.steps.forEach(stepTest);
    }
    scenario.steps.forEach(step => stepTest(stepOverride(step)));
  });
};

const tagsValidate = (scenario, tagsConfig) =>
  !(
    scenarioExplicitlyIgnored(tagsConfig, scenario.tags) ||
    (explicitTagRequired(tagsConfig) &&
      scenarioFailsExplicitTagCheck(tagsConfig, scenario))
  );

const createTestFromScenario = (scenario, backgroundSection, featureTags) => {
  inheritTags(scenario, featureTags);
  const tagsConfig = deriveTagConfig(backgroundSection);
  const testConfig = {
    scenarioName: scenario.name,
    scenario,
    backgroundSection
  };

  if (!scenario.examples) {
    if (tagsValidate(scenario, tagsConfig)) {
      runTest(testConfig);
    }
  } else {
    scenario.examples.forEach(example => {
      getExampleValues(example).forEach((exampleValue, index) => {
        if (tagsValidate(example, tagsConfig)) {
          const exampleTestConfig = Object.assign(testConfig, {
            scenarioName: `${scenario.name} (example #${index + 1})`,
            stepOverride: step => overrideStep(step, exampleValue)
          });
          runTest(exampleTestConfig);
        }
      });
    });
  }
};

module.exports = {
  createTestFromScenario
};
