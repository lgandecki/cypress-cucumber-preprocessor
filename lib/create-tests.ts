import messages from "@cucumber/messages";

import parse from "@cucumber/tag-expressions";

import {
  CucumberExpressionGenerator,
  ParameterTypeRegistry,
} from "@cucumber/cucumber-expressions";

import { v4 as uuid } from "uuid";

import { assertAndReturn, fail } from "./assertions";

import DataTable from "./data_table";

import {
  assignRegistry,
  freeRegistry,
  IHook,
  MissingDefinitionError,
  Registry,
} from "./registry";

import {
  collectTagNames,
  createAstIdMap,
  traverseGherkinDocument,
} from "./ast-helpers";

import {
  HOOK_FAILURE_EXPR,
  INTERNAL_PROPERTY_NAME,
  INTERNAL_SPEC_PROPERTIES,
  INTERNAL_SUITE_PROPERTIES,
  TASK_APPEND_MESSAGES,
  TASK_TEST_STEP_STARTED,
} from "./constants";

import { getTags } from "./environment-helpers";

import { notNull } from "./type-guards";

import { looksLikeOptions, tagToCypressOptions } from "./tag-parser";

import { createTimestamp, duration } from "./messages-helpers";

import { createWeakCache } from "./helpers/maps";

import { indent, stripIndent } from "./helpers/strings";

import { generateSnippet } from "./snippets";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    // eslint-disable-next-line no-var
    var __cypress_cucumber_preprocessor_dont_use_this: true | undefined;
  }
}

type Node = ReturnType<typeof parse>;

interface CompositionContext {
  registry: Registry;
  gherkinDocument: messages.GherkinDocument;
  pickles: messages.Pickle[];
  testFilter: Node;
  omitFiltered: boolean;
  messages: {
    enabled: boolean;
    stack: messages.Envelope[];
  };
  stepDefinitionHints: {
    stepDefinitions: string | string[];
    stepDefinitionPatterns: string[];
    stepDefinitionPaths: string[];
  };
}

/**
 * From messages.TestStepFinished.TestStepResult.Status.
 */
const Status = {
  Unknown: "UNKNOWN" as unknown as 0,
  Passed: "PASSED" as unknown as 1,
  Skipped: "SKIPPED" as unknown as 2,
  Pending: "PENDING" as unknown as 3,
  Undefined: "UNDEFINED" as unknown as 4,
  Ambiguous: "AMBIGUOUS" as unknown as 5,
  Failed: "FAILED" as unknown as 6,
};

const sourceReference: messages.SourceReference = {
  uri: "not available",
  location: { line: 0 },
};

interface IStep {
  hook?: IHook;
  pickleStep?: messages.PickleStep;
}

export interface InternalSpecProperties {
  pickle: messages.Pickle;
  testCaseStartedId: string;
  currentStep?: IStep;
  allSteps: IStep[];
  remainingSteps: IStep[];
}

export interface InternalSuiteProperties {
  isEventHandlersAttached?: boolean;
}

function retrieveInternalSpecProperties(): InternalSpecProperties {
  return Cypress.env(INTERNAL_SPEC_PROPERTIES);
}

function retrieveInternalSuiteProperties():
  | InternalSuiteProperties
  | undefined {
  return Cypress.env(INTERNAL_SUITE_PROPERTIES);
}

function findPickleById(context: CompositionContext, astId: string) {
  return assertAndReturn(
    context.pickles.find(
      (pickle) => pickle.astNodeIds && pickle.astNodeIds.includes(astId)
    ),
    `Expected to find a pickle associated with id = ${astId}`
  );
}

function collectExampleIds(examples: readonly messages.Examples[]) {
  return examples
    .map((examples) => {
      return assertAndReturn(
        examples.tableBody,
        "Expected to find a table body"
      ).map((row) =>
        assertAndReturn(row.id, "Expected table row to have an id")
      );
    })
    .reduce((acum, el) => acum.concat(el), []);
}

function createFeature(context: CompositionContext, feature: messages.Feature) {
  describe(feature.name || "<unamed feature>", () => {
    if (feature.children) {
      for (const child of feature.children) {
        if (child.scenario) {
          createScenario(context, child.scenario);
        } else if (child.rule) {
          createRule(context, child.rule);
        }
      }
    }
  });
}

