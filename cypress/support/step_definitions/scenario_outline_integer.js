/* global Then, When */

// you can have external state, and also require things!
let sum = 0;

When("I add {int} and {int}", (a, b) => {
  sum = a + b;
});

Then("I verify that the result is equal the {int}", (result) => {
  expect(sum).to.equal(result);
});
