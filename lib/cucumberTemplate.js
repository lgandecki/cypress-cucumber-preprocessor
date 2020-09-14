const path = require("path");
const os = require("os");

const getPathFor = (file) => {
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
  Given,
  When,
  Then,
  And,
  But,
  Before,
  After,
  defineStep
} = require("${getPathFor("resolveStepDefinition")}");
window.Given = Given;
window.When = When;
window.Then = Then;
window.And = And;
window.But = But;
window.defineParameterType = defineParameterType;
window.defineStep = defineStep;
const {
  createTestsFromFeature
} = require("${getPathFor("createTestsFromFeature")}");
`;
