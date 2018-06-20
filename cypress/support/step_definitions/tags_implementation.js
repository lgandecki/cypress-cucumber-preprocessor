/* global given, then */

const { getTags } = require("cypress-cucumber-preprocessor/getTags"); // eslint-disable-line import/no-extraneous-dependencies

let parsedTags;

given(/my CLI string is '(.+)'/, cliArg => {
  parsedTags = JSON.stringify(getTags(cliArg));
});

then(/the cypress runner should not break/, () => {
  expect(parsedTags).to.deep.equal(
    JSON.stringify({
      ignore: [],
      only: []
    })
  );
});

then(/my filter should specify to IGNORE '(.+)'/, tag => {
  expect(parsedTags).to.deep.equal(
    JSON.stringify({
      ignore: [tag],
      only: []
    })
  );
});

then(/my filter should specify ONLY '(.+)' AND '(.+)'/, (tag1, tag2) => {
  expect(parsedTags).to.deep.equal(
    JSON.stringify({
      ignore: [],
      only: [tag1, tag2]
    })
  );
});

then(/my filter should specify ONLY '(.+)'/, tag => {
  expect(parsedTags).to.deep.equal(
    JSON.stringify({
      ignore: [],
      only: [tag]
    })
  );
});
