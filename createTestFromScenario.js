/* eslint-disable prefer-template */
const { resolveAndRunStepDefinition } = require("./resolveStepDefinition");

const stepTest = function(stepDetails) {
  cy.log(`${stepDetails.keyword} ${stepDetails.text}`);
  resolveAndRunStepDefinition.call(this, stepDetails);
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

      exampleValues.forEach((_, index) => {
        // eslint-disable-next-line prefer-arrow-callback
        it(`${scenario.name} (example #${index + 1})`, function() {
          if (backgroundSection) {
            backgroundSection.steps.forEach(step => {
              stepTest.call(this, step);
            });
          }

          scenario.steps.forEach(step => {
            const newStep = Object.assign({}, step);
            Object.entries(exampleValues[index]).forEach(column => {
              if (newStep.text.includes("<" + column[0] + ">")) {
                newStep.text = newStep.text.replace(
                  "<" + column[0] + ">",
                  column[1]
                );
              }
            });

            stepTest.call(this, newStep);
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
