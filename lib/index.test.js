const browserify = require("@cypress/browserify-preprocessor");
const { default: preprocessor, transform } = require(".");

jest.mock("@cypress/browserify-preprocessor");
const { defaultOptions } = jest.requireActual(
  "@cypress/browserify-preprocessor"
);

describe("Preprocessor", () => {
  beforeEach(() => {
    browserify.defaultOptions = defaultOptions;
    browserify.mockReturnValue(() => {});
  });

  afterEach(() => {
    browserify.mockClear();
  });

  it("should use Cypress browserify options by default", async () => {
    await preprocessor()({ shouldWatch: false });

    global.jestExpect(browserify).toHaveBeenCalledWith({
      ...defaultOptions,
      browserifyOptions: {
        ...defaultOptions.browserifyOptions,
        transform: [transform, ...defaultOptions.browserifyOptions.transform],
      },
    });
  });

  it("should add transform when other transforms are defined in options", async () => {
    await preprocessor({
      browserifyOptions: {
        transform: ["babelify"],
      },
    })({ shouldWatch: false });

    global.jestExpect(browserify).toHaveBeenCalledWith({
      browserifyOptions: {
        transform: [transform, "babelify"],
      },
    });
  });

  it("should preserve transforms in options when our transform is already included", async () => {
    const options = {
      browserifyOptions: {
        extensions: ["js", "ts"],
        plugins: [["tsify"]],
        transform: ["aliasify", transform, "babelify"],
      },
    };

    await preprocessor(options)({ shouldWatch: false });

    global.jestExpect(browserify).toHaveBeenCalledWith(options);
  });

  it("should add our transform when no other transforms are defined in options", async () => {
    const options = {
      browserifyOptions: {
        extensions: ["js", "ts"],
        plugins: [["tsify"]],
      },
    };

    await preprocessor(options)({ shouldWatch: false });

    global.jestExpect(browserify).toHaveBeenCalledWith({
      ...options,
      browserifyOptions: {
        ...options.browserifyOptions,
        transform: [transform],
      },
    });
  });

  it("should add our transform when browserifyOptions property is not passed to options", async () => {
    const options = { unsupported: true };

    await preprocessor(options)({ shouldWatch: false });

    global.jestExpect(browserify).toHaveBeenCalledWith({
      ...options,
      browserifyOptions: {
        transform: [transform],
      },
    });
  });

  it("should fail gracefully when options is not an object", () => {
    const err = new Error("Preprocessor options must be an object");

    global.jestExpect(() => preprocessor("options")).toThrow(err);
    global.jestExpect(() => preprocessor(1)).toThrow(err);
    global.jestExpect(() => preprocessor(false)).toThrow(err);
  });
});
