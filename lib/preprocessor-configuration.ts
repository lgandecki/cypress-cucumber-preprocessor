import { ICypressConfiguration } from "@badeball/cypress-configuration";

import { cosmiconfig } from "cosmiconfig";

import util from "util";

import debug from "./helpers/debug";

import { ensureIsRelative } from "./helpers/paths";

import {
  isString,
  isStringOrStringArray,
  isBoolean,
} from "./helpers/type-guards";

function hasOwnProperty<X extends Record<string, unknown>, Y extends string>(
  value: X,
  property: Y
): value is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(value, property);
}

function isPlainObject(value: any): value is object {
  return value?.constructor === Object;
}

function isFilterSpecsMixedMode(value: any): value is FilterSpecsMixedMode {
  const availablesModes = ["hide", "show", "empty-set"];

  return typeof value === "string" && availablesModes.indexOf(value) !== -1;
}

function validateUserConfigurationEntry(
  key: string,
  value: Record<string, unknown>
): Partial<IUserConfiguration> {
  switch (key) {
    case "stepDefinitions":
      if (!isStringOrStringArray(value)) {
        throw new Error(
          `Expected a string or array of strings (stepDefinitions), but got ${util.inspect(
            value
          )}`
        );
      }
      return { [key]: value };
    case "messages": {
      if (typeof value !== "object" || value == null) {
        throw new Error(
          `Expected an object (messages), but got ${util.inspect(value)}`
        );
      }
      if (
        !hasOwnProperty(value, "enabled") ||
        typeof value.enabled !== "boolean"
      ) {
        throw new Error(
          `Expected a boolean (messages.enabled), but got ${util.inspect(
            value.enabled
          )}`
        );
      }
      let output: string | undefined;
      if (hasOwnProperty(value, "output")) {
        if (isString(value.output)) {
          output = value.output;
        } else {
          throw new Error(
            `Expected a string (messages.output), but got ${util.inspect(
              value.output
            )}`
          );
        }
      }
      const messagesConfig = {
        enabled: value.enabled,
        output,
      };
      return { [key]: messagesConfig };
    }
    case "json": {
      if (typeof value !== "object" || value == null) {
        throw new Error(
          `Expected an object (json), but got ${util.inspect(value)}`
        );
      }
      if (
        !hasOwnProperty(value, "enabled") ||
        typeof value.enabled !== "boolean"
      ) {
        throw new Error(
          `Expected a boolean (json.enabled), but got ${util.inspect(
            value.enabled
          )}`
        );
      }
      let output: string | undefined;
      if (hasOwnProperty(value, "output")) {
        if (isString(value.output)) {
          output = value.output;
        } else {
          throw new Error(
            `Expected a string (json.output), but got ${util.inspect(
              value.output
            )}`
          );
        }
      }
      const messagesConfig = {
        enabled: value.enabled,
        output,
      };
      return { [key]: messagesConfig };
    }
    case "html": {
      if (typeof value !== "object" || value == null) {
        throw new Error(
          `Expected an object (html), but got ${util.inspect(value)}`
        );
      }
      if (
        !hasOwnProperty(value, "enabled") ||
        typeof value.enabled !== "boolean"
      ) {
        throw new Error(
          `Expected a boolean (html.enabled), but got ${util.inspect(
            value.enabled
          )}`
        );
      }
      let output: string | undefined;
      if (hasOwnProperty(value, "output")) {
        if (isString(value.output)) {
          output = value.output;
        } else {
          throw new Error(
            `Expected a string (html.output), but got ${util.inspect(
              value.output
            )}`
          );
        }
      }
      const messagesConfig = {
        enabled: value.enabled,
        output,
      };
      return { [key]: messagesConfig };
    }
    case "pretty": {
      if (typeof value !== "object" || value == null) {
        throw new Error(
          `Expected an object (pretty), but got ${util.inspect(value)}`
        );
      }
      if (
        !hasOwnProperty(value, "enabled") ||
        typeof value.enabled !== "boolean"
      ) {
        throw new Error(
          `Expected a boolean (pretty.enabled), but got ${util.inspect(
            value.enabled
          )}`
        );
      }
      const prettyConfig = {
        enabled: value.enabled,
      };
      return { [key]: prettyConfig };
    }
    case "filterSpecsMixedMode": {
      if (!isFilterSpecsMixedMode(value)) {
        throw new Error(
          `Unrecognize filterSpecsMixedMode: ${util.inspect(
            value
          )} (valid options are "hide", "show" and "empty-set")`
        );
      }
      return { [key]: value };
    }
    case "filterSpecs": {
      if (!isBoolean(value)) {
        throw new Error(
          `Expected a boolean (filterSpecs), but got ${util.inspect(value)}`
        );
      }
      return { [key]: value };
    }
    case "omitFiltered": {
      if (!isBoolean(value)) {
        throw new Error(
          `Expected a boolean (omitFiltered), but got ${util.inspect(value)}`
        );
      }
      return { [key]: value };
    }
    case "e2e":
      return { [key]: validateUserConfiguration(value) };
    case "component":
      return { [key]: validateUserConfiguration(value) };
    default:
      return {};
  }
}

