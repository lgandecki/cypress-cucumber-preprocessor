const DataTable = require("cucumber/lib/models/data_table").default;
const {
  defineParameterType
} = require("cucumber/lib/support_code_library_builder/define_helpers");
const {
  CucumberExpression,
  RegularExpression,
  ParameterTypeRegistry
} = require("cucumber-expressions");

class StepDefinitionRegistry {
  constructor() {
    this.definitions = {};
    this.runtime = {};
    this.options = {
      parameterTypeRegistry: new ParameterTypeRegistry()
    };

    this.definitions = [];
    this.runtime = (matcher, implementation) => {
      let expression;
      if (matcher instanceof RegExp) {
        expression = new RegularExpression(
          matcher,
          this.options.parameterTypeRegistry
        );
      } else {
        expression = new CucumberExpression(
          matcher,
          this.options.parameterTypeRegistry
        );
      }
      this.definitions.push({ implementation, expression });
    };

    this.resolve = (type, text) =>
      this.definitions.filter(({ expression }) => expression.match(text))[0];
  }
}

const stepDefinitionRegistry = new StepDefinitionRegistry();

function resolveStepDefinition(step) {
  const stepDefinition = stepDefinitionRegistry.resolve(
    step.keyword.toLowerCase().trim(),
    step.text
  );
  return stepDefinition || {};
}

module.exports = {
  // eslint-disable-next-line func-names
  resolveAndRunStepDefinition(step) {
    const { expression, implementation } = resolveStepDefinition(step);
    if (expression && implementation) {
      let argument;
      if (step.argument) {
        if (step.argument.type === "DataTable") {
          argument = new DataTable(step.argument);
        } else if (step.argument.type === "DocString") {
          argument = step.argument.content;
        }
      }
      return implementation.call(
        this,
        ...expression.match(step.text).map(match => match.getValue()),
        argument
      );
    }
    throw new Error(`Step implementation missing for: ${step.text}`);
  },
  given: (expression, implementation) => {
    stepDefinitionRegistry.runtime(expression, implementation);
  },
  when: (expression, implementation) => {
    stepDefinitionRegistry.runtime(expression, implementation);
  },
  then: (expression, implementation) => {
    stepDefinitionRegistry.runtime(expression, implementation);
  },
  defineParameterType: defineParameterType(stepDefinitionRegistry)
};
