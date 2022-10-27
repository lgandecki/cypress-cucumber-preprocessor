import {
  CucumberExpression,
  RegularExpression,
  Expression,
  ParameterTypeRegistry,
  ParameterType,
} from "@cucumber/cucumber-expressions";

import parse from "@cucumber/tag-expressions";

import { v4 as uuid } from "uuid";

import { assertAndReturn } from "./assertions";

import DataTable from "./data_table";

import { CypressCucumberError } from "./error";

import {
  IHookBody,
  IParameterTypeDefinition,
  IStepDefinitionBody,
} from "./types";

import { maybeRetrievePositionFromSourceMap, Position } from "./source-map";

export interface IStepDefinition<T extends unknown[], C extends Mocha.Context> {
  expression: Expression;
  implementation: IStepDefinitionBody<T, C>;
  position?: Position;
}

export class MissingDefinitionError extends CypressCucumberError {}

export class MultipleDefinitionsError extends CypressCucumberError {}

export type HookKeyword = "Before" | "After";

export interface IHook {
  id: string;
  node: ReturnType<typeof parse>;
  implementation: IHookBody;
  keyword: HookKeyword;
  position?: Position;
}

const noopNode = { evaluate: () => true };

function parseHookArguments(
  options: { tags?: string },
  fn: IHookBody,
  keyword: HookKeyword,
  position?: Position
): IHook {
  return {
    id: uuid(),
    node: options.tags ? parse(options.tags) : noopNode,
    implementation: fn,
    keyword,
    position,
  };
}

export class Registry {
  public parameterTypeRegistry: ParameterTypeRegistry;

  private preliminaryStepDefinitions: {
    description: string | RegExp;
    implementation: () => void;
    position?: Position;
  }[] = [];

  public stepDefinitions: IStepDefinition<unknown[], Mocha.Context>[] = [];

  public beforeHooks: IHook[] = [];

  public afterHooks: IHook[] = [];

  constructor(private experimentalSourceMap: boolean) {
    this.defineStep = this.defineStep.bind(this);
    this.runStepDefininition = this.runStepDefininition.bind(this);
    this.defineParameterType = this.defineParameterType.bind(this);
    this.defineBefore = this.defineBefore.bind(this);
    this.defineAfter = this.defineAfter.bind(this);

    this.parameterTypeRegistry = new ParameterTypeRegistry();
  }

  public finalize() {
    for (const { description, implementation, position } of this
      .preliminaryStepDefinitions) {
      if (typeof description === "string") {
        this.stepDefinitions.push({
          expression: new CucumberExpression(
            description,
            this.parameterTypeRegistry
          ),
          implementation,
          position,
        });
      } else {
        this.stepDefinitions.push({
          expression: new RegularExpression(
            description,
            this.parameterTypeRegistry
          ),
          implementation,
          position,
        });
      }
    }
  }

  public defineStep(description: string | RegExp, implementation: () => void) {
    if (typeof description !== "string" && !(description instanceof RegExp)) {
      throw new Error("Unexpected argument for step definition");
    }

    this.preliminaryStepDefinitions.push({
      description,
      implementation,
      position: maybeRetrievePositionFromSourceMap(this.experimentalSourceMap),
    });
  }

  public defineParameterType<T, C extends Mocha.Context>({
    name,
    regexp,
    transformer,
  }: IParameterTypeDefinition<T, C>) {
    this.parameterTypeRegistry.defineParameterType(
      new ParameterType(name, regexp, null, transformer, true, false)
    );
  }

  public defineBefore(options: { tags?: string }, fn: IHookBody) {
    this.beforeHooks.push(
      parseHookArguments(
        options,
        fn,
        "Before",
        maybeRetrievePositionFromSourceMap(this.experimentalSourceMap)
      )
    );
  }

  public defineAfter(options: { tags?: string }, fn: IHookBody) {
    this.afterHooks.push(
      parseHookArguments(
        options,
        fn,
        "After",
        maybeRetrievePositionFromSourceMap(this.experimentalSourceMap)
      )
    );
  }

  public getMatchingStepDefinitions(text: string) {
    return this.stepDefinitions.filter((stepDefinition) =>
      stepDefinition.expression.match(text)
    );
  }

  public resolveStepDefintion(text: string) {
    const matchingStepDefinitions = this.getMatchingStepDefinitions(text);

    if (matchingStepDefinitions.length === 0) {
      throw new MissingDefinitionError(
        `Step implementation missing for: ${text}`
      );
    } else if (matchingStepDefinitions.length > 1) {
      throw new MultipleDefinitionsError(
        `Multiple matching step definitions for: ${text}\n` +
          matchingStepDefinitions
            .map((stepDefinition) => {
              const { expression } = stepDefinition;

              const stringExpression =
                expression instanceof RegularExpression
                  ? String(expression.regexp)
                  : expression.source;

              if (stepDefinition.position) {
                return ` ${stringExpression} - ${stepDefinition.position.source}:${stepDefinition.position.line}`;
              } else {
                return ` ${stringExpression}`;
              }
            })
            .join("\n")
      );
    } else {
      return matchingStepDefinitions[0];
    }
  }

  public runStepDefininition(
    world: Mocha.Context,
    text: string,
    argument?: DataTable | string
  ): unknown {
    const stepDefinition = this.resolveStepDefintion(text);

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const args = stepDefinition.expression
      .match(text)!
      .map((match) => match.getValue(world));

    if (argument) {
      args.push(argument);
    }

    return stepDefinition.implementation.apply(world, args);
  }

  public resolveBeforeHooks(tags: string[]) {
    return this.beforeHooks.filter((beforeHook) =>
      beforeHook.node.evaluate(tags)
    );
  }

  public resolveAfterHooks(tags: string[]) {
    return this.afterHooks.filter((beforeHook) =>
      beforeHook.node.evaluate(tags)
    );
  }

  public runHook(world: Mocha.Context, hook: IHook) {
    hook.implementation.call(world);
  }
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace globalThis {
    // eslint-disable-next-line no-var
    var __cypress_cucumber_preprocessor_registry_dont_use_this:
      | Registry
      | undefined;
  }
}

const globalPropertyName =
  "__cypress_cucumber_preprocessor_registry_dont_use_this";

export function withRegistry(
  experimentalSourceMap: boolean,
  fn: () => void
): Registry {
  const registry = new Registry(experimentalSourceMap);
  assignRegistry(registry);
  fn();
  freeRegistry();
  return registry;
}

export function assignRegistry(registry: Registry) {
  globalThis[globalPropertyName] = registry;
}

export function freeRegistry() {
  delete globalThis[globalPropertyName];
}

export function getRegistry() {
  return assertAndReturn(
    globalThis[globalPropertyName],
    "Expected to find a global registry (this usually means you are trying to define steps or hooks in support/e2e.js, which is not supported)"
  );
}
