/* eslint-disable prefer-template */
const statuses = require("cucumber/lib/status").default;
const {
  resolveStepDefinition,
  resolveAndRunStepDefinition,
  resolveAndRunBeforeHooks,
  resolveAndRunAfterHooks,
} = require("./resolveStepDefinition");
const { generateCucumberJson } = require("./cukejson/generateCucumberJson");
const { shouldProceedCurrentStep, getEnvTags } = require("./tagsHelper");
const { flattenArray } = require("./genericHelper");

const replaceParameterTags = (text, rowData) =>
  Object.keys(rowData).reduce(
    (value, key) => value.replace(new RegExp(`<${key}>`, "g"), rowData[key]),
    text
  );

// eslint-disable-next-line func-names
const stepTest = function (state, stepDetails, exampleRowData) {
  const step = resolveStepDefinition.call(
    this,
    stepDetails,
    state.feature.name
  );
  cy.then(() => state.onStartStep(stepDetails))
    .then((step && step.config) || {}, () =>
      resolveAndRunStepDefinition.call(
        this,
        stepDetails,
        replaceParameterTags,
        exampleRowData,
        state.feature.name
      )
    )
    .then(() => state.onFinishStep(stepDetails, statuses.PASSED));
};

const runTest = (scenario, stepsToRun, rowData) => {
  const indexedSteps = stepsToRun.map((step, index) => ({ ...step, index }));

  // should we actually run this scenario
  // or just mark it as skipped
  if (scenario.shouldRun) {
    // eslint-disable-next-line func-names
    it(scenario.name, function () {
      const state = window.testState;
      return cy
        .then(() => state.onStartScenario(scenario, indexedSteps))
        .then(() =>
          resolveAndRunBeforeHooks.call(this, scenario.tags, state.feature.name)
        )
        .then(() =>
          indexedSteps.forEach((step) =>
            stepTest.call(this, state, step, rowData)
          )
        )
        .then(() => state.onFinishScenario(scenario));
    });
  } else {
    // eslint-disable-next-line func-names,prefer-arrow-callback
    it(scenario.name, function () {
      // register this scenario with the cucumber data collector
      // but don't run it
      // Tell mocha this is a skipped test so it also shows correctly in Cypress
      const state = window.testState;
      cy.then(() => state.onStartScenario(scenario, indexedSteps))
        .then(() => state.onFinishScenario(scenario))
        // eslint-disable-next-line func-names
        .then(function () {
          return this.skip();
        });
    });
  }
};

const cleanupFilename = (s) => s.split(".")[0];

const writeCucumberJsonFile = (json) => {
  const outputFolder =
    window.cucumberJson.outputFolder || "cypress/cucumber-json";
  const outputPrefix = window.cucumberJson.filePrefix || "";
  const outputSuffix = window.cucumberJson.fileSuffix || ".cucumber";
  const fileName = json[0] ? cleanupFilename(json[0].uri) : "empty";
  const outFile = `${outputFolder}/${outputPrefix}${fileName}${outputSuffix}.json`;
  cy.writeFile(outFile, json, { log: false });
};

const convertExamplesToScenarios = (scenario) => {
  let counter = 0;
  const hasEnvTags = !!getEnvTags();

  return flattenArray(
    scenario.examples.map((example) => {
      const exampleTags = [...example.tags, ...scenario.tags];

      return example.tableBody
        .map((row) => ({
          rowLocation: row.location,
          rowData: Object.fromEntries(
            example.tableHeader.cells.map((header, headerIndex) => [
              header.value,
              row.cells[headerIndex].value,
            ])
          ),
        }))
        .map(({ rowLocation, rowData }) => {
          counter += 1;
          const scenarioName = replaceParameterTags(scenario.name, rowData);

          return {
            scenario: {
              ...scenario,
              name: `${scenarioName} (example #${counter})`,
              example: rowLocation,
              // tags on scenario's should be inherited by examples (https://cucumber.io/docs/cucumber/api/#tags)
              tags: exampleTags,
              shouldRun: !hasEnvTags || shouldProceedCurrentStep(exampleTags),
            },
            stepsToRun: scenario.steps.map((step) => ({
              ...step,
              text: replaceParameterTags(step.text, rowData),
            })),
            rowData,
          };
        });
    })
  );
};

const createTestFromScenarios = (
  allScenarios,
  backgroundSection,
  testState
) => {
  // eslint-disable-next-line func-names, prefer-arrow-callback
  before(function () {
    cy.then(() => testState.onStartTest());
  });

  // ctx is cleared between each 'it'
  // eslint-disable-next-line func-names, prefer-arrow-callback
  beforeEach(function () {
    window.testState = testState;

    const failHandler = (_, err) => {
      testState.onFail(err);
    };

    Cypress.mocha.getRunner().on("fail", failHandler);
  });

  flattenArray(
    allScenarios.map((scenario) =>
      scenario.examples
        ? convertExamplesToScenarios(scenario)
        : {
            scenario,
            stepsToRun: scenario.steps,
          }
    )
  ).forEach(({ scenario, stepsToRun, rowData }) => {
    const stepsToRunWithBackground = [
      ...((backgroundSection || {}).steps || []),
      ...stepsToRun,
    ];

    runTest.call(this, scenario, stepsToRunWithBackground, rowData);
  });

  // eslint-disable-next-line func-names, prefer-arrow-callback
  after(function () {
    cy.then(() => testState.onFinishTest()).then(() => {
      if (window.cucumberJson && window.cucumberJson.generate) {
        const json = generateCucumberJson(testState);
        writeCucumberJsonFile(json);
      }
    });
  });

  // eslint-disable-next-line func-names, prefer-arrow-callback
  afterEach(function () {
    if (testState.currentScenario && testState.currentScenario.shouldRun) {
      cy.then(() =>
        resolveAndRunAfterHooks.call(
          this,
          testState.currentScenario.tags,
          testState.feature.name
        )
      );
    }
  });
};

module.exports = {
  createTestFromScenarios,
  convertExamplesToScenarios,
};
