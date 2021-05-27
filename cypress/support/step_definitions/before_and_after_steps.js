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
let flagSetByUntaggedAfterWithError = false;
let flagSetByTaggedAfterWithError = false;

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
  flagSetByUntaggedAfterWithError = true;
});

After({ tags: "@withTaggedAfter" }, () => {
  flagSetByTaggedAfter = true;
});

After({ tags: "@withTaggedErroredAfter" }, () => {
  flagSetByTaggedAfterWithError = true;
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

Given("I executed step causing error", () => {
  flagSetByUntaggedAfterWithError = false;
  flagSetByTaggedAfterWithError = false;
  throw new Error("Error executing step: I executed step causing error");
});

Then("Error flag should be set by untagged After", () => {
  expect(flagSetByUntaggedAfterWithError).to.equal(true);
});

Then("Error flag should be set by tagged After", () => {
  expect(flagSetByTaggedAfterWithError).to.equal(true);
});
