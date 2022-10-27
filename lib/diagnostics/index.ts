#!/usr/bin/env node

import { inspect } from "util";
import path from "path";
import {
  CucumberExpressionGenerator,
  Expression,
  RegularExpression,
} from "@cucumber/cucumber-expressions";
import {
  getConfiguration as resolveCypressConfiguration,
  getTestFiles,
} from "@badeball/cypress-configuration";
import { addAlias } from "module-alias";
import Table from "cli-table";
import ancestor from "common-ancestor-path";
import { resolve as resolvePreprocessorConfiguration } from "../preprocessor-configuration";
import { Position } from "../source-map";
import { IStepDefinition } from "../registry";
import { ensureIsRelative } from "../helpers/paths";
import { indent } from "../helpers/strings";
import {
  AmbiguousStep,
  diagnose,
  DiagnosticResult,
  UnmatchedStep,
} from "./diagnose";
import { assertAndReturn } from "../assertions";
import { generateSnippet } from "../snippets";

export function log(...lines: string[]) {
  console.log(lines.join("\n"));
}

export function red(message: string): string {
  return `\x1b[31m${message}\x1b[0m`;
}

export function yellow(message: string): string {
  return `\x1b[33m${message}\x1b[0m`;
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

export function groupToMap<T, K>(
  collection: T[],
  getKeyFn: (el: T) => K,
  compareKeyFn: (a: K, b: K) => boolean
): Map<K, T[]> {
  const map = new Map<K, T[]>();

  el: for (const el of collection) {
    const key = getKeyFn(el);

    for (const existingKey of map.keys()) {
      if (compareKeyFn(key, existingKey)) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        map.get(existingKey)!.push(el);
        continue el;
      }
    }

    map.set(key, [el]);
  }

  return map;
}

export function mapValues<K, A, B>(
  map: Map<K, A>,
  fn: (el: A) => B
): Map<K, B> {
  const mapped = new Map<K, B>();

  for (const [key, value] of map.entries()) {
    mapped.set(key, fn(value));
  }

  return mapped;
}

export function createLineBuffer(
  fn: (append: (string: string) => void) => void
): string[] {
  const buffer: string[] = [];
  const append = (line: string) => buffer.push(line);
  fn(append);
  return buffer;
}

