/* global given, then */

const { getTags } = require("../../../getTags");

let parsedTags;

given(/I pass the CLI option '(.+)'/, cliArg => {
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

then(/ONLY scenarios tagged '(.+)' should run/, tag => {
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
  /ONLY scenarios tagged both '(.+)' and '(.+)' should run/,
  (tag1, tag2) => {
    expect(parsedTags).to.deep.equal(
      JSON.stringify({
        ignore: [],
        only: [tag1, tag2]
      })
    );
  }
);

let scenariosRan = [];

given(/we've run our suite of tests with the '(.+)' parameter/, parameter => {
  console.log(parameter); // @TODO
});

then(/the '(.+)' scenario should NOT have been run/, scenarioTag => {
  expect(scenariosRan).not.to.include(scenarioTag);
  scenariosRan = []; // reset
});

then(/the '(.+)' scenario was run/, scenarioTag => {
  scenariosRan.push(scenarioTag);
});
