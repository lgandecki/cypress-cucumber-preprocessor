// We know this is a duplicate of ./resolveStepDefinition.
// We will remove that one soon and leave only this one in a future version.

const {
  Given,
  When,
  Then,
  And,
  But,
  Before,
  After,
  defineParameterType,
  defineStep,
} = require("./lib/resolveStepDefinition");

module.exports = {
  Then,
  And,
  But,
  Given,
  When,
  Before,
  After,
  defineParameterType,
  defineStep,
};