function createRule(context: CompositionContext, rule: messages.Rule) {
  const picklesWithinRule = rule.children
    ?.map((child) => child.scenario)
    .filter(notNull)
    .flatMap((scenario) => {
      if (scenario.examples.length > 0) {
        return collectExampleIds(scenario.examples).map((exampleId) => {
          return findPickleById(context, exampleId);
        });
      } else {
        const scenarioId = assertAndReturn(
          scenario.id,
          "Expected scenario to have an id"
        );

        return findPickleById(context, scenarioId);
      }
    });

  if (picklesWithinRule) {
    if (context.omitFiltered) {
      const matches = picklesWithinRule.filter((pickle) =>
        context.testFilter.evaluate(collectTagNames(pickle.tags))
      );

      if (matches.length === 0) {
        return;
      }
    }
  }

  describe(rule.name || "<unamed rule>", () => {
    if (rule.children) {
      for (const child of rule.children) {
        if (child.scenario) {
          createScenario(context, child.scenario);
        }
      }
    }
  });
}

const gherkinDocumentsAstIdMaps = createWeakCache(createAstIdMap);

function createScenario(
  context: CompositionContext,
  scenario: messages.Scenario
) {
  if (scenario.examples.length > 0) {
    const exampleIds = collectExampleIds(scenario.examples);

    for (let i = 0; i < exampleIds.length; i++) {
      const exampleId = exampleIds[i];

      const pickle = findPickleById(context, exampleId);

      const baseName = pickle.name || "<unamed scenario>";
 
      const  altName = scenario.examples[0].tableBody[i].cells[0].value || ""
       
      const exampleName = (altName === "") ? `${baseName} #(example #${i + 1})` : `${baseName} #${altName}`; 

      createPickle(context, { ...scenario, name: exampleName }, pickle);
    }
  } else {
    const scenarioId = assertAndReturn(
      scenario.id,
      "Expected scenario to have an id"
    );

    const pickle = findPickleById(context, scenarioId);

    createPickle(context, scenario, pickle);
  }
}

