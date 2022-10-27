import fs from "fs/promises";
import path from "path";
import util from "util";
import {
  getTestFiles,
  ICypressConfiguration,
} from "@badeball/cypress-configuration";
import {
  Expression,
  ParameterTypeRegistry,
  RegularExpression,
} from "@cucumber/cucumber-expressions";
import { generateMessages } from "@cucumber/gherkin";
import { IdGenerator, SourceMediaType } from "@cucumber/messages";
import * as esbuild from "esbuild";
import sourceMap from "source-map";
import { assert, assertAndReturn } from "../assertions";
import { createAstIdMap } from "../ast-helpers";
import { ensureIsRelative } from "../helpers/paths";
import { IPreprocessorConfiguration } from "../preprocessor-configuration";
import { IStepDefinition, Registry, withRegistry } from "../registry";
import { Position } from "../source-map";
import {
  getStepDefinitionPatterns,
  getStepDefinitionPaths,
} from "../step-definitions";
import { notNull } from "../type-guards";

export interface DiagnosticStep {
  source: string;
  line: number;
  text: string;
}

export interface UnmatchedStep {
  step: DiagnosticStep;
  argument: "docString" | "dataTable" | null;
  parameterTypeRegistry: ParameterTypeRegistry;
  stepDefinitionHints: {
    stepDefinitions: string[];
    stepDefinitionPatterns: string[];
    stepDefinitionPaths: string[];
  };
}

export interface AmbiguousStep {
  step: DiagnosticStep;
  definitions: IStepDefinition<unknown[], Mocha.Context>[];
}

export interface DiagnosticResult {
  definitionsUsage: {
    definition: IStepDefinition<unknown[], Mocha.Context>;
    steps: DiagnosticStep[];
  }[];
  unmatchedSteps: UnmatchedStep[];
  ambiguousSteps: AmbiguousStep[];
}

export function expressionToString(expression: Expression) {
  return expression instanceof RegularExpression
    ? String(expression.regexp)
    : expression.source;
}

export function strictCompare<T>(a: T, b: T) {
  return a === b;
}

export function comparePosition(a: Position, b: Position) {
  return a.source === b.source && a.column === b.column && a.line === b.line;
}

export function compareStepDefinition(
  a: IStepDefinition<unknown[], Mocha.Context>,
  b: IStepDefinition<unknown[], Mocha.Context>
) {
  return (
    expressionToString(a.expression) === expressionToString(b.expression) &&
    comparePosition(position(a), position(b))
  );
}

export function position(
  definition: IStepDefinition<unknown[], Mocha.Context>
): Position {
  return assertAndReturn(definition.position, "Expected to find a position");
}

