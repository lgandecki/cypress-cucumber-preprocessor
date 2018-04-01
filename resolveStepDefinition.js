const DataTable = require("cucumber/lib/models/data_table").default;
const {
  CucumberExpression,
  ParameterTypeRegistry
} = require("cucumber-expressions");

const parameterTypeRegistry = new ParameterTypeRegistry();

class StepDefinitionRegistry {
  constructor() {
    this.definitions = {};
    this.runtime = {};
    this.latestType = "";

    ["given", "when", "then", "and"].forEach(keyword => {
      this.definitions[keyword] = [];
      this.runtime[keyword] = (expression, implementation) => {
        this.definitions[keyword].push({
          implementation,
          expression: new CucumberExpression(expression, parameterTypeRegistry)
        });
      };
    });

    this.load = definitionFactoryFunction =>
      definitionFactoryFunction(this.runtime);

    this.resolve = (type, text) => {
      if (this.definitions[type]) {
        this.latestType = type;
        return this.definitions[type].filter(({ expression }) =>
          expression.match(text)
        )[0];
      }
      return undefined;
    };
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
  resolveAndRunStepDefinition: step => {
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
      return implementation(
        ...expression.match(step.text).map(match => match.getValue()),
        argument
      );
    }
    throw new Error(`Step implementation missing for: ${step.text}`);
  },
  given: (expression, implementation) => {
    stepDefinitionRegistry.runtime.given(expression, implementation);
  },
  when: (expression, implementation) => {
    stepDefinitionRegistry.runtime.when(expression, implementation);
  },
  then: (expression, implementation) => {
    stepDefinitionRegistry.runtime.then(expression, implementation);
  },
  and: (expression, implementation) => {
    stepDefinitionRegistry.runtime.and(expression, implementation);
  }
};