function createPickle(
  context: CompositionContext,
  scenario: messages.Scenario,
  pickle: messages.Pickle
) {
  const { registry, gherkinDocument, pickles, testFilter, messages } = context;
  const testCaseId = uuid();
  const pickleSteps = pickle.steps ?? [];
  const scenarioName = scenario.name || "<unamed scenario>";
  const tags = collectTagNames(pickle.tags);
  const beforeHooks = registry.resolveBeforeHooks(tags);
  const afterHooks = registry.resolveAfterHooks(tags);
  const definitionIds = pickleSteps.map(() => uuid());

  const steps: IStep[] = [
    ...beforeHooks.map((hook) => ({ hook })),
    ...pickleSteps.map((pickleStep) => ({ pickleStep })),
    ...afterHooks.map((hook) => ({ hook })),
  ];

  for (const id of definitionIds) {
    messages.stack.push({
      stepDefinition: {
        id,
        pattern: {
          source: "a step",
          type: "CUCUMBER_EXPRESSION" as unknown as messages.StepDefinitionPatternType.CUCUMBER_EXPRESSION,
        },
        sourceReference,
      },
    });
  }

  const testSteps: messages.TestStep[] = [];

  for (const beforeHook of beforeHooks) {
    testSteps.push({
      id: beforeHook.id,
      hookId: beforeHook.id,
    });
  }

  for (let i = 0; i < pickleSteps.length; i++) {
    const step = pickleSteps[i];

    testSteps.push({
      id: step.id,
      pickleStepId: step.id,
      stepDefinitionIds: [definitionIds[i]],
    });
  }

  for (const afterHook of afterHooks) {
    testSteps.push({
      id: afterHook.id,
      hookId: afterHook.id,
    });
  }

  messages.stack.push({
    testCase: {
      id: testCaseId,
      pickleId: pickle.id,
      testSteps,
    },
  });

  const astIdMap = gherkinDocumentsAstIdMaps.get(gherkinDocument);

  if (!testFilter.evaluate(tags) || tags.includes("@skip")) {
    if (!context.omitFiltered) {
      it.skip(scenarioName);
    }

    return;
  }

  let attempt = 0;

  const internalProperties: InternalSpecProperties = {
    pickle,
    testCaseStartedId: uuid(),
    allSteps: steps,
    remainingSteps: [...steps],
  };

  const internalEnv = { [INTERNAL_SPEC_PROPERTIES]: internalProperties };

  const suiteOptions = tags
    .filter(looksLikeOptions)
    .map(tagToCypressOptions)
    .reduce(Object.assign, {});

  if (suiteOptions.env) {
    Object.assign(suiteOptions.env, internalEnv);
  } else {
    suiteOptions.env = internalEnv;
  }

  it(scenarioName, suiteOptions, function () {
    const { remainingSteps, testCaseStartedId } =
      retrieveInternalSpecProperties();

    assignRegistry(registry);

    messages.stack.push({
      testCaseStarted: {
        id: testCaseStartedId,
        testCaseId,
        attempt: attempt++,
        timestamp: createTimestamp(),
      },
    });

    window.testState = {
      gherkinDocument,
      pickles,
      pickle,
    };

    for (const step of steps) {
      if (step.hook) {
        const hook = step.hook;

        cy.then(() => {
          delete window.testState.pickleStep;

          Cypress.log({
            name: "step",
            displayName: hook.keyword,
            message: "",
          });

          const start = createTimestamp();

          messages.stack.push({
            testStepStarted: {
              testStepId: hook.id,
              testCaseStartedId,
              timestamp: start,
            },
          });

          if (messages.enabled) {
            cy.task(TASK_TEST_STEP_STARTED, hook.id, { log: false });
          }

          return cy.wrap(start, { log: false });
        })
          .then((start) => {
            registry.runHook(this, hook);
            return cy.wrap(start, { log: false });
          })
          .then((start) => {
            const end = createTimestamp();

            messages.stack.push({
              testStepFinished: {
                testStepId: hook.id,
                testCaseStartedId,
                testStepResult: {
                  status:
                    Status.Passed as unknown as messages.TestStepResultStatus,
                  duration: duration(start, end),
                },
                timestamp: end,
              },
            });

            remainingSteps.shift();
          });
      } else if (step.pickleStep) {
        const pickleStep = step.pickleStep;

        const text = assertAndReturn(
          pickleStep.text,
          "Expected pickle step to have a text"
        );

        const scenarioStep = assertAndReturn(
          astIdMap.get(
            assertAndReturn(
              pickleStep.astNodeIds?.[0],
              "Expected to find at least one astNodeId"
            )
          ),
          `Expected to find scenario step associated with id = ${pickleStep.astNodeIds?.[0]}`
        );

        cy.then(() => {
          window.testState.pickleStep = step.pickleStep;

          Cypress.log({
            name: "step",
            displayName: assertAndReturn(
              "keyword" in scenarioStep && scenarioStep.keyword,
              "Expected to find a keyword in the scenario step"
            ),
            message: text,
          });
        });

        const argument: DataTable | string | undefined = pickleStep.argument
          ?.dataTable
          ? new DataTable(pickleStep.argument.dataTable)
          : pickleStep.argument?.docString?.content
          ? pickleStep.argument.docString.content
          : undefined;

        cy.then(() => {
          internalProperties.currentStep = { pickleStep };

          const start = createTimestamp();

          messages.stack.push({
            testStepStarted: {
              testStepId: pickleStep.id,
              testCaseStartedId,
              timestamp: start,
            },
          });

          if (messages.enabled) {
            cy.task(TASK_TEST_STEP_STARTED, pickleStep.id, { log: false });
          }

          return cy.wrap(start, { log: false });
        })
          .then((start) => {
            const ensureChain = (value: unknown): Cypress.Chainable<unknown> =>
              Cypress.isCy(value) ? value : cy.wrap(value, { log: false });

            try {
              return ensureChain(
                registry.runStepDefininition(this, text, argument)
              ).then((result: unknown) => {
                return {
                  start,
                  result,
                };
              });
            } catch (e) {
              if (e instanceof MissingDefinitionError) {
                throw new Error(
                  createMissingStepDefinitionMessage(
                    context,
                    pickleStep,
                    context.registry.parameterTypeRegistry
                  )
                );
              } else {
                throw e;
              }
            }
          })
          .then(({ start, result }) => {
            const end = createTimestamp();

            if (result === "pending") {
              messages.stack.push({
                testStepFinished: {
                  testStepId: pickleStep.id,
                  testCaseStartedId,
                  testStepResult: {
                    status:
                      Status.Pending as unknown as messages.TestStepResultStatus,
                    duration: duration(start, end),
                  },
                  timestamp: end,
                },
              });

              remainingSteps.shift();

              for (const skippedStep of remainingSteps) {
                const testStepId = assertAndReturn(
                  skippedStep.hook?.id ?? skippedStep.pickleStep?.id,
                  "Expected a step to either be a hook or a pickleStep"
                );

                messages.stack.push({
                  testStepStarted: {
                    testStepId,
                    testCaseStartedId,
                    timestamp: createTimestamp(),
                  },
                });

                messages.stack.push({
                  testStepFinished: {
                    testStepId,
                    testCaseStartedId,
                    testStepResult: {
                      status:
                        Status.Skipped as unknown as messages.TestStepResultStatus,
                      duration: {
                        seconds: 0,
                        nanos: 0,
                      },
                    },
                    timestamp: createTimestamp(),
                  },
                });
              }

              for (let i = 0, count = remainingSteps.length; i < count; i++) {
                remainingSteps.pop();
              }

              this.skip();
            } else {
              messages.stack.push({
                testStepFinished: {
                  testStepId: pickleStep.id,
                  testCaseStartedId,
                  testStepResult: {
                    status:
                      Status.Passed as unknown as messages.TestStepResultStatus,
                    duration: duration(start, end),
                  },
                  timestamp: end,
                },
              });

              remainingSteps.shift();
            }
          });
      }
    }
  });
}