function validateUserConfiguration(configuration: object): IUserConfiguration {
  if (!isPlainObject(configuration)) {
    throw new Error(
      `Malformed configuration, expected an object, but got ${util.inspect(
        configuration
      )}`
    );
  }

  return Object.assign(
    {},
    ...Object.entries(configuration).map((entry) =>
      validateUserConfigurationEntry(...entry)
    )
  );
}

function validateEnvironmentOverrides(
  environment: Record<string, unknown>
): IEnvironmentOverrides {
  const overrides: IEnvironmentOverrides = {};

  if (hasOwnProperty(environment, "stepDefinitions")) {
    const { stepDefinitions } = environment;

    if (isStringOrStringArray(stepDefinitions)) {
      overrides.stepDefinitions = stepDefinitions;
    } else {
      throw new Error(
        `Expected a string or array of strings (stepDefinitions), but got ${util.inspect(
          stepDefinitions
        )}`
      );
    }
  }

  if (hasOwnProperty(environment, "messagesEnabled")) {
    const { messagesEnabled } = environment;

    if (isBoolean(messagesEnabled)) {
      overrides.messagesEnabled = messagesEnabled;
    } else if (isString(messagesEnabled)) {
      overrides.messagesEnabled = stringToMaybeBoolean(messagesEnabled);
    } else {
      throw new Error(
        `Expected a boolean (messagesEnabled), but got ${util.inspect(
          messagesEnabled
        )}`
      );
    }
  }

  if (hasOwnProperty(environment, "messagesOutput")) {
    const { messagesOutput } = environment;

    if (isString(messagesOutput)) {
      overrides.messagesOutput = messagesOutput;
    } else {
      throw new Error(
        `Expected a string (messagesOutput), but got ${util.inspect(
          messagesOutput
        )}`
      );
    }
  }

  if (hasOwnProperty(environment, "jsonEnabled")) {
    const { jsonEnabled } = environment;

    if (isBoolean(jsonEnabled)) {
      overrides.jsonEnabled = jsonEnabled;
    } else if (isString(jsonEnabled)) {
      overrides.jsonEnabled = stringToMaybeBoolean(jsonEnabled);
    } else {
      throw new Error(
        `Expected a boolean (jsonEnabled), but got ${util.inspect(jsonEnabled)}`
      );
    }
  }

  if (hasOwnProperty(environment, "jsonOutput")) {
    const { jsonOutput } = environment;

    if (isString(jsonOutput)) {
      overrides.jsonOutput = jsonOutput;
    } else {
      throw new Error(
        `Expected a string (jsonOutput), but got ${util.inspect(jsonOutput)}`
      );
    }
  }

  if (hasOwnProperty(environment, "htmlEnabled")) {
    const { htmlEnabled } = environment;

    if (isBoolean(htmlEnabled)) {
      overrides.htmlEnabled = htmlEnabled;
    } else if (isString(htmlEnabled)) {
      overrides.htmlEnabled = stringToMaybeBoolean(htmlEnabled);
    } else {
      throw new Error(
        `Expected a boolean (htmlEnabled), but got ${util.inspect(htmlEnabled)}`
      );
    }
  }

  if (hasOwnProperty(environment, "htmlOutput")) {
    const { htmlOutput } = environment;

    if (isString(htmlOutput)) {
      overrides.htmlOutput = htmlOutput;
    } else {
      throw new Error(
        `Expected a string (htmlOutput), but got ${util.inspect(htmlOutput)}`
      );
    }
  }

  if (hasOwnProperty(environment, "prettyEnabled")) {
    const { prettyEnabled } = environment;

    if (isBoolean(prettyEnabled)) {
      overrides.prettyEnabled = prettyEnabled;
    } else if (isString(prettyEnabled)) {
      overrides.prettyEnabled = stringToMaybeBoolean(prettyEnabled);
    } else {
      throw new Error(
        `Expected a boolean (prettyEnabled), but got ${util.inspect(
          prettyEnabled
        )}`
      );
    }
  }

  if (hasOwnProperty(environment, "filterSpecsMixedMode")) {
    const { filterSpecsMixedMode } = environment;

    if (isFilterSpecsMixedMode(filterSpecsMixedMode)) {
      overrides.filterSpecsMixedMode = filterSpecsMixedMode;
    } else {
      throw new Error(
        `Unrecognize filterSpecsMixedMode: ${util.inspect(
          filterSpecsMixedMode
        )} (valid options are "hide", "show" and "empty-set")`
      );
    }
  }

  if (hasOwnProperty(environment, "filterSpecs")) {
    const { filterSpecs } = environment;

    if (isBoolean(filterSpecs)) {
      overrides.filterSpecs = filterSpecs;
    } else if (isString(filterSpecs)) {
      overrides.filterSpecs = stringToMaybeBoolean(filterSpecs);
    } else {
      throw new Error(
        `Expected a boolean (filterSpecs), but got ${util.inspect(filterSpecs)}`
      );
    }
  }

  if (hasOwnProperty(environment, "omitFiltered")) {
    const { omitFiltered } = environment;

    if (isBoolean(omitFiltered)) {
      overrides.omitFiltered = omitFiltered;
    } else if (isString(omitFiltered)) {
      overrides.omitFiltered = stringToMaybeBoolean(omitFiltered);
    } else {
      throw new Error(
        `Expected a boolean (omitFiltered), but got ${util.inspect(
          omitFiltered
        )}`
      );
    }
  }

  return overrides;
}

