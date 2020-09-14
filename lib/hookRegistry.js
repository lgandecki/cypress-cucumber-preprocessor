const { shouldProceedCurrentStep } = require("./tagsHelper");

class HookRegistry {
  constructor() {
    this.definitions = [];
    this.runtime = {};

    this.runtime = (tags, implementation) => {
      this.definitions.push({
        tags,
        implementation,
        featureName: window.currentFeatureName || "___GLOBAL_EXECUTION___",
      });
    };

    this.resolve = (scenarioTags, runningFeatureName) =>
      this.definitions.filter(
        ({ tags, featureName }) =>
          (!tags ||
            tags.length === 0 ||
            shouldProceedCurrentStep(scenarioTags, tags)) &&
          (runningFeatureName === featureName ||
            featureName === "___GLOBAL_EXECUTION___")
      );
  }
}
exports.HookRegistry = HookRegistry;
