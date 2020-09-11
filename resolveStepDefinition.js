// reexporting here for backward compability
const {
  Given,
  When,
  Then,
  And,
  But,
  defineParameterType,
} = require("./lib/resolveStepDefinition");

console.warn(
  "DEPRECATION WARNING! Please change your imports from cypress-cucumber-preprocessor/resolveStepDefinition to cypress-cucumber-preprocessor/steps"
);

module.exports = {
  Given,
  When,
  Then,
  Given,
  When,
  Then,
  And,
  But,
  defineParameterType,
};
