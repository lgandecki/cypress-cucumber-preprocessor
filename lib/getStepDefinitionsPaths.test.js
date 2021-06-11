/* eslint-disable global-require */
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
    jest.mock("./stepDefinitionPath.js", () => () => "cwd/stepDefinitionPath");
  });

  it("should return defaults when config is missing completely", () => {
    getConfig.mockReturnValue(undefined);

    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "cwd/stepDefinitionPath/**/*.+(js|ts|tsx)";
    expect(actual).to.include(expected);
  });

  it("should return the default common folder", () => {
    getConfig.mockReturnValue({
      nonGlobalStepDefinitions: true,
    });

    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "cwd/stepDefinitionPath/common/**/*.+(js|ts|tsx)";
    expect(actual).to.include(expected);
  });

  it("should return the common folder defined by the developer", () => {
    jest.mock("path", () => ({
      ...jest.requireActual("path"),
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
      commonPath: "myPath",
    });

    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "./cwd/stepDefinitionPath/myPath/**/*.+(js|ts|tsx)";
    expect(actual).to.include(expected);
  });

  it("should return the common folder defined by the developer when nonGlobalStepDefinitions is false", () => {
    jest.mock("path", () => ({
      ...jest.requireActual("path"),
      resolve(appRoot, commonPath) {
        return `./${appRoot}/${commonPath}`;
      },
      extname() {
        return ".js";
      },
    }));

    jest.spyOn(process, "cwd").mockImplementation(() => "cwd");

    getConfig.mockReturnValue({
      commonPath: "myPath",
    });

    const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");

    const actual = getStepDefinitionsPaths("/path");
    const expected = "./cwd/stepDefinitionPath/myPath/**/*.+(js|ts|tsx)";
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
    const expected = "cwd/stepDefinitionPath/test/**/*.+(js|ts|tsx)";

    expect(actual).to.include(expected);
  });

  describe("stepDefinitions is defined", () => {
    const path = "cwd/stepDefinitionPath/test.feature";
    const config = {
      nonGlobalStepDefinitions: true,
      stepDefinitions: "nonGlobalStepBaseDir",
    };

    beforeEach(() => {
      jest.spyOn(process, "cwd").mockImplementation(() => "cwd");
      jest.mock("./stepDefinitionPath.js", () => () =>
        "cwd/nonGlobalStepBaseDir"
      );
    });

    it("should return the overriden non global step definition pattern and default common folder", () => {
      getConfig.mockReturnValue(config);

      const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
      const actual = getStepDefinitionsPaths(path);

      const expectedNonGlobalDefinitionPattern =
        "cwd/nonGlobalStepBaseDir/test/**/*.+(js|ts|tsx)";
      const expectedCommonPath =
        "cwd/nonGlobalStepBaseDir/common/**/*.+(js|ts|tsx)";

      expect(actual).to.include(expectedNonGlobalDefinitionPattern);
      expect(actual).to.include(expectedCommonPath);
      expect(actual).to.not.include(
        "cwd/stepDefinitionPath/test/**/*.+(js|ts|tsx)"
      );
    });

    it("should return common folder defined by the dev and based on stepDefinitions", () => {
      getConfig.mockReturnValue({ ...config, commonPath: "commonPath" });
      jest.mock("./stepDefinitionPath.js", () => () =>
        "cwd/nonGlobalStepBaseDir"
      );
      jest.mock("path", () => ({
        ...jest.requireActual("path"),
        resolve(appRoot, commonPath) {
          return `${appRoot}/${commonPath}`;
        },
        extname() {
          return ".js";
        },
      }));

      const { getStepDefinitionsPaths } = require("./getStepDefinitionsPaths");
      const actual = getStepDefinitionsPaths(path);

      const expectedCommonPath =
        "cwd/nonGlobalStepBaseDir/commonPath/**/*.+(js|ts|tsx)";

      expect(actual).to.include(expectedCommonPath);
    });
    describe("integrationFolder is defined", () => {
      const pathWithIntegrationFolder = "cwd/integrationFolder/test.feature";
      const configWithIntegrationFolder = {
        nonGlobalStepDefinitions: true,
        stepDefinitions: "nonGlobalStepBaseDir",
        integrationFolder: "integrationFolder",
      };

      beforeEach(() => {
        jest.spyOn(process, "cwd").mockImplementation(() => "cwd");
        jest.mock("./stepDefinitionPath.js", () => () =>
          "cwd/nonGlobalStepBaseDir"
        );
      });
      it("should return steps folder defined by the dev and based on stepDefinitions and outside of the integrationFolder", () => {
        getConfig.mockReturnValue(configWithIntegrationFolder);

        const {
          getStepDefinitionsPaths,
        } = require("./getStepDefinitionsPaths");
        const actual = getStepDefinitionsPaths(pathWithIntegrationFolder);

        const expectedNonGlobalDefinitionPattern =
          "cwd/nonGlobalStepBaseDir/test/**/*.+(js|ts|tsx)";

        const expectedCommonPath =
          "cwd/nonGlobalStepBaseDir/common/**/*.+(js|ts|tsx)";

        expect(actual).to.include(expectedNonGlobalDefinitionPattern);
        expect(actual).to.include(expectedCommonPath);
        expect(actual).to.not.include(
          "cwd/integrationFolder/test/**/*.+(js|ts|tsx)"
        );
      });

      it("should return common folder defined by the dev and based on stepDefinitions and outside of the integrationFolder", () => {
        getConfig.mockReturnValue({
          ...configWithIntegrationFolder,
          commonPath: "commonPath",
        });
        jest.mock("./stepDefinitionPath.js", () => () =>
          "cwd/nonGlobalStepBaseDir"
        );
        jest.mock("path", () => ({
          ...jest.requireActual("path"),
          resolve(appRoot, commonPath) {
            return `${appRoot}/${commonPath}`;
          },
          extname() {
            return ".js";
          },
        }));

        const {
          getStepDefinitionsPaths,
        } = require("./getStepDefinitionsPaths");
        const actual = getStepDefinitionsPaths(pathWithIntegrationFolder);

        const expectedCommonPath =
          "cwd/nonGlobalStepBaseDir/commonPath/**/*.+(js|ts|tsx)";

        expect(actual).to.include(expectedCommonPath);
        expect(actual).to.not.include(
          "cwd/integrationFolder/stepDefinitionPath/test/**/*.+(js|ts|tsx)"
        );
      });
    });
  });
});