function collectTagNamesFromGherkinDocument(
  gherkinDocument: messages.GherkinDocument
) {
  const tagNames: string[] = [];

  for (const node of traverseGherkinDocument(gherkinDocument)) {
    if ("tags" in node) {
      tagNames.push(...collectTagNames(node.tags));
    }
  }

  return tagNames;
}

export default function createTests(
  registry: Registry,
  source: string,
  gherkinDocument: messages.GherkinDocument,
  pickles: messages.Pickle[],
  messagesEnabled: boolean,
  omitFiltered: boolean,
  stepDefinitionHints: {
    stepDefinitions: string[];
    stepDefinitionPatterns: string[];
    stepDefinitionPaths: string[];
  }
) {
  const noopNode = { evaluate: () => true };
  const environmentTags = getTags(Cypress.env());
  const messages: messages.Envelope[] = [];

  messages.push({
    source: {
      data: source,
      uri: assertAndReturn(
        gherkinDocument.uri,
        "Expected gherkin document to have URI"
      ),
      mediaType:
        "text/x.cucumber.gherkin+plain" as messages.SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN,
    },
  });

  messages.push({
    gherkinDocument: {
      ...gherkinDocument,
    },
  });

  for (const pickle of pickles) {
    messages.push({
      pickle,
    });
  }

  for (const hook of [...registry.beforeHooks, ...registry.afterHooks]) {
    messages.push({
      hook: {
        id: hook.id,
        sourceReference,
      },
    });
  }

  const tagsInDocument = collectTagNamesFromGherkinDocument(gherkinDocument);

  const testFilter =
    tagsInDocument.includes("@only") || tagsInDocument.includes("@focus")
      ? parse("@only or @focus")
      : environmentTags
      ? parse(environmentTags)
      : noopNode;

  if (gherkinDocument.feature) {
    createFeature(
      {
        registry,
        gherkinDocument,
        pickles,
        testFilter,
        omitFiltered,
        messages: {
          enabled: messagesEnabled,
          stack: messages,
        },
        stepDefinitionHints,
      },
      gherkinDocument.feature
    );
  }

  const isHooksAttached = globalThis[INTERNAL_PROPERTY_NAME];

  if (isHooksAttached) {
    return;
  } else {
    globalThis[INTERNAL_PROPERTY_NAME] = true;
  }

  before(function () {
    if (!retrieveInternalSuiteProperties()?.isEventHandlersAttached) {
      fail(
        "Missing preprocessor event handlers (this usally means you've not invoked `addCucumberPreprocessorPlugin()` or not returned the config object in `setupNodeEvents()`)"
      );
    }
  });

  afterEach(function () {
    freeRegistry();

    const properties = retrieveInternalSpecProperties();

    const { testCaseStartedId, remainingSteps } = properties;

    const endTimestamp = createTimestamp();

    if (
      remainingSteps.length > 0 &&
      (this.currentTest?.state as unknown) !== "pending"
    ) {
      const error = assertAndReturn(
        this.currentTest?.err?.message,
        "Expected to find an error message"
      );

      if (HOOK_FAILURE_EXPR.test(error)) {
        return;
      }

      const failedStep = assertAndReturn(
        remainingSteps.shift(),
        "Expected there to be a remaining step"
      );

      const testStepId = assertAndReturn(
        failedStep.hook?.id ?? failedStep.pickleStep?.id,
        "Expected a step to either be a hook or a pickleStep"
      );

      const failedTestStepFinished: messages.Envelope = error.includes(
        "Step implementation missing"
      )
        ? {
            testStepFinished: {
              testStepId,
              testCaseStartedId,
              testStepResult: {
                status:
                  Status.Undefined as unknown as messages.TestStepResultStatus,
                duration: {
                  seconds: 0,
                  nanos: 0,
                },
              },
              timestamp: endTimestamp,
            },
          }
        : {
            testStepFinished: {
              testStepId,
              testCaseStartedId,
              testStepResult: {
                status:
                  Status.Failed as unknown as messages.TestStepResultStatus,
                message: this.currentTest?.err?.message,
                // TODO: Create a proper duration from when the step started.
                duration: {
                  seconds: 0,
                  nanos: 0,
                },
              },
              timestamp: endTimestamp,
            },
          };

      messages.push(failedTestStepFinished);

      for (const skippedStep of remainingSteps) {
        const testStepId = assertAndReturn(
          skippedStep.hook?.id ?? skippedStep.pickleStep?.id,
          "Expected a step to either be a hook or a pickleStep"
        );

        messages.push({
          testStepStarted: {
            testStepId,
            testCaseStartedId,
            timestamp: endTimestamp,
          },
        });

        messages.push({
          testStepFinished: {
            testStepId,
            testCaseStartedId,
            testStepResult: {
              status:
                Status.Skipped as unknown as messages.TestStepResultStatus,
              duration: {
                seconds: 0,
                nanos: 0,
              },
            },
            timestamp: endTimestamp,
          },
        });
      }
    }

    messages.push({
      testCaseFinished: {
        testCaseStartedId,
        timestamp: endTimestamp,
        willBeRetried: false,
      },
    });

    /**
     * Repopulate internal properties in case previous test is retried.
     */
    properties.testCaseStartedId = uuid();
    properties.remainingSteps = [...properties.allSteps];
  });

  after(function () {
    if (messagesEnabled) {
      cy.task(TASK_APPEND_MESSAGES, messages, { log: false });
    }
  });
}

