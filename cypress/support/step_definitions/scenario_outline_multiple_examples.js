/* global Then, When */

let var1 = "var1";

When("I enter example {string}", (v1) => {
  var1 = v1;
});

Then("I verify that example {string} is executed", (value) => {
  expect(value).to.equal(var1);
});
