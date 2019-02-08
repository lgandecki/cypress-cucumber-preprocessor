/* eslint-disable prefer-template */
const { resolveAndRunStepDefinition } = require("./resolveStepDefinition");

const replaceParameterTags = (rowData, text) =>
  Object.keys(rowData).reduce(
    (value, key) => value.replace(`<${key}>`, rowData[key]),
    text
  );

const stepTest = function(stepDetails, exampleRowData) {
  cy.log(`${stepDetails.keyword} ${stepDetails.text}`);
  resolveAndRunStepDefinition.call(
    this,
    stepDetails,
    replaceParameterTags,
    exampleRowData
  );
};

const createTestFromScenario = (scenario, backgroundSection) => {
  if (scenario.examples) {
    scenario.examples.forEach(example => {
      const exampleValues = [];

      example.tableBody.forEach((row, rowIndex) => {
        example.tableHeader.cells.forEach((header, headerIndex) => {
          exampleValues[rowIndex] = Object.assign({}, exampleValues[rowIndex], {
            [header.value]: row.cells[headerIndex].value
          });
        });
      });

      exampleValues.forEach((rowData, index) => {
        // eslint-disable-next-line prefer-arrow-callback
        const scenarioName = replaceParameterTags(rowData, scenario.name);
        it(`${scenarioName} (example #${index + 1})`, function() {
          if (backgroundSection) {
            backgroundSection.steps.forEach(step => {
              stepTest.call(this, step);
            });
          }

          scenario.steps.forEach(step => {
            const newStep = Object.assign({}, step);
            newStep.text = replaceParameterTags(rowData, newStep.text);

            stepTest.call(this, newStep, rowData);
          });
        });
      });
    });
  } else {
    it(scenario.name, function() {
      if (backgroundSection) {
        backgroundSection.steps.forEach(step => stepTest.call(this, step));
      }
      scenario.steps.forEach(step => stepTest.call(this, step));
    });
  }
};

module.exports = {
  createTestFromScenario
};
