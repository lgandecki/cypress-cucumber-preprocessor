/* global Given, Then */
let selectedFruit;

Given(/I choose (Apple|Banana)/, (selection) => {
  selectedFruit = selection;
});

Then("{word} is chosen", (selection) => {
  expect(selectedFruit).to.equal(selection);
});
