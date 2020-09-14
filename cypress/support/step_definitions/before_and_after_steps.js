/* eslint-env mocha */
/* eslint-disable import/no-extraneous-dependencies */
const {
  Before,
  After,
  Given,
  Then,
} = require("cypress-cucumber-preprocessor/steps");

let beforeCounter = 0;
let beforeWithTagCounter = 0;
let flagSetByUntaggedAfter = false;
let flagSetByTaggedAfter = false;

Before(() => {
  beforeCounter += 1;
  beforeWithTagCounter = 0;
});

Before({ tags: "@withTaggedBefore" }, () => {
  beforeWithTagCounter += 1;
});

Before({ tags: "@withAnotherTaggedBefore" }, () => {
  beforeWithTagCounter += 1;
});

Before({ tags: "@willNeverRun" }, () => {
  throw new Error("XXX: before hook unexpectedly called.");
});

After({ tags: "@willNeverRun" }, () => {
  throw new Error("XXX: after hook unexpectedly called.");
});

After(() => {
  beforeCounter = 0;
  flagSetByUntaggedAfter = true;
});

After({ tags: "@withTaggedAfter" }, () => {
  flagSetByTaggedAfter = true;
});

Given("I executed empty step", () => {});

Then("Untagged Before was called once", () => {
  expect(beforeCounter).to.equal(1);
});

Then("Untagged Before was not called", () => {
  expect(beforeCounter).to.equal(0);
});

Then("Tagged Before was called once", () => {
  expect(beforeWithTagCounter).to.equal(1);
});

Then("Tagged Before was called twice", () => {
  expect(beforeWithTagCounter).to.equal(2);
});

Then("Tagged Before was not called", () => {
  expect(beforeWithTagCounter).to.equal(0);
});

Then("Flag should be set by untagged After", () => {
  expect(flagSetByUntaggedAfter).to.equal(true);
});

Then("Flag should be set by tagged After", () => {
  expect(flagSetByTaggedAfter).to.equal(true);
});
