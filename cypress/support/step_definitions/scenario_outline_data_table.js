/* global then, when */

let sum = { first: 0, second: 0, result: 0 };

when("I enter {int} and {int}", (a, b) => {
  sum = { first: a, second: b, result: a + b };
});

then("I see following result table", dataTable => {
  dataTable.hashes().forEach(row => {
    const { first, second, result } = row;
    console.log(row);
    expect(sum).to.equal({ first, second, result });
  });
});
