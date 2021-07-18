/* global Given, Then */

let counter = 0;

Given("counter is incremented", () => {
  counter += 1;
});

Then("counter equals {int}", (value) => {
  expect(counter).to.equal(value);
});
