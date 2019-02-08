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
  resolveAndRunStepDefinition(step, replaceParameterTags, exampleRowData) {
    const modifiedStep = step;
    const { expression, implementation } = resolveStepDefinition(step);
    if (expression && implementation) {
      let argument;
      if (modifiedStep.argument) {
        if (modifiedStep.argument.type === "DataTable") {
          if (exampleRowData) {
            if (!modifiedStep.argument.templateRows) {
              modifiedStep.argument.templateRows = modifiedStep.argument.rows;
            }
            const scenarioDataTableRows = modifiedStep.argument.templateRows.map(
              tr => {
                if (tr && tr.type === "TableRow") {
                  const cells = {
                    cells: tr.cells.map(c => {
                      const value = {
                        value: replaceParameterTags(exampleRowData, c.value)
                      };
                      return Object.assign({}, c, value);
                    })
                  };
                  return Object.assign({}, tr, cells);
                }
                return tr;
              }
            );
            modifiedStep.argument.rows = scenarioDataTableRows;
          }
          argument = new DataTable(modifiedStep.argument);
        } else if (modifiedStep.argument.type === "DocString") {
          argument = modifiedStep.argument.content;
        }
      }
      return implementation.call(
        this,
        ...expression.match(modifiedStep.text).map(match => match.getValue()),
        argument
      );
    }
    throw new Error(`Step implementation missing for: ${modifiedStep.text}`);
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
