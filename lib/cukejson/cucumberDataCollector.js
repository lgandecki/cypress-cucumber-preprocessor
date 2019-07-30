const { Parser } = require("gherkin");
const statuses = require("cucumber").Status;

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

    this.logStep = step => {
      Cypress.log({
        name: "step",
        displayName: step.keyword,
        message: `**${step.text}**`,
        consoleProps: () => ({ feature: this.uri, step })
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

      stepsToRun.forEach(step => {
        this.stepResults[step.index] = { status: statuses.PENDING };
      });
      this.runScenarios[scenario.name] = scenario;
    };

    this.onFinishScenario = scenario => {
      this.markStillPendingStepsAsSkipped(scenario);
      this.recordScenarioResult(scenario);
    };

    this.onStartStep = step => {
      this.currentStep = step.index;
      this.setStepToPending(step);
      this.logStep(step);
    };

    this.onFinishStep = (step, result) => {
      this.recordStepResult(step, result);
    };

    this.onFail = err => {
      this.testError = err;
      if (err.message.indexOf("Step implementation missing for") > -1) {
        this.stepResults[this.currentStep] = {
          status: statuses.UNDEFINED,
          duration: this.timeTaken()
        };
      } else {
        const attachment = {
          index: this.currentStep,
          testCase: this.formatTestCase(this.currentScenario),
          data: btoa(err.message.toString()),
          media: { type: "text/plain" }
        };
        this.stepResults[this.currentStep] = {
          status: statuses.FAILED,
          duration: this.timeTaken(),
          exception: this.testError,
          attachment
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

    this.formatTestCase = scenario => {
      const line = scenario.example
        ? scenario.example.line
        : scenario.location.line;
      return {
        sourceLocation: { uri, line }
      };
    };

    this.attachErrorToFailingStep = () => {
      Object.keys(this.runTests).forEach(test => {
        const stepResults = this.runTests[test];
        Object.keys(stepResults).forEach(stepIdx => {
          const stepResult = stepResults[stepIdx];
          if (stepResult.result === statuses.FAILED) {
            stepResult.exception = this.testError;
          }
        });
      });
    };

    this.markStillPendingStepsAsSkipped = scenario => {
      this.runTests[scenario.name] = Object.keys(this.stepResults).map(key => {
        const result = this.stepResults[key];
        return Object.assign({}, result, {
          status:
            result.status === statuses.PENDING
              ? statuses.SKIPPED
              : result.status
        });
      });
    };
    this.recordScenarioResult = scenario => {
      this.runTests[scenario.name].result = this.anyStepsHaveFailed(scenario)
        ? statuses.FAILED
        : statuses.PASSED;
    };

    this.setStepToPending = step => {
      this.stepResults[step.index] = { status: statuses.PENDING };
    };

    this.recordStepResult = (step, result) => {
      this.stepResults[step.index] = {
        status: result,
        duration: this.timeTaken()
      };
    };

    this.anyStepsHaveFailed = () =>
      Object.values(this.stepResults).find(e => e.status !== statuses.PASSED);
  }
}

module.exports = { CucumberDataCollector };
