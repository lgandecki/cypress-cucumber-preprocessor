const path = require("path");
const os = require("os");

const getPathFor = file => {
  if (os.platform() === "win32") {
    return path
      .join(__dirname.replace(/\\/g, "\\\\"), file)
      .replace(/\\/g, "\\\\");
  }
  return `${__dirname}/${file}`;
};

exports.cucumberTemplate = `  
const {
  resolveAndRunStepDefinition,
  defineParameterType,
  given,
  when,
  Then,
  and,
  but,
  Before,
  After,
  defineStep
} = require("${getPathFor("resolveStepDefinition")}");
const Given = (window.Given = window.given = given);
const When = (window.When = window.when = when);
window.Then = Then;
const And = (window.And = window.and = and);
const But = (window.But = window.but = but);
window.defineParameterType = defineParameterType;
window.defineStep = defineStep;
const {
  createTestsFromFeature
} = require("${getPathFor("createTestsFromFeature")}");
`;
