const path = require("path");
const os = require("os");

const getPathFor = file => {
  if (os.platform() === "win32") {
    return path
      .join(__dirname.replace(/\\/g, path.sep), file)
      .replace(/\\/g, path.sep);
  }
  return `${__dirname}/${file}`;
};

exports.cucumberTemplate = `  
const {
  resolveAndRunStepDefinition,
  defineParameterType,
  given,
  when,
  then,
  and,
  but,
  Before,
  After,
  defineStep
} = require("${getPathFor("resolveStepDefinition")}");
const Given = (window.Given = window.given = given);
const When = (window.When = window.when = when);
const Then = (window.Then = window.then = then);
const And = (window.And = window.and = and);
const But = (window.But = window.but = but);
window.defineParameterType = defineParameterType;
window.defineStep = defineStep;
const {
  createTestsFromFeature
} = require("${getPathFor("createTestsFromFeature")}");
`;
