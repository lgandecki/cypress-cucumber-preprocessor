/* eslint-disable prefer-template */
const statuses = require("cucumber/lib/status").default;
const {
  resolveStepDefinition,
  resolveAndRunStepDefinition,
  resolveAndRunBeforeHooks,
  resolveAndRunAfterHooks,
} = require("./resolveStepDefinition");
const { generateCucumberJson } = require("./cukejson/generateCucumberJson");

const replaceParameterTags = (rowData, text) =>
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
        .then(() =>
          resolveAndRunAfterHooks.call(this, scenario.tags, state.feature.name)
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

    const failHandler = (err) => {
      Cypress.off("fail", failHandler);
      testState.onFail(err);
      throw err;
    };

    Cypress.on("fail", failHandler);
  });

  allScenarios.forEach((section) => {
    if (section.examples) {
      section.examples.forEach((example) => {
        const exampleValues = [];
        const exampleLocations = [];

        example.tableBody.forEach((row, rowIndex) => {
          exampleLocations[rowIndex] = row.location;
          example.tableHeader.cells.forEach((header, headerIndex) => {
            exampleValues[rowIndex] = {
              ...exampleValues[rowIndex],
              [header.value]: row.cells[headerIndex].value,
            };
          });
        });

        exampleValues.forEach((rowData, index) => {
          // eslint-disable-next-line prefer-arrow-callback
          const scenarioName = replaceParameterTags(rowData, section.name);
          const uniqueScenarioName = `${scenarioName} (example #${index + 1})`;
          const exampleSteps = section.steps.map((step) => {
            const newStep = { ...step };
            newStep.text = replaceParameterTags(rowData, newStep.text);
            return newStep;
          });

          const stepsToRun = backgroundSection
            ? backgroundSection.steps.concat(exampleSteps)
            : exampleSteps;

          const scenarioExample = {
            ...section,
            name: uniqueScenarioName,
            example: exampleLocations[index],
          };

          runTest.call(this, scenarioExample, stepsToRun, rowData);
        });
      });
    } else {
      const stepsToRun = backgroundSection
        ? backgroundSection.steps.concat(section.steps)
        : section.steps;

      runTest.call(this, section, stepsToRun);
    }
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
};

module.exports = {
  createTestFromScenarios,
};
