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
