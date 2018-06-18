/* global given, then */

const { getTags } = require("../../../getTags");

let parsedTags;

given(/I pass '(.+)'/, cliArg => {
  parsedTags = JSON.stringify(getTags(cliArg));
});

then(/scenarios tagged '(.+)' should run/, tag => {
  expect(parsedTags).to.deep.equal(
    JSON.stringify({
      ignore: [],
      only: [tag]
    })
  );
});

then(/all scenarios EXCEPT those tagged '(.+)' should run/, tag => {
  expect(parsedTags).to.deep.equal(
    JSON.stringify({
      ignore: [tag],
      only: []
    })
  );
});

then(
  /all scenarios tagged as both '(.+)' and '(.+)' should run/,
  (tag1, tag2) => {
    expect(parsedTags).to.deep.equal(
      JSON.stringify({
        ignore: [],
        only: [tag1, tag2]
      })
    );
  }
);
