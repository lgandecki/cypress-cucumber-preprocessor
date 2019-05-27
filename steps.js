// We know this is a duplicate of ./resolveStepDefinition.
// We will remove that one soon and leave only this one in a future version.

const {
  given,
  when,
  then,
  and,
  but,
  defineParameterType,
  defineStep
} = require("./lib/resolveStepDefinition");

module.exports = {
  given,
  when,
  then,
  and,
  but,
  Given: given,
  When: when,
  Then: then,
  And: and,
  But: but,
  defineParameterType,
  defineStep
};
