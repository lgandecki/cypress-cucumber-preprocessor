/* global given, then */

let tagscounter = 0;

given("tags counter is incremented", () => {
  tagscounter += 1;
});

then("tags counter equals {int}", value => {
  expect(tagscounter).to.equal(value);
});
