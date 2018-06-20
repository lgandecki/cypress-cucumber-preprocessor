/* global given, then */

let scenariosRan = [];

given(/I pass the CLI option '(.+)'/, () => {
  // the CLI option overrides the call to `getTags` so it doesn't look
  // at the ACTUAL CLI option passed. Just for testing purposes.
});

then(/this step marks the '(.+)' as done/, scenarioTag => {
  scenariosRan.push(scenarioTag);
});

then(/the '(.+)' scenario should NOT have been run/, scenarioTag => {
  expect(scenariosRan).not.to.include(scenarioTag);
});

then(/the '(.+)' scenario SHOULD have run/, scenarioTag => {
  expect(scenariosRan).to.include(scenarioTag);
});

then(/clear the state/, () => {
  scenariosRan = []; // reset. Hacky, I know.
});
