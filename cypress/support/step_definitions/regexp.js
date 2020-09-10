/* global given Then */
let selectedFruit;

given(/I choose (Apple|Banana)/, selection => {
  selectedFruit = selection;
});

Then("{word} is chosen", selection => {
  expect(selectedFruit).to.equal(selection);
});
