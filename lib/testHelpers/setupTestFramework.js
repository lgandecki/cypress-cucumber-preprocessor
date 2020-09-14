global.jestExpect = global.expect;
global.expect = require("chai").expect;

global.before = jest.fn();
global.after = jest.fn();
global.skip = jest.fn();

window.Cypress = {
  env: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  log: jest.fn(),
  Promise: { each: (iterator, iteree) => iterator.map(iteree) },
};

const {
  defineParameterType,
  defineStep,
  When,
  Then,
  Given,
  And,
  But,
  Before,
  After,
} = require("../resolveStepDefinition");

const mockedThen = (funcOrConfig, func) => {
  if (typeof funcOrConfig === "object") {
    func();
  } else {
    funcOrConfig();
  }
  return { then: mockedThen };
};

const mockedPromise = (func) => {
  func();
  return { then: mockedThen };
};

window.defineParameterType = defineParameterType;
window.When = When;
window.Then = Then;
window.Given = Given;
window.And = And;
window.But = But;
window.Before = Before;
window.After = After;
window.defineStep = defineStep;
window.cy = {
  log: jest.fn(),
  logStep: mockedPromise,
  startScenario: mockedPromise,
  finishScenario: mockedPromise,
  startStep: mockedPromise,
  finishStep: mockedPromise,
  finishTest: mockedPromise,
  then: mockedThen,
  end: mockedPromise,
};
