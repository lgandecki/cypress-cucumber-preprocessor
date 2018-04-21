/* global given then */
let selectedFruit;

given(/I choose (Apple|Banana)/, selection => {
  selectedFruit = selection;
});

then("{word} is chosen", selection => {
  expect(selectedFruit).to.equal(selection);
});
