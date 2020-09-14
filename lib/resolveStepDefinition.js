const DataTable = require("cucumber/lib/models/data_table").default;
const {
  defineParameterType,
} = require("cucumber/lib/support_code_library_builder/define_helpers");
const {
  CucumberExpression,
  RegularExpression,
  ParameterTypeRegistry,
} = require("cucumber-expressions");

const { HookRegistry } = require("./hookRegistry");

class StepDefinitionRegistry {
  constructor() {
    this.definitions = {};
    this.runtime = {};
    this.options = {
      parameterTypeRegistry: new ParameterTypeRegistry(),
    };

    this.definitions = [];
    this.runtime = (...args) => {
      let matcher;
      let config;
      let implementation;
      if (args.length > 2) {
        [matcher, config, implementation] = args;
      } else {
        [matcher, implementation] = args;
      }
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

      this.definitions.push({
        implementation,
        expression,
        config,
        featureName: window.currentFeatureName || "___GLOBAL_EXECUTION___",
      });
    };

    this.resolve = (type, text, runningFeatureName) =>
      this.definitions.filter(
        ({ expression, featureName }) =>
          expression.match(text) &&
          (runningFeatureName === featureName ||
            featureName === "___GLOBAL_EXECUTION___")
      )[0];
  }
}

const stepDefinitionRegistry = new StepDefinitionRegistry();
const beforeHookRegistry = new HookRegistry();
const afterHookRegistry = new HookRegistry();

function resolveStepDefinition(step, featureName) {
  const stepDefinition = stepDefinitionRegistry.resolve(
    step.keyword.toLowerCase().trim(),
    step.text,
    featureName
  );
  return stepDefinition || {};
}

function storeTemplateRowsOnArgumentIfNotPresent(argument) {
  return !argument.templateRows
    ? { ...argument, templateRows: argument.rows }
    : argument;
}

function applyExampleData(argument, exampleRowData, replaceParameterTags) {
  const argumentWithTemplateRows = storeTemplateRowsOnArgumentIfNotPresent(
    argument
  );

  const scenarioDataTableRows = argumentWithTemplateRows.templateRows.map(
    (tr) => {
      if (!(tr && tr.type === "TableRow")) {
        return tr;
      }
      const cells = {
        cells: tr.cells.map((c) => {
          const value = {
            value: replaceParameterTags(exampleRowData, c.value),
          };
          return { ...c, ...value };
        }),
      };
      return { ...tr, ...cells };
    }
  );
  return { ...argumentWithTemplateRows, rows: scenarioDataTableRows };
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

function resolveAndRunHooks(hookRegistry, scenarioTags, featureName) {
  return window.Cypress.Promise.each(
    hookRegistry.resolve(scenarioTags, featureName),
    ({ implementation }) => implementation.call(this)
  );
}

function parseHookArgs(args) {
  if (args.length === 2) {
    if (typeof args[0] !== "object" || typeof args[0].tags !== "string") {
      throw new Error(
        "Hook definitions with two arguments should have an object containing tags (string) as the first argument."
      );
    }
    if (typeof args[1] !== "function") {
      throw new Error(
        "Hook definitions with two arguments must have a function as the second argument."
      );
    }
    return {
      tags: args[0].tags,
      implementation: args[1],
    };
  }
  if (typeof args[0] !== "function") {
    throw new Error(
      "Hook definitions with one argument must have a function as the first argument."
    );
  }
  return {
    implementation: args[0],
  };
}

module.exports = {
  resolveStepDefinition(step, featureName) {
    return resolveStepDefinition(step, featureName);
  },
  resolveAndRunBeforeHooks(scenarioTags, featureName) {
    return resolveAndRunHooks(beforeHookRegistry, scenarioTags, featureName);
  },
  resolveAndRunAfterHooks(scenarioTags, featureName) {
    return resolveAndRunHooks(afterHookRegistry, scenarioTags, featureName);
  },
  // eslint-disable-next-line func-names
  resolveAndRunStepDefinition(
    step,
    replaceParameterTags,
    exampleRowData,
    featureName
  ) {
    const { expression, implementation } = resolveStepDefinition(
      step,
      featureName
    );
    const stepText = step.text;
    if (expression && implementation) {
      const argument = resolveStepArgument(
        step.argument,
        exampleRowData,
        replaceParameterTags
      );
      return implementation.call(
        this,
        ...expression.match(stepText).map((match) => match.getValue()),
        argument
      );
    }
    throw new Error(`Step implementation missing for: ${stepText}`);
  },
  Given: (...args) => {
    stepDefinitionRegistry.runtime(...args);
  },
  When: (...args) => {
    stepDefinitionRegistry.runtime(...args);
  },
  Then: (...args) => {
    stepDefinitionRegistry.runtime(...args);
  },
  And: (...args) => {
    stepDefinitionRegistry.runtime(...args);
  },
  But: (...args) => {
    stepDefinitionRegistry.runtime(...args);
  },
  Before: (...args) => {
    const { tags, implementation } = parseHookArgs(args);
    beforeHookRegistry.runtime(tags, implementation);
  },
  After: (...args) => {
    const { tags, implementation } = parseHookArgs(args);
    afterHookRegistry.runtime(tags, implementation);
  },
  defineStep: (expression, implementation) => {
    stepDefinitionRegistry.runtime(expression, implementation);
  },
  defineParameterType: defineParameterType(stepDefinitionRegistry),
};
