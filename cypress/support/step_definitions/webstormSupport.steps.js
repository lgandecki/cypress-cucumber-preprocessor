/* global Given, When, Then */
let counter = 0;

Given(`I am using the Cypress Cucumber plugin`, () => {
  counter += 1;
});

When(/^I write my steps using caps$/, () => {
  counter += 1;
});

Then(/^Webstorm recognizes my (\d+) steps$/, (value) => {
  counter += 1;
  expect(counter).to.equal(value);
});

Then(/^Webstorm recognizes "(.*?)"$/, (value) => {
  expect("words").to.equal(value);
});
