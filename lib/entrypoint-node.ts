import DataTable from "./data_table";

import {
  IHookBody,
  IStepHookBody,
  IParameterTypeDefinition,
  IStepDefinitionBody,
} from "./public-member-types";

export {
  resolve as resolvePreprocessorConfiguration,
  IPreprocessorConfiguration as CucumberPreprocessorConfiguration,
} from "./preprocessor-configuration";

export {
  getStepDefinitionPatterns,
  getStepDefinitionPaths,
} from "./step-definitions";

export { default as addCucumberPreprocessorPlugin } from "./add-cucumber-preprocessor-plugin";

export {
  beforeRunHandler,
  afterRunHandler,
  beforeSpecHandler,
  afterSpecHandler,
  afterScreenshotHandler,
} from "./plugin-event-handlers";

/**
 * Everything below exist merely for the purpose of being nice with TypeScript. All of these methods
 * are exclusively used in the browser and the browser field in package.json points to ./methods.ts.
 */
function createUnimplemented() {
  return new Error("Cucumber methods aren't available in a node environment");
}

export { NOT_FEATURE_ERROR } from "./entrypoint-browser";

export function isFeature(): boolean {
  throw createUnimplemented();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function doesFeatureMatch(expression: string): boolean {
  throw createUnimplemented();
}

export function defineStep<T extends unknown[], C extends Mocha.Context>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description: string | RegExp,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  implementation: IStepDefinitionBody<T, C>
) {
  throw createUnimplemented();
}

export { defineStep as Given, defineStep as When, defineStep as Then };

export function Step(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  world: Mocha.Context,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  text: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  argument?: DataTable | string
) {
  throw createUnimplemented();
}

export function defineParameterType<T, C extends Mocha.Context>(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  options: IParameterTypeDefinition<T, C>
) {
  throw createUnimplemented();
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function attach(data: string | ArrayBuffer, mediaType?: string) {
  throw createUnimplemented();
}

export function Before(options: { tags?: string }, fn: IHookBody): void;
export function Before(fn: IHookBody): void;
export function Before(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  optionsOrFn: IHookBody | { tags?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  maybeFn?: IHookBody
) {
  throw createUnimplemented();
}

export function After(options: { tags?: string }, fn: IHookBody): void;
export function After(fn: IHookBody): void;
export function After(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  optionsOrFn: IHookBody | { tags?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  maybeFn?: IHookBody
) {
  throw createUnimplemented();
}

export function BeforeStep(options: { tags?: string }, fn: IStepHookBody): void;
export function BeforeStep(fn: IStepHookBody): void;
export function BeforeStep(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  optionsOrFn: IStepHookBody | { tags?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  maybeFn?: IStepHookBody
) {
  throw createUnimplemented();
}

export function AfterStep(options: { tags?: string }, fn: IStepHookBody): void;
export function AfterStep(fn: IStepHookBody): void;
export function AfterStep(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  optionsOrFn: IStepHookBody | { tags?: string },
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  maybeFn?: IStepHookBody
) {
  throw createUnimplemented();
}

export { default as DataTable } from "./data_table";
