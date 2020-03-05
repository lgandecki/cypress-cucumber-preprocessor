global.jestExpect = global.expect;
global.expect = require("chai").expect;

global.before = jest.fn();
global.after = jest.fn();

window.Cypress = {
  env: jest.fn(),
  on: jest.fn(),
  off: jest.fn(),
  log: jest.fn(),
  Promise: {
    each: (iterator, iteree) =>
      new Promise(resolve => resolve(iterator.map(iteree))),
    reject: jest.fn()
  }
};

const {
  defineParameterType,
  defineStep,
  when,
  then,
  given,
  and,
  but,
  Before,
  After
} = require("../resolveStepDefinition");

const mockedPromise = func => {
  const val = func();
  return new Promise(resolve => resolve(val));
};

window.defineParameterType = defineParameterType;
window.when = when;
window.then = then;
window.given = given;
window.and = and;
window.but = but;
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
  then: mockedPromise,
  end: mockedPromise
};
