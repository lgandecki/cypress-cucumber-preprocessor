import parse from "@cucumber/tag-expressions";
import { fromByteArray } from "base64-js";
import { assertAndReturn } from "./assertions";
import { collectTagNames } from "./ast-helpers";

import {
  INTERNAL_SPEC_PROPERTIES,
  TASK_CREATE_STRING_ATTACHMENT,
} from "./constants";
import { InternalSpecProperties } from "./create-tests";

import DataTable from "./data_table";

import { getRegistry } from "./registry";

import {
  IHookBody,
  IParameterTypeDefinition,
  IStepDefinitionBody,
} from "./types";

function defineStep<T extends unknown[], C extends Mocha.Context>(
  description: string | RegExp,
  implementation: IStepDefinitionBody<T, C>
) {
  getRegistry().defineStep(description, implementation);
}

function runStepDefininition(
  world: Mocha.Context,
  text: string,
  argument?: DataTable | string
) {
  getRegistry().runStepDefininition(world, text, argument);
}

function defineParameterType<T, C extends Mocha.Context>(
  options: IParameterTypeDefinition<T, C>
) {
  getRegistry().defineParameterType(options);
}

function defineBefore(options: { tags?: string }, fn: IHookBody): void;
function defineBefore(fn: IHookBody): void;
function defineBefore(
  optionsOrFn: IHookBody | { tags?: string },
  maybeFn?: IHookBody
) {
  if (typeof optionsOrFn === "function") {
    getRegistry().defineBefore({}, optionsOrFn);
  } else if (typeof optionsOrFn === "object" && typeof maybeFn === "function") {
    getRegistry().defineBefore(optionsOrFn, maybeFn);
  } else {
    throw new Error("Unexpected argument for Before hook");
  }
}

function defineAfter(options: { tags?: string }, fn: IHookBody): void;
function defineAfter(fn: IHookBody): void;
function defineAfter(
  optionsOrFn: IHookBody | { tags?: string },
  maybeFn?: IHookBody
) {
  if (typeof optionsOrFn === "function") {
    getRegistry().defineAfter({}, optionsOrFn);
  } else if (typeof optionsOrFn === "object" && typeof maybeFn === "function") {
    getRegistry().defineAfter(optionsOrFn, maybeFn);
  } else {
    throw new Error("Unexpected argument for After hook");
  }
}

function createStringAttachment(
  data: string,
  mediaType: string,
  encoding: "BASE64" | "IDENTITY"
) {
  cy.task(TASK_CREATE_STRING_ATTACHMENT, {
    data,
    mediaType,
    encoding,
  });
}

export function attach(data: string | ArrayBuffer, mediaType?: string) {
  if (typeof data === "string") {
    mediaType = mediaType ?? "text/plain";

    if (mediaType.startsWith("base64:")) {
      createStringAttachment(data, mediaType.replace("base64:", ""), "BASE64");
    } else {
      createStringAttachment(data, mediaType ?? "text/plain", "IDENTITY");
    }
  } else if (data instanceof ArrayBuffer) {
    if (typeof mediaType !== "string") {
      throw Error("ArrayBuffer attachments must specify a media type");
    }

    createStringAttachment(
      fromByteArray(new Uint8Array(data)),
      mediaType,
      "BASE64"
    );
  } else {
    throw Error("Invalid attachment data: must be a ArrayBuffer or string");
  }
}

function isFeature() {
  return Cypress.env(INTERNAL_SPEC_PROPERTIES) != null;
}

export const NOT_FEATURE_ERROR =
  "Expected to find internal properties, but didn't. This is likely because you're calling doesFeatureMatch() in a non-feature spec. Use doesFeatureMatch() in combination with isFeature() if you have both feature and non-feature specs";

function doesFeatureMatch(expression: string) {
  const { pickle } = assertAndReturn(
    Cypress.env(INTERNAL_SPEC_PROPERTIES),
    NOT_FEATURE_ERROR
  ) as InternalSpecProperties;

  return parse(expression).evaluate(collectTagNames(pickle.tags));
}

export {
  isFeature,
  doesFeatureMatch,
  defineStep as Given,
  defineStep as When,
  defineStep as Then,
  defineStep,
  runStepDefininition as Step,
  defineParameterType,
  defineBefore as Before,
  defineAfter as After,
};
