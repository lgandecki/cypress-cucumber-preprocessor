/* eslint-disable prefer-template */
const statuses = require("cucumber").Status;
const {
  resolveAndRunStepDefinition,
  resolveAndRunBeforeHooks,
  resolveAndRunAfterHooks
} = require("./resolveStepDefinition");
const { generateCucumberJson } = require("./cukejson/generateCucumberJson");

const replaceParameterTags = (rowData, text) =>
  Object.keys(rowData).reduce(
    (value, key) => value.replace(new RegExp(`<${key}>`, "g"), rowData[key]),
    text
  );

// eslint-disable-next-line func-names
const stepTest = function(state, stepDetails, exampleRowData) {
  state.onStartStep(stepDetails);
  try {
    resolveAndRunStepDefinition.call(
      this,
      stepDetails,
      replaceParameterTags,
      exampleRowData,
      state.feature.name
    );
    state.onFinishStep(stepDetails, statuses.PASSED);
    return Cypress.Promise.resolve();
  } catch (e) {
    state.onFinishStep(stepDetails, statuses.FAILED);
    return Cypress.Promise.reject(e);
  }
};

const runTest = (scenario, stepsToRun, rowData) => {
  const indexedSteps = stepsToRun.map((step, index) =>
    Object.assign({}, step, { index })
  );

  // eslint-disable-next-line func-names
  it(scenario.name, function() {
    const state = window.testState;
    return cy
      .then(() => state.onStartScenario(scenario, indexedSteps))
      .then(() =>
        resolveAndRunBeforeHooks.call(this, scenario.tags, state.feature.name)
      )
      .then(() =>
        Cypress.Promise.each(indexedSteps, step =>
          stepTest.call(this, state, step, rowData)
        )
          .then(() => {
            resolveAndRunAfterHooks.call(
              this,
              scenario.tags,
              state.feature.name
            );
            state.onFinishScenario(scenario);
          })
          .catch(err => {
            resolveAndRunAfterHooks.call(
              this,
              scenario.tags,
              state.feature.name
            );
            return Cypress.Promise.reject(err);
          })
      );
  });
};

const cleanupFilename = s => s.split(".")[0];

const writeCucumberJsonFile = json => {
  const outputFolder =
    window.cucumberJson.outputFolder || "cypress/cucumber-json";
  const outputPrefix = window.cucumberJson.filePrefix || "";
  const outputSuffix = window.cucumberJson.fileSuffix || ".cucumber";
  const fileName = json[0] ? cleanupFilename(json[0].uri) : "empty";
  const outFile = `${outputFolder}/${outputPrefix}${fileName}${outputSuffix}.json`;
  cy.writeFile(outFile, json, { log: false });
};

const createTestFromScenarios = (
  scenariosToRun,
  backgroundSection,
  testState
) => {
  // eslint-disable-next-line func-names, prefer-arrow-callback
  before(function() {
    cy.then(() => testState.onStartTest());
  });

  // ctx is cleared between each 'it'
  // eslint-disable-next-line func-names, prefer-arrow-callback
  beforeEach(function() {
    window.testState = testState;

    const failHandler = err => {
      Cypress.off("fail", failHandler);
      testState.onFail(err);
      throw err;
    };

    Cypress.on("fail", failHandler);
  });

  scenariosToRun.forEach(section => {
    if (section.examples) {
      section.examples.forEach(example => {
        const exampleValues = [];
        const exampleLocations = [];

        example.tableBody.forEach((row, rowIndex) => {
          exampleLocations[rowIndex] = row.location;
          example.tableHeader.cells.forEach((header, headerIndex) => {
            exampleValues[rowIndex] = Object.assign(
              {},
              exampleValues[rowIndex],
              {
                [header.value]: row.cells[headerIndex].value
              }
            );
          });
        });

        exampleValues.forEach((rowData, index) => {
          // eslint-disable-next-line prefer-arrow-callback
          const scenarioName = replaceParameterTags(rowData, section.name);
          const uniqueScenarioName = `${scenarioName} (example #${index + 1})`;
          const exampleSteps = section.steps.map(step => {
            const newStep = Object.assign({}, step);
            newStep.text = replaceParameterTags(rowData, newStep.text);
            return newStep;
          });

          const stepsToRun = backgroundSection
            ? backgroundSection.steps.concat(exampleSteps)
            : exampleSteps;

          const scenarioExample = Object.assign({}, section, {
            name: uniqueScenarioName,
            example: exampleLocations[index]
          });

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
  after(function() {
    cy.then(() => testState.onFinishTest()).then(() => {
      if (window.cucumberJson && window.cucumberJson.generate) {
        const json = generateCucumberJson(testState);
        writeCucumberJsonFile(json);
      }
    });
  });
};

module.exports = {
  createTestFromScenarios
};
