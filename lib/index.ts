import messages from "@cucumber/messages";

import DataTable from "./data_table";

import {
  IHookBody,
  IParameterTypeDefinition,
  IStepDefinitionBody,
} from "./types";

declare global {
  interface Window {
    testState: {
      gherkinDocument: messages.GherkinDocument;
      pickles: messages.Pickle[];
      pickle: messages.Pickle;
      pickleStep?: messages.PickleStep;
    };
  }
}

export { resolve as resolvePreprocessorConfiguration } from "./preprocessor-configuration";

export {
  getStepDefinitionPatterns,
  getStepDefinitionPaths,
} from "./step-definitions";

export {
  default as addCucumberPreprocessorPlugin,
  beforeRunHandler,
  afterRunHandler,
  beforeSpecHandler,
  afterSpecHandler,
  afterScreenshotHandler,
} from "./add-cucumber-preprocessor-plugin";

/**
 * Everything below exist merely for the purpose of being nice with TypeScript. All of these methods
 * are exclusively used in the browser and the browser field in package.json points to ./methods.ts.
 */
function createUnimplemented() {
  return new Error("Cucumber methods aren't available in a node environment");
}

export { NOT_FEATURE_ERROR } from "./methods";

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function defineParameterType<T, C extends Mocha.Context>(
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

export { default as DataTable } from "./data_table";
