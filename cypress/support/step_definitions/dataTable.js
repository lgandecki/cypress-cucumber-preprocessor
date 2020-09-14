// eslint-disable-next-line import/no-extraneous-dependencies
const { Given, When, Then } = require("cypress-cucumber-preprocessor/steps");

// you can have external state, and also require things!
let sum = 0;

When("I add all following numbers:", (dataTable) => {
  // console.log("a, ", dataTable.rawTable.slice(1))
  sum = dataTable.rawTable
    .slice(1)
    .reduce(
      (rowA, rowB) =>
        rowA.reduce((a, b) => parseInt(a, 10) + parseInt(b, 10)) +
        rowB.reduce((a, b) => parseInt(a, 10) + parseInt(b, 10))
    );
});

Then("I verify the datatable result is equal to {int}", (result) => {
  expect(sum).to.equal(result);
});

Given("I have a table with some escaped characters in it", (dataTable) => {
  // eslint-disable-next-line no-console
  console.log(dataTable);
  // we don't need to do anything, just make sure it doesn't break
});
