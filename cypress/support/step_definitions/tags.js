/* global given, then */

let scenariosRan = [];

given(/I pass the CLI option '(.+)'/, () => {
  scenariosRan = []; // reset
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
