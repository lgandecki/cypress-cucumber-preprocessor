/* global Then, When */

let var1 = "var1";
let var2 = "var2";

When("I enter variable {string} and {string}", (v1, v2) => {
  var1 = v1;
  var2 = v2;
});

Then("I verify that both variables have {string} as value", (value) => {
  expect(value).to.equal(var1);
  expect(value).to.equal(var2);
});
