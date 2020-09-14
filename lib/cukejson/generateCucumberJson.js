const { EventEmitter } = require("events");
const { generateEvents } = require("gherkin");
const JsonFormatter = require("cucumber/lib/formatter/json_formatter").default;
const formatterHelpers = require("cucumber/lib/formatter/helpers");

function generateCucumberJson(state) {
  let output = "";
  const logFn = (data) => {
    output += data;
  };

  const eventBroadcaster = new EventEmitter();

  function storePickle({ pickle, uri }) {
    eventBroadcaster.emit("pickle-accepted", { pickle, uri });
  }

  eventBroadcaster.on("pickle", storePickle);

  // eslint-disable-next-line no-new
  new JsonFormatter({
    eventBroadcaster,
    eventDataCollector: new formatterHelpers.EventDataCollector(
      eventBroadcaster
    ),
    log: logFn,
  });

  // Start feeding the recorded test run into the JsonFormatter

  // Feed in the static test structure
  generateEvents(state.spec.toString(), state.uri).forEach((event) => {
    eventBroadcaster.emit(event.type, event);
  });

  // Feed in the results from the recorded scenarios and steps
  Object.keys(state.runTests).forEach((test) => {
    const scenario = state.runScenarios[test];
    const stepResults = state.runTests[test];
    const stepsToRun = state.scenarioSteps[test];
    const steps = stepsToRun.map((step) => ({
      sourceLocation: { uri: state.uri, line: step.location.line },
    }));
    eventBroadcaster.emit("test-case-prepared", {
      sourceLocation: state.formatTestCase(scenario).sourceLocation,
      steps,
    });
    stepResults.forEach((stepResult, stepIdx) => {
      eventBroadcaster.emit("test-step-prepared", {
        index: stepIdx,
        testCase: state.formatTestCase(scenario),
      });
      eventBroadcaster.emit("test-step-finished", {
        index: stepIdx,
        testCase: state.formatTestCase(scenario),
        result: stepResult,
      });
      if (stepResult.attachment) {
        eventBroadcaster.emit("test-step-attachment", stepResult.attachment);
      }
    });
    eventBroadcaster.emit("test-case-finished", {
      sourceLocation: state.formatTestCase(scenario).sourceLocation,
      result: state.runTests[scenario.name].result,
    });
  });
  eventBroadcaster.emit("test-run-finished", {});

  return JSON.parse(output);
}

module.exports = { generateCucumberJson };
