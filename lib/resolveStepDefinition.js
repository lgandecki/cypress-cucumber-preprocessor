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

function storeTemplateRowsOnArgumentIfNotPresent(argument) {
  return !argument.templateRows
    ? Object.assign({}, argument, {
        templateRows: argument.rows
      })
    : argument;
}

function applyExampleData(argument, exampleRowData, replaceParameterTags) {
  const argumentWithTemplateRows = storeTemplateRowsOnArgumentIfNotPresent(
    argument
  );

  const scenarioDataTableRows = argumentWithTemplateRows.templateRows.map(
    tr => {
      if (!(tr && tr.type === "TableRow")) {
        return tr;
      }
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
  );
  return Object.assign({}, argumentWithTemplateRows, {
    rows: scenarioDataTableRows
  });
}

function resolveStepArgument(argument, exampleRowData, replaceParameterTags) {
  if (!argument) {
    return argument;
  }
  if (argument.type === "DataTable") {
    if (!exampleRowData) {
      return new DataTable(argument);
    }
    const argumentWithAppliedExampleData = applyExampleData(
      argument,
      exampleRowData,
      replaceParameterTags
    );

    return new DataTable(argumentWithAppliedExampleData);
  }
  if (argument.type === "DocString") {
    return argument.content;
  }
  return argument;
}

module.exports = {
  // eslint-disable-next-line func-names
  resolveAndRunStepDefinition(step, replaceParameterTags, exampleRowData) {
    const { expression, implementation } = resolveStepDefinition(step);
    const stepText = step.text;
    if (expression && implementation) {
      const argument = resolveStepArgument(
        step.argument,
        exampleRowData,
        replaceParameterTags
      );
      return implementation.call(
        this,
        ...expression.match(stepText).map(match => match.getValue()),
        argument
      );
    }
    throw new Error(`Step implementation missing for: ${stepText}`);
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
  and: (expression, implementation) => {
    stepDefinitionRegistry.runtime(expression, implementation);
  },
  but: (expression, implementation) => {
    stepDefinitionRegistry.runtime(expression, implementation);
  },
  defineStep: (expression, implementation) => {
    stepDefinitionRegistry.runtime(expression, implementation);
  },
  defineParameterType: defineParameterType(stepDefinitionRegistry)
};
