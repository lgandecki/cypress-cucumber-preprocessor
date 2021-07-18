const { expect } = require("chai");
const { convertExamplesToScenarios } = require("./createTestFromScenario");
const { flattenArray } = require("./genericHelper");

describe("convertExamplesToScenarios", () => {
  const OLD_ENV = process.env;
  const OLD_CYPRESS = window.Cypress;

  beforeEach(() => {
    process.env = { ...OLD_ENV };
    window.Cypress = {
      ...window.Cypress,
      env: (varname) => process.env[varname],
    };
  });

  afterEach(() => {
    process.env = OLD_ENV;
    window.Cypress = OLD_CYPRESS;
  });

  const getTestScenarioOutline = () => ({
    name: "Multiple Examples for <var>",
    tags: [],
    steps: [
      { text: "I enter example <var>" },
      { text: "I verify that example <var> is executed" },
    ],
    examples: [
      {
        tableHeader: {
          cells: [{ value: "var" }],
        },
        tableBody: [
          {
            location: 11,
            cells: [{ value: "aaa" }],
          },
          {
            location: 12,
            cells: [{ value: "bbb" }],
          },
        ],
        tags: [],
      },
      {
        tableHeader: {
          cells: [{ value: "var" }],
        },
        tableBody: [
          {
            location: 21,
            cells: [{ value: "ccc" }],
          },
          {
            location: 22,
            cells: [{ value: "ddd" }],
          },
        ],
        tags: [],
      },
    ],
  });

  it("names scenarios uniquely", () => {
    // Given
    const scenarioOutline = getTestScenarioOutline();

    // When
    const results = convertExamplesToScenarios(scenarioOutline);

    // Then
    expect(results.map((result) => result.scenario.name)).to.eql(
      results.map(
        (scenario, index) =>
          `Multiple Examples for ${
            flattenArray(
              scenarioOutline.examples.map((example) => example.tableBody)
            )[index].cells[0].value
          } (example #${index + 1})`
      )
    );
  });

  it("skips examples with non-matching tags", () => {
    // Given
    process.env.TAGS = "@test-tag";

    const scenarioOutline = getTestScenarioOutline();
    scenarioOutline.examples[0].tags = [{ name: "@test-tag" }];

    // When
    const results = convertExamplesToScenarios(scenarioOutline);

    // Then
    expect(results.map((result) => result.scenario.shouldRun)).to.eql([
      true,
      true,
      false,
      false,
    ]);
  });
});
