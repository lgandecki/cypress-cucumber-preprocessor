// reexporting here for backward compability
const {
  given,
  when,
  Then,
  and,
  but,
  defineParameterType
} = require("./lib/resolveStepDefinition");

console.warn(
  "DEPRECATION WARNING! Please change your imports from cypress-cucumber-preprocessor/resolveStepDefinition to cypress-cucumber-preprocessor/steps"
);

module.exports = {
  given,
  when,
  then: Then,
  Given: given,
  When: when,
  Then,
  And: and,
  But: but,
  defineParameterType
};
