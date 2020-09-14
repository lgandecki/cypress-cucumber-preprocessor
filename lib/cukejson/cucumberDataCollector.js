const { Parser } = require("gherkin");
const statuses = require("cucumber/lib/status").default;

class CucumberDataCollector {
  constructor(uri, spec) {
    this.feature = new Parser().parse(spec.toString()).feature;
    this.scenarioSteps = {};
    this.runScenarios = {};
    this.runTests = {};
    this.stepResults = {};
    this.testError = null;
    this.uri = uri;
    this.spec = spec;

    this.currentScenario = null;
    this.currentStep = 0;

    this.timer = Date.now();

    this.logStep = (step) => {
      Cypress.log({
        name: "step",
        displayName: step.keyword,
        message: `**${step.text}**`,
        consoleProps: () => ({ feature: this.uri, step }),
      });
    };

    this.onStartTest = () => {};

    this.onFinishTest = () => {
      if (this.testError) {
        this.attachErrorToFailingStep();
      }
    };

    this.onStartScenario = (scenario, stepsToRun) => {
      this.currentScenario = scenario;
      this.currentStep = 0;
      this.stepResults = {};
      this.scenarioSteps[scenario.name] = stepsToRun;
      this.testError = null;

      stepsToRun.forEach((step) => {
        this.stepResults[step.index] = { status: statuses.PENDING };
      });
      this.runScenarios[scenario.name] = scenario;
    };

    this.onFinishScenario = (scenario) => {
      this.markStillPendingStepsAsSkipped(scenario);
      this.recordScenarioResult(scenario);
    };

    this.onStartStep = (step) => {
      this.currentStep = step.index;
      this.setStepToPending(step);
      this.logStep(step);
    };

    this.onFinishStep = (step, result) => {
      this.recordStepResult(step, result);
    };

    this.onFail = (err) => {
      this.testError = err;
      if (
        err.message &&
        err.message.indexOf("Step implementation missing for") > -1
      ) {
        this.stepResults[this.currentStep] = {
          status: statuses.UNDEFINED,
          duration: this.timeTaken(),
        };
      } else if (err.constructor.name === "Pending") {
        // cypress marks skipped mocha tests as pending
        // https://github.com/cypress-io/cypress/issues/3092
        // don't record this error and mark the step as skipped
        this.stepResults[this.currentStep] = {
          status: statuses.SKIPPED,
          duration: this.timeTaken(),
        };
      } else {
        this.stepResults[this.currentStep] = {
          status: statuses.FAILED,
          duration: this.timeTaken(),
          exception: this.testError,
        };
      }
      this.onFinishScenario(this.currentScenario);
    };

    this.timeTaken = () => {
      const now = Date.now();
      const duration = now - this.timer;
      this.timer = now;
      return duration;
    };

    this.formatTestCase = (scenario) => {
      const line = scenario.example
        ? scenario.example.line
        : scenario.location.line;
      return {
        sourceLocation: { uri, line },
      };
    };

    this.attachErrorToFailingStep = () => {
      Object.keys(this.runTests).forEach((test) => {
        const stepResults = this.runTests[test];
        Object.keys(stepResults).forEach((stepIdx) => {
          const stepResult = stepResults[stepIdx];
          if (stepResult.result === statuses.FAILED) {
            stepResult.exception = this.testError;
          }
        });
      });
    };

    this.markStillPendingStepsAsSkipped = (scenario) => {
      this.runTests[scenario.name] = Object.keys(this.stepResults).map(
        (key) => {
          const result = this.stepResults[key];
          return {
            ...result,
            status:
              result.status === statuses.PENDING
                ? statuses.SKIPPED
                : result.status,
          };
        }
      );
    };
    this.recordScenarioResult = (scenario) => {
      const allSkipped = this.areAllStepsSkipped(scenario.name);
      const anyFailed = this.anyStepsHaveFailed(scenario.name);
      if (allSkipped) this.runTests[scenario.name].result = statuses.SKIPPED;
      else
        this.runTests[scenario.name].result = anyFailed
          ? statuses.FAILED
          : statuses.PASSED;
    };

    this.setStepToPending = (step) => {
      this.stepResults[step.index] = { status: statuses.PENDING };
    };

    this.recordStepResult = (step, result) => {
      this.stepResults[step.index] = {
        status: result,
        duration: this.timeTaken(),
      };
    };

    this.areAllStepsSkipped = (name) =>
      this.runTests[name].every((e) => e.status === statuses.SKIPPED);

    this.anyStepsHaveFailed = (name) =>
      this.runTests[name].find((e) => e.status === statuses.FAILED) !==
      undefined;
  }
}

module.exports = { CucumberDataCollector };
