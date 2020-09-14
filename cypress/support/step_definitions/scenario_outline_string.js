/* global Then, When, Given */

const fruitToJuice = {
  apple: "apple juice",
  pineapple: "pineapple juice",
  strawberry: "strawberry juice",
};

let juice = "";

Given("I put {string} in a juicer", (fruit) => {
  juice = fruitToJuice[fruit];
  expect(typeof juice).to.equal("string");
});

When("I switch it on", () => {
  expect(true).to.equal(true);
});

Then("I should get {string}", (resultJuice) => {
  expect(resultJuice).to.equal(juice);
});
