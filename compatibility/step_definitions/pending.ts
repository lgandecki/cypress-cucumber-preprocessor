import { Given } from "@badeball/cypress-cucumber-preprocessor";

Given("an implemented non-pending step", function () {
  // no-op
});

Given("an implemented step that is skipped", function () {
  // no-op
});

Given("an unimplemented pending step", function () {
  return "pending";
});
