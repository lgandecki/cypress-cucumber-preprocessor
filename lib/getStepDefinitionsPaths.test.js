jest.mock("./stepDefinitionPath.js", () => () => "stepDefinitionPath");
jest.mock("glob", () => ({
  sync(pattern) {
    return pattern;
  }
}));

describe("getStepDefinitionsPaths", () => {
  it("should return the default common folder", () => {
    jest.resetModules();
    jest.mock("cosmiconfig", () => () => ({
      load: () => ({
        config: {
          nonGlobalStepDefinitions: true
        }
      })
    }));
    // eslint-disable-next-line global-require
    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "stepDefinitionPath/common/**/*.+(js|ts)";

    expect(actual).to.include(expected);
  });
  it("should return the common folder defined by the developper", () => {
    jest.resetModules();
    jest.mock("cosmiconfig", () => () => ({
      load: () => ({
        config: {
          nonGlobalStepDefinitions: true,
          commonPath: "myPath/"
        }
      })
    }));
    // eslint-disable-next-line global-require
    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "myPath/**/*.+(js|ts)";

    expect(actual).to.include(expected);
  });
});