function stringToMaybeBoolean(value: string): boolean | undefined {
  if (value === "") {
    return;
  }

  const falsyValues = ["0", "false"];

  if (falsyValues.includes(value)) {
    return false;
  } else {
    return true;
  }
}

export type ICypressRuntimeConfiguration = ICypressConfiguration & {
  isTextTerminal?: boolean;
};

export type FilterSpecsMixedMode = "hide" | "show" | "empty-set";

interface IEnvironmentOverrides {
  stepDefinitions?: string | string[];
  messagesEnabled?: boolean;
  messagesOutput?: string;
  jsonEnabled?: boolean;
  jsonOutput?: string;
  jsonOverride?: boolean;
  htmlEnabled?: boolean;
  htmlOutput?: string;
  htmlOverride?: boolean;
  prettyEnabled?: boolean;
  filterSpecsMixedMode?: FilterSpecsMixedMode;
  filterSpecs?: boolean;
  omitFiltered?: boolean;
}

export interface IBaseUserConfiguration {
  stepDefinitions?: string | string[];
  messages?: {
    enabled: boolean;
    output?: string;
  };
  json?: {
    enabled: boolean;
    output?: string;
    override?: boolean;
  };
  html?: {
    enabled: boolean;
    output?: string;
    override?: boolean;
  };
  pretty?: {
    enabled: boolean;
  };
  filterSpecsMixedMode?: FilterSpecsMixedMode;
  filterSpecs?: boolean;
  omitFiltered?: boolean;
}

export interface IUserConfiguration extends IBaseUserConfiguration {
  e2e?: IBaseUserConfiguration;
  component?: IBaseUserConfiguration;
}

export interface IPreprocessorConfiguration {
  readonly stepDefinitions: string | string[];
  readonly messages: {
    enabled: boolean;
    output: string;
  };
  readonly json: {
    enabled: boolean;
    output: string;
    override: boolean;
  };
  readonly html: {
    enabled: boolean;
    output: string;
    override: boolean;
  };
  readonly pretty: {
    enabled: boolean;
  };
  readonly filterSpecsMixedMode: FilterSpecsMixedMode;
  readonly filterSpecs: boolean;
  readonly omitFiltered: boolean;
  readonly implicitIntegrationFolder: string;
  readonly isTrackingState: boolean;
}

const DEFAULT_STEP_DEFINITIONS = [
  "[integration-directory]/[filepath]/**/*.{js,mjs,ts,tsx}",
  "[integration-directory]/[filepath].{js,mjs,ts,tsx}",
  "cypress/support/step_definitions/**/*.{js,mjs,ts,tsx}",
];

export const COMPILED_REPORTER_ENTRYPOINT =
  "dist/subpath-entrypoints/pretty-reporter.js";

