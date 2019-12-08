const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
const cypressExecutionInstance = require("./cypressExecutionInstance");

jest.mock("./cypressExecutionInstance", () => ({
  load: jest.fn()
}));
jest.mock("./getStepDefinitionsPaths", () => ({
  getStepDefinitionsPaths: jest.fn()
}));

const loader = require("./loader");

test("loader test", async () => {
  const callback = jest.fn();
  cypressExecutionInstance.load.mockReturnValue(Promise.resolve());
  getStepDefinitionsPaths.mockReturnValue([]);

  await loader.call(
    {
      resourcePath: "./path/test.feature",
      async: jest.fn().mockReturnValue(callback)
    },
    `
      Feature: Testing loader
    
      Scenario: run loader
        Given the loader it is executed
    `
  );

  expect(callback.mock.calls[0][0]).to.equal(null);
  expect(callback.mock.calls[0][1]).to.include("Feature: Testing loader");
  expect(callback.mock.calls[0][1]).to.include("Scenario: run loader");
  expect(callback.mock.calls[0][1]).to.include(
    "Given the loader it is executed"
  );
});

test("loader test on error", async () => {
  const callback = jest.fn();
  const error = new Error("a weird error happened");
  cypressExecutionInstance.load.mockReturnValue(Promise.reject(error));

  await loader.call(
    {
      resourcePath: "./path/test.feature",
      async: jest.fn().mockReturnValue(callback)
    },
    `
      Feature: Testing loader
    
      Scenario: run loader
        Given the loader it is executed
    `
  );

  expect(callback.mock.calls[0][0]).to.equal(error);
});