function strictIsInteractive(): boolean {
  const isInteractive = Cypress.config(
    "isInteractive" as keyof Cypress.ConfigOptions
  );

  if (typeof isInteractive === "boolean") {
    return isInteractive;
  }

  throw new Error(
    "Expected to find a Cypress configuration property `isInteractive`, but didn't"
  );
}

function createMissingStepDefinitionMessage(
  context: CompositionContext,
  pickleStep: messages.PickleStep,
  parameterTypeRegistry: ParameterTypeRegistry
) {
  const noStepDefinitionPathsTemplate = `
    Step implementation missing for "<text>".

    We tried searching for files containing step definitions using the following search pattern templates:

    <step-definitions>

    These templates resolved to the following search patterns:

    <step-definition-patterns>

    These patterns matched **no files** containing step definitions. This almost certainly means that you have misconfigured \`stepDefinitions\`.

    You can implement it using the suggestion(s) below.

    <snippets>
  `;

  const someStepDefinitionPathsTemplate = `
    Step implementation missing for "<text>".

    We tried searching for files containing step definitions using the following search pattern templates:

    <step-definitions>

    These templates resolved to the following search patterns:

    <step-definition-patterns>

    These patterns matched the following files:

    <step-definition-paths>

    However, none of these files contained a step definition matching "<text>".

    You can implement it using the suggestion(s) below.

    <snippets>
  `;

  const { stepDefinitionHints } = context;

  const template =
    stepDefinitionHints.stepDefinitionPaths.length > 0
      ? someStepDefinitionPathsTemplate
      : noStepDefinitionPathsTemplate;

  const maybeEscape = (string: string) =>
    strictIsInteractive() ? string.replace("*", "\\*") : string;

  const prettyPrintList = (items: string[]) =>
    items.map((item) => "  - " + maybeEscape(item)).join("\n");

  let parameter: "dataTable" | "docString" | null = null;

  if (pickleStep.argument?.dataTable) {
    parameter = "dataTable";
  } else if (pickleStep.argument?.docString) {
    parameter = "docString";
  }

  const snippets = new CucumberExpressionGenerator(
    () => parameterTypeRegistry.parameterTypes
  )
    .generateExpressions(pickleStep.text)
    .map((expression) => generateSnippet(expression, parameter))
    .map((snippet) => indent(snippet, { count: 2 }))
    .join("\n\n");

  return stripIndent(template)
    .replaceAll("<text>", pickleStep.text)
    .replaceAll(
      "<step-definitions>",
      prettyPrintList([stepDefinitionHints.stepDefinitions].flat())
    )
    .replaceAll(
      "<step-definition-patterns>",
      prettyPrintList(stepDefinitionHints.stepDefinitionPatterns)
    )
    .replaceAll(
      "<step-definition-paths>",
      prettyPrintList(stepDefinitionHints.stepDefinitionPaths)
    )
    .replaceAll("<snippets>", snippets);
}
