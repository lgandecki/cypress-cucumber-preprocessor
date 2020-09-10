/* global Then, when, given */

const fruitToJuice = {
  apple: "apple juice",
  pineapple: "pineapple juice",
  strawberry: "strawberry juice"
};

let juice = "";

given("I put {string} in a juicer", fruit => {
  juice = fruitToJuice[fruit];
  expect(typeof juice).to.equal("string");
});

when("I switch it on", () => {
  expect(true).to.equal(true);
});

Then("I should get {string}", resultJuice => {
  expect(resultJuice).to.equal(juice);
});
