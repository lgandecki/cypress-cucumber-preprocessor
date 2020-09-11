/* global Given, Then */
/* eslint-env mocha */

let dataToBeLoaded;
Given("I require a file", () => {
  // eslint-disable-next-line global-require
  dataToBeLoaded = require("./requiringFilesData");
});

Then("I can access it's data", () => {
  expect(dataToBeLoaded.IAmImported).to.equal(true);
});
