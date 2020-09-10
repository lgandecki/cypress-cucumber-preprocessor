/* global Then, when */

// you can have external state, and also require things!
let sum = 0;

when("I add {int} and {int}", (a, b) => {
  sum = a + b;
});

Then("I verify that the result is equal the {int}", result => {
  expect(sum).to.equal(result);
});
