/* global defineStep */

let storedValue = 0;

defineStep("I set the value to {int}", (value) => {
  storedValue = value;
});

defineStep("The value equals {int}", (expectedValue) => {
  expect(storedValue).to.equal(expectedValue);
});