export function combineIntoConfiguration(
  configuration: IUserConfiguration,
  overrides: IEnvironmentOverrides,
  cypress: ICypressRuntimeConfiguration,
  implicitIntegrationFolder: string
): IPreprocessorConfiguration {
  const defaultStepDefinitions = DEFAULT_STEP_DEFINITIONS.map((pattern) =>
    pattern.replace(
      "[integration-directory]",
      ensureIsRelative(cypress.projectRoot, implicitIntegrationFolder)
    )
  );

  const specific = configuration[cypress.testingType];
  const unspecific = configuration;

  const stepDefinitions: IPreprocessorConfiguration["stepDefinitions"] =
    overrides.stepDefinitions ??
    specific?.stepDefinitions ??
    unspecific.stepDefinitions ??
    defaultStepDefinitions;

  const json: IPreprocessorConfiguration["json"] = {
    enabled:
      overrides.jsonEnabled ??
      specific?.json?.enabled ??
      unspecific.json?.enabled ??
      false,
    output:
      overrides.jsonOutput ??
      specific?.json?.output ??
      unspecific.json?.output ??
      "cucumber-report.json",
    override:
      overrides.jsonOverride ??
      specific?.json?.override ??
      unspecific.json?.override ??
      false,  
  };

  const html: IPreprocessorConfiguration["html"] = {
    enabled:
      overrides.htmlEnabled ??
      specific?.html?.enabled ??
      unspecific.html?.enabled ??
      false,
    output:
      overrides.htmlOutput ??
      specific?.html?.output ??
      unspecific.html?.output ??
      "cucumber-report.html",
    override:
      overrides.htmlOverride ??
      specific?.html?.override ??
      unspecific.html?.override ??
      false,  
  };

  const messages: IPreprocessorConfiguration["messages"] = {
    enabled:
      overrides.messagesEnabled ??
      specific?.messages?.enabled ??
      unspecific.messages?.enabled ??
      false,
    output:
      overrides.messagesOutput ??
      specific?.messages?.output ??
      unspecific.messages?.output ??
      "cucumber-messages.ndjson",
  };

  const usingPrettyReporter = cypress.reporter.endsWith(
    COMPILED_REPORTER_ENTRYPOINT
  );

  if (usingPrettyReporter) {
    debug(
      "detected use of @badeball/cypress-cucumber-preprocessor/pretty-reporter, enabling pretty output"
    );
  }

  const pretty: IPreprocessorConfiguration["pretty"] = {
    enabled:
      overrides.prettyEnabled ??
      specific?.pretty?.enabled ??
      unspecific.pretty?.enabled ??
      usingPrettyReporter,
  };

  const filterSpecsMixedMode: IPreprocessorConfiguration["filterSpecsMixedMode"] =
    overrides.filterSpecsMixedMode ??
    specific?.filterSpecsMixedMode ??
    unspecific.filterSpecsMixedMode ??
    "hide";

  const filterSpecs: IPreprocessorConfiguration["filterSpecs"] =
    overrides.filterSpecs ??
    specific?.filterSpecs ??
    unspecific.filterSpecs ??
    false;

  const omitFiltered: IPreprocessorConfiguration["omitFiltered"] =
    overrides.omitFiltered ??
    specific?.omitFiltered ??
    unspecific.omitFiltered ??
    false;

  const isTrackingState =
    (cypress.isTextTerminal ?? false) &&
    (messages.enabled ||
      json.enabled ||
      html.enabled ||
      pretty.enabled ||
      usingPrettyReporter);

  return {
    stepDefinitions,
    messages,
    json,
    html,
    pretty,
    filterSpecsMixedMode,
    filterSpecs,
    omitFiltered,
    implicitIntegrationFolder,
    isTrackingState,
  };
}

async function cosmiconfigResolver(projectRoot: string) {
  const result = await cosmiconfig("cypress-cucumber-preprocessor", {
    searchStrategy: "project",
  }).search(projectRoot);

  return result?.config;
}

export type ConfigurationFileResolver = (
  projectRoot: string
) => unknown | Promise<unknown>;

export async function resolve(
  cypressConfig: ICypressRuntimeConfiguration,
  environment: Record<string, unknown>,
  implicitIntegrationFolder: string,
  configurationFileResolver: ConfigurationFileResolver = cosmiconfigResolver
): Promise<IPreprocessorConfiguration> {
  const result = await configurationFileResolver(cypressConfig.projectRoot);

  const environmentOverrides = validateEnvironmentOverrides(environment);

  debug(`resolved environment overrides ${util.inspect(environmentOverrides)}`);

  let explicitConfiguration: IUserConfiguration;

  if (result) {
    explicitConfiguration = validateUserConfiguration(result);

    debug(
      `resolved explicit user configuration ${util.inspect(
        explicitConfiguration
      )}`
    );
  } else {
    explicitConfiguration = {};

    debug("resolved no explicit user configuration");
  }

  const configuration = combineIntoConfiguration(
    explicitConfiguration,
    environmentOverrides,
    cypressConfig,
    implicitIntegrationFolder
  );

  debug(`resolved configuration ${util.inspect(configuration)}`);

  return configuration;
}
