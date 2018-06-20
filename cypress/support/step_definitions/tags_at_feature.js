/* global given, then, when */

const { Parser } = require("gherkin");

const scenariosRan = [];

given(/I have a feature file like this:/, dataString => {
  const parsedFeatureFile = new Parser().parse(dataString.toString()); // eslint-disable-line no-unused-vars
});

when(/I parse and run the feature file/, () => {
  // @TODO - find a way of running this :( nested tests not allowed
});

then(/this step marks the '(.+)' as done/, scenarioTag => {
  scenariosRan.push(scenarioTag);
});

then(/the '(.+)' scenario should NOT have been run/, scenarioTag => {
  expect(scenariosRan).not.to.include(scenarioTag);
});
