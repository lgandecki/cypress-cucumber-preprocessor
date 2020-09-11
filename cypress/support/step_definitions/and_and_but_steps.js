/* global Then, When, And, But */
/* eslint-env mocha */

let stepCounter = 0;
let step2Counter = 0;

When("I do something", () => {
  stepCounter += 1;
});

And("Something else", () => {
  stepCounter += 2;
});

Then("I happily work", () => {
  expect(stepCounter).to.equal(3);
});

When("I dont do something", () => {
  step2Counter += 1;
});

And("it is sunday", () => {
  step2Counter += 2;
});

Then("I stream on twitch", () => {
  expect(step2Counter).to.equal(3);
  step2Counter += 1;
});

But("only when not tired", () => {
  expect(step2Counter).to.equal(4);
});
