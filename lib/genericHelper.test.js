const { flattenArray } = require("./genericHelper");

describe("flattenArray", () => {
  it("flattens arrays with a depth of 1", () => {
    expect(
      flattenArray([
        null,
        { value: "a" },
        [{ value: "b" }, { value: "c" }],
        [[{ value: "d" }]],
      ])
    ).to.eql([
      null,
      { value: "a" },
      { value: "b" },
      { value: "c" },
      [{ value: "d" }],
    ]);
  });
});