export async function diagnose(configuration: {
  cypress: ICypressConfiguration;
  preprocessor: IPreprocessorConfiguration;
}): Promise<DiagnosticResult> {
  const result: DiagnosticResult = {
    definitionsUsage: [],
    unmatchedSteps: [],
    ambiguousSteps: [],
  };

  const testFiles = getTestFiles(configuration.cypress);

  for (const testFile of testFiles) {
    if (!testFile.endsWith(".feature")) {
      continue;
    }

    const stepDefinitionPatterns = getStepDefinitionPatterns(
      configuration,
      testFile
    );

    const stepDefinitions = await getStepDefinitionPaths(
      stepDefinitionPatterns
    );

    const randomPart = Math.random().toString(16).slice(2, 8);

    const inputFileName = path.join(
      configuration.cypress.projectRoot,
      ".input-" + randomPart + ".js"
    );

    const outputFileName = path.join(
      configuration.cypress.projectRoot,
      ".output-" + randomPart + ".js"
    );

    let registry: Registry;

    try {
      await fs.writeFile(
        inputFileName,
        stepDefinitions
          .map(
            (stepDefinition) => `require(${JSON.stringify(stepDefinition)});`
          )
          .join("\n")
      );

      const esbuildResult = await esbuild.build({
        entryPoints: [inputFileName],
        bundle: true,
        sourcemap: "external",
        outfile: outputFileName,
      });

      if (esbuildResult.errors.length > 0) {
        for (const error of esbuildResult.errors) {
          console.error(JSON.stringify(error));
        }

        throw new Error(
          `Failed to compile steø definitions of ${testFile}, with errors shown above...`
        );
      }

      registry = withRegistry(true, () => {
        (globalThis as any).Cypress = {};

        try {
          require(outputFileName);
        } catch (e: unknown) {
          console.log(util.inspect(e));

          throw new Error(
            "Failed to evaluate step definitions, with errors shown above..."
          );
        }
      });

      registry.finalize();

      const consumer = await new sourceMap.SourceMapConsumer(
        (await fs.readFile(outputFileName + ".map")).toString()
      );

      for (const stepDefinition of registry.stepDefinitions) {
        const originalPosition = position(stepDefinition);

        const newPosition = consumer.originalPositionFor(originalPosition);

        stepDefinition.position = {
          line: assertAndReturn(
            newPosition.line,
            "Expected to find a line number"
          ),
          column: assertAndReturn(
            newPosition.column,
            "Expected to find a column number"
          ),
          source: assertAndReturn(
            newPosition.source,
            "Expected to find a source"
          ),
        };
      }

      consumer.destroy();
    } finally {
      /**
       * Delete without regard for errors.
       */
      await fs.rm(inputFileName).catch(() => true);
      await fs.rm(outputFileName).catch(() => true);
      await fs.rm(outputFileName + ".map").catch(() => true);
    }

    const options = {
      includeSource: false,
      includeGherkinDocument: true,
      includePickles: true,
      newId: IdGenerator.uuid(),
    };

    const relativeUri = ensureIsRelative(
      configuration.cypress.projectRoot,
      testFile
    );

    const envelopes = generateMessages(
      (await fs.readFile(testFile)).toString(),
      relativeUri,
      SourceMediaType.TEXT_X_CUCUMBER_GHERKIN_PLAIN,
      options
    );

    const gherkinDocument = assertAndReturn(
      envelopes
        .map((envelope) => envelope.gherkinDocument)
        .find((document) => document),
      "Expected to find a gherkin document"
    );

    for (const stepDefinition of registry.stepDefinitions) {
      const usage = result.definitionsUsage.find((usage) =>
        compareStepDefinition(usage.definition, stepDefinition)
      );

      if (!usage) {
        result.definitionsUsage.push({
          definition: stepDefinition,
          steps: [],
        });
      }
    }

    const astIdMap = createAstIdMap(gherkinDocument);

    const pickles = envelopes
      .map((envelope) => envelope.pickle)
      .filter(notNull);

    for (const pickle of pickles) {
      if (pickle.steps) {
        for (const step of pickle.steps) {
          const text = assertAndReturn(
            step.text,
            "Expected pickle step to have a text"
          );

          const matchingStepDefinitions =
            registry.getMatchingStepDefinitions(text);

          const astNodeId = assertAndReturn(
            step.astNodeIds?.[0],
            "Expected to find at least one astNodeId"
          );

          const astNode = assertAndReturn(
            astIdMap.get(astNodeId),
            `Expected to find scenario step associated with id = ${astNodeId}`
          );

          assert("location" in astNode, "Expected ast node to have a location");

          if (matchingStepDefinitions.length === 0) {
            let argument: "docString" | "dataTable" | null = null;

            if (step.argument?.dataTable) {
              argument = "dataTable";
            } else if (step.argument?.docString) {
              argument = "docString";
            }

            result.unmatchedSteps.push({
              step: {
                source: testFile,
                line: astNode.location.line,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                text: step.text!,
              },
              argument,
              parameterTypeRegistry: registry.parameterTypeRegistry,
              stepDefinitionHints: {
                stepDefinitions: [
                  configuration.preprocessor.stepDefinitions,
                ].flat(),
                stepDefinitionPatterns,
                stepDefinitionPaths: stepDefinitions,
              },
            });
          } else if (matchingStepDefinitions.length === 1) {
            const usage = assertAndReturn(
              result.definitionsUsage.find((usage) =>
                compareStepDefinition(
                  usage.definition,
                  matchingStepDefinitions[0]
                )
              ),
              "Expected to find usage"
            );

            usage.steps.push({
              source: testFile,
              line: astNode.location?.line,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              text: step.text!,
            });
          } else {
            for (const matchingStepDefinition of matchingStepDefinitions) {
              const usage = assertAndReturn(
                result.definitionsUsage.find((usage) =>
                  compareStepDefinition(
                    usage.definition,
                    matchingStepDefinition
                  )
                ),
                "Expected to find usage"
              );

              usage.steps.push({
                source: testFile,
                line: astNode.location.line,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                text: step.text!,
              });
            }

            result.ambiguousSteps.push({
              step: {
                source: testFile,
                line: astNode.location.line,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                text: step.text!,
              },
              definitions: matchingStepDefinitions,
            });
          }
        }
      }
    }
  }

  return result;
}
