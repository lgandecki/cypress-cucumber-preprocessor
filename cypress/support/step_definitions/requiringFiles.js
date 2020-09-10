/* global given, Then */
/* eslint-env mocha */

let dataToBeLoaded;
given("I require a file", () => {
  // eslint-disable-next-line global-require
  dataToBeLoaded = require("./requiringFilesData");
});

Then("I can access it's data", () => {
  expect(dataToBeLoaded.IAmImported).to.equal(true);
});
