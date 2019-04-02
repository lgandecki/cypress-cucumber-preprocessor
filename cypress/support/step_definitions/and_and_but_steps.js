/* global then, when, and, but */
/* eslint-env mocha */

let stepCounter = 0;
let step2Counter = 0;

when("I do something", () => {
  stepCounter += 1;
});

and("Something else", () => {
  stepCounter += 2;
});

then("I happily work", () => {
  expect(stepCounter).to.equal(3);
});

when("I dont do something", () => {
  step2Counter += 1;
});

and("it is sunday", () => {
  step2Counter += 2;
});

then("I stream on twitch", () => {
  expect(step2Counter).to.equal(3);
  step2Counter += 1;
});

but("only when not tired", () => {
  expect(step2Counter).to.equal(4);
});