export function createDefinitionsUsage(
  projectRoot: string,
  result: DiagnosticResult
): string {
  const groups = mapValues(
    groupToMap(
      result.definitionsUsage,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      (definitionsUsage) => definitionsUsage.definition.position!.source,
      strictCompare
    ),
    (definitionsUsages) =>
      mapValues(
        groupToMap(
          definitionsUsages,
          (definitionsUsage) => definitionsUsage.definition,
          compareStepDefinition
        ),
        (definitionsUsages) =>
          definitionsUsages.flatMap(
            (definitionsUsage) => definitionsUsage.steps
          )
      )
  );

  const entries: [string, string][] = Array.from(groups.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .flatMap(([, matches]) => {
      return Array.from(matches.entries())
        .sort((a, b) => position(a[0]).line - position(b[0]).line)
        .map<[string, string]>(([stepDefinition, steps]) => {
          const { expression } = stepDefinition;

          const right = [
            inspect(
              expression instanceof RegularExpression
                ? expression.regexp
                : expression.source
            ) + (steps.length === 0 ? ` (${yellow("unused")})` : ""),
            ...steps.map((step) => {
              return "  " + step.text;
            }),
          ].join("\n");

          const left = [
            ensureIsRelative(projectRoot, position(stepDefinition).source) +
              ":" +
              position(stepDefinition).line,
            ...steps.map((step) => {
              return (
                ensureIsRelative(projectRoot, step.source) + ":" + step.line
              );
            }),
          ].join("\n");

          return [right, left];
        });
    });

  const table = new Table({
    head: ["Pattern / Text", "Location"],
    style: {
      head: [], // Disable colors in header cells.
      border: [], // Disable colors for the border.
    },
  });

  table.push(...entries);

  return table.toString();
}

export function createAmbiguousStep(
  projectRoot: string,
  ambiguousStep: AmbiguousStep
): string[] {
  const relativeToProjectRoot = (path: string) =>
    ensureIsRelative(projectRoot, path);

  return createLineBuffer((append) => {
    append(
      `${red(
        "Error"
      )}: Multiple matching step definitions at ${relativeToProjectRoot(
        ambiguousStep.step.source
      )}:${ambiguousStep.step.line} for`
    );
    append("");
    append("  " + ambiguousStep.step.text);
    append("");
    append("Step matched the following definitions:");
    append("");

    ambiguousStep.definitions
      .map(
        (definition) =>
          `  - ${inspect(
            definition.expression instanceof RegularExpression
              ? definition.expression.regexp
              : definition.expression.source
          )} (${relativeToProjectRoot(position(definition).source)}:${
            position(definition).line
          })`
      )
      .forEach(append);
  });
}

export function createUnmatchedStep(
  projectRoot: string,
  unmatch: UnmatchedStep
): string[] {
  const relativeToProjectRoot = (path: string) =>
    ensureIsRelative(projectRoot, path);

  return createLineBuffer((append) => {
    append(
      `${red("Error")}: Step implementation missing at ${relativeToProjectRoot(
        unmatch.step.source
      )}:${unmatch.step.line}`
    );
    append("");
    append("  " + unmatch.step.text);
    append("");
    append(
      "We tried searching for files containing step definitions using the following search pattern template(s):"
    );
    append("");
    unmatch.stepDefinitionHints.stepDefinitions
      .map((stepDefinition) => "  - " + stepDefinition)
      .forEach(append);
    append("");
    append("These templates resolved to the following search pattern(s):");
    append("");
    unmatch.stepDefinitionHints.stepDefinitionPatterns
      .map(
        (stepDefinitionPattern) =>
          "  - " + relativeToProjectRoot(stepDefinitionPattern)
      )
      .forEach(append);
    append("");

    if (unmatch.stepDefinitionHints.stepDefinitionPaths.length === 0) {
      append(
        "These patterns matched *no files* containing step definitions. This almost certainly means that you have misconfigured `stepDefinitions`. Alternatively, you can implement it using the suggestion(s) below."
      );
    } else {
      append("These patterns matched the following file(s):");
      append("");
      unmatch.stepDefinitionHints.stepDefinitionPaths
        .map(
          (stepDefinitionPath) =>
            "  - " + relativeToProjectRoot(stepDefinitionPath)
        )
        .forEach(append);
      append("");
      append(
        "However, none of these files contained a matching step definition. You can implement it using the suggestion(s) below."
      );
    }

    const cucumberExpressionGenerator = new CucumberExpressionGenerator(
      () => unmatch.parameterTypeRegistry.parameterTypes
    );

    const generatedExpressions =
      cucumberExpressionGenerator.generateExpressions(unmatch.step.text);

    for (const generatedExpression of generatedExpressions) {
      append("");

      append(
        indent(generateSnippet(generatedExpression, unmatch.argument), {
          count: 2,
        })
      );
    }
  });
}

export async function execute(options: {
  argv: string[];
  env: NodeJS.ProcessEnv;
  cwd: string;
}): Promise<void> {
  addAlias(
    "@badeball/cypress-cucumber-preprocessor",
    "@badeball/cypress-cucumber-preprocessor/methods"
  );

  const cypress = resolveCypressConfiguration(options);

  const implicitIntegrationFolder = assertAndReturn(
    ancestor(...getTestFiles(cypress).map(path.dirname).map(path.normalize)),
    "Expected to find a common ancestor path"
  );

  const preprocessor = await resolvePreprocessorConfiguration(
    cypress,
    options.env,
    implicitIntegrationFolder
  );

  const result = await diagnose({
    cypress,
    preprocessor,
  });

  log(
    ...createLineBuffer((append) => {
      append(createDefinitionsUsage(cypress.projectRoot, result));

      append("");

      const problems = [
        ...result.ambiguousSteps.map((ambiguousStep) => {
          return { ambiguousStep };
        }),
        ...result.unmatchedSteps.map((unmatchedStep) => {
          return { unmatchedStep };
        }),
      ];

      if (problems.length > 0) {
        append(`Found ${problems.length} problem(s):`);
        append("");

        for (let i = 0; i < problems.length; i++) {
          const problem = problems[i];

          const lines =
            "ambiguousStep" in problem
              ? createAmbiguousStep(cypress.projectRoot, problem.ambiguousStep)
              : createUnmatchedStep(cypress.projectRoot, problem.unmatchedStep);

          const title = `${i + 1}) `;

          const [first, ...rest] = lines;

          append(title + first);

          rest
            .map((line) =>
              line === "" ? "" : indent(line, { count: title.length })
            )
            .forEach(append);

          if (i !== problems.length - 1) {
            append("");
          }
        }

        process.exitCode = 1;
      } else {
        append("No problems found.");
      }
    })
  );
}

if (require.main === module) {
  execute({ argv: process.argv, env: process.env, cwd: process.cwd() });
}
