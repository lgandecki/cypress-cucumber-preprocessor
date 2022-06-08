import util from "util";

import assert from "assert";

import { ICypressConfiguration } from "@badeball/cypress-configuration";

import {
  IPreprocessorConfiguration,
  PreprocessorConfiguration,
} from "./preprocessor-configuration";

import { getStepDefinitionPatterns, pathParts } from "./step-definitions";

function example(
  filepath: string,
  cypressConfiguration: Pick<
    ICypressConfiguration,
    "projectRoot"
  >,
  preprocessorConfiguration: Partial<IPreprocessorConfiguration>,
  expected: string[]
) {
  it(`should return [${expected.join(
    ", "
  )}] for ${filepath} with ${util.inspect(preprocessorConfiguration)} in ${
    cypressConfiguration.projectRoot
  }`, () => {
    const actual = getStepDefinitionPatterns(
      {
        cypress: cypressConfiguration,
        preprocessor: new PreprocessorConfiguration(
          preprocessorConfiguration,
          {}
        ),
      },
      filepath
    );

    const throwUnequal = () => {
      throw new Error(
        `Expected ${util.inspect(expected)}, but got ${util.inspect(actual)}`
      );
    };

    if (expected.length !== actual.length) {
      throwUnequal();
    }

    for (let i = 0; i < expected.length; i++) {
      if (expected[i] !== actual[i]) {
        throwUnequal();
      }
    }
  });
}

describe("pathParts()", () => {
  const relativePath = "foo/bar/baz";
  const expectedParts = ["foo/bar/baz", "foo/bar", "foo"];

  it(`should return ${util.inspect(expectedParts)} for ${util.inspect(
    relativePath
  )}`, () => {
    assert.deepStrictEqual(pathParts(relativePath), expectedParts);
  });
});

describe("getStepDefinitionPatterns()", () => {
  example(
    "/foo/bar/cypress/e2e/baz.feature",
    {
      projectRoot: "/foo/bar",
    },
    {},
    [
      "/foo/bar/cypress/e2e/baz/**/*.{js,ts}",
      "/foo/bar/cypress/e2e/baz.{js,ts}",
      "/foo/bar/cypress/support/step_definitions/**/*.{js,ts}",
    ]
  );

  example(
    "/cypress/e2e/foo/bar/baz.feature",
    {
      projectRoot: "/",
    },
    {
      stepDefinitions: "[filepath]/step_definitions/*.ts",
    },
    ["/cypress/e2e/foo/bar/baz/step_definitions/*.ts"]
  );

  example(
    "/qux/cypress/e2e/foo/bar/baz.feature",
    {
      projectRoot: "/qux",
    },
    {
      stepDefinitions: "[filepart]/step_definitions/*.ts",
    },
    [
      "/qux/cypress/e2e/foo/bar/baz/step_definitions/*.ts",
      "/qux/cypress/e2e/foo/bar/step_definitions/*.ts",
      "/qux/cypress/e2e/foo/step_definitions/*.ts",
      "/qux/cypress/e2e/step_definitions/*.ts",
      "/qux/cypress/step_definitions/*.ts",
      "/qux/step_definitions/*.ts",
    ]
  );

  it("should error when provided a path not within projectRoot", () => {
    assert.throws(() => {
      getStepDefinitionPatterns(
        {
          cypress: {
            projectRoot: "/qux",
          },
          preprocessor: {
            stepDefinitions: [],
          },
        },
        "/foo/bar/cypress/features/baz.feature"
      );
    }, "/foo/bar/cypress/features/baz.feature is not within /qux");
  });

  it("should error when provided a path not within cwd", () => {
    assert.throws(() => {
      getStepDefinitionPatterns(
        {
          cypress: {
            projectRoot: "/baz",
          },
          preprocessor: {
            stepDefinitions: [],
          },
        },
        "/foo/bar/cypress/e2e/baz.feature"
      );
    }, "/foo/bar/cypress/features/baz.feature is not within /baz");
  });
});
