/* eslint-disable global-require */
jest.mock("./stepDefinitionPath.js", () => () => "stepDefinitionPath");
jest.mock("glob", () => ({
  sync(pattern) {
    return pattern;
  },
}));

let getConfig;

describe("getStepDefinitionsPaths", () => {
  beforeEach(() => {
    jest.resetModules();
    ({ getConfig } = require("./getConfig"));
    jest.unmock("path");
    jest.mock("./getConfig");
  });
  it("should return the default common folder", () => {
    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true,
    });

    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "stepDefinitionPath/common/**/*.+(js|ts)";
    expect(actual).to.include(expected);
  });

  it("should return the common folder defined by the developer", () => {
    jest.mock("path", () => ({
      resolve(appRoot, commonPath) {
        return `./${appRoot}/${commonPath}`;
      },
      extname() {
        return ".js";
      },
    }));

    jest.spyOn(process, "cwd").mockImplementation(() => "cwd");

    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true,
      commonPath: "myPath/",
    });

    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "./cwd/myPath/**/*.+(js|ts)";
    expect(actual).to.include(expected);
  });
  it("should return the default non global step definition pattern", () => {
    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true,
    });
    // eslint-disable-next-line global-require
    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
    const path = "stepDefinitionPath/test.feature";
    const actual = getStepDefinitionsPaths(path);
    const expected = "stepDefinitionPath/test/**/*.+(js|ts)";

    expect(actual).to.include(expected);
  });

  describe("nonGlobalStepBaseDir is defined", () => {
    const path = "stepDefinitionPath/test.feature";
    const config = {
      nonGlobalStepDefinitions: true,
      nonGlobalStepBaseDir: "nonGlobalStepBaseDir",
    };

    beforeEach(() => {
      jest.spyOn(process, "cwd").mockImplementation(() => "cwd");
    });

    it("should return the overriden non global step definition pattern and default common folder", () => {
      getConfig.mockReturnValue(config);

      const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
      const actual = getStepDefinitionsPaths(path);

      const expectedNonGlobalDefinitionPattern =
        "cwd/nonGlobalStepBaseDir/test/**/*.+(js|ts)";
      const expectedCommonPath =
        "cwd/nonGlobalStepBaseDir/common/**/*.+(js|ts)";

      expect(actual).to.include(expectedNonGlobalDefinitionPattern);
      expect(actual).to.include(expectedCommonPath);
      expect(actual).to.not.include("stepDefinitionPath/test/**/*.+(js|ts)");
    });

    it("should return common folder defined by the dev and based on nonGlobalStepBaseDir", () => {
      getConfig.mockReturnValue({ ...config, commonPath: "commonPath/" });

      const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
      const actual = getStepDefinitionsPaths(path);

      const expectedCommonPath =
        "cwd/nonGlobalStepBaseDir/commonPath/**/*.+(js|ts)";

      expect(actual).to.include(expectedCommonPath);
    });
  });
});
