// We know this is a duplicate of ./resolveStepDefinition.
// We will remove that one soon and leave only this one in a future version.

const {
  given,
  when,
  Then,
  and,
  but,
  Before,
  After,
  defineParameterType,
  defineStep
} = require("./lib/resolveStepDefinition");

module.exports = {
  given,
  when,
  then: Then,
  and,
  but,
  Given: given,
  When: when,
  Then,
  And: and,
  But: but,
  Before,
  After,
  defineParameterType,
  defineStep
};
