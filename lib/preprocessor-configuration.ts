import { cosmiconfig } from "cosmiconfig";

import util from "util";

import debug from "./debug";

import { isString, isStringOrStringArray, isBoolean } from "./type-guards";

function hasOwnProperty<X extends {}, Y extends string>(
  value: X,
  property: Y
): value is X & Record<Y, unknown> {
  return Object.prototype.hasOwnProperty.call(value, property);
}

function validateConfigurationEntry(
  key: string,
  value: unknown
): Partial<IPreprocessorConfiguration> {
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
            value
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
              value
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
          `Expected a boolean (json.enabled), but got ${util.inspect(value)}`
        );
      }
      let formatter: string | undefined;
      if (hasOwnProperty(value, "formatter")) {
        if (isString(value.formatter)) {
          formatter = value.formatter;
        } else {
          throw new Error(
            `Expected a string (json.formatter), but got ${util.inspect(value)}`
          );
        }
      }
      let output: string | undefined;
      if (hasOwnProperty(value, "output")) {
        if (isString(value.output)) {
          output = value.output;
        } else {
          throw new Error(
            `Expected a string (json.output), but got ${util.inspect(value)}`
          );
        }
      }
      const messagesConfig = {
        enabled: value.enabled,
        formatter,
        output,
      };
      return { [key]: messagesConfig };
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
    default:
      return {};
  }
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

  if (hasOwnProperty(environment, "jsonFormatter")) {
    const { jsonFormatter } = environment;

    if (isString(jsonFormatter)) {
      overrides.jsonFormatter = jsonFormatter;
    } else {
      throw new Error(
        `Expected a string (jsonFormatter), but got ${util.inspect(
          jsonFormatter
        )}`
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

export function stringToMaybeBoolean(value: string): boolean | undefined {
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

export interface IPreprocessorConfiguration {
  readonly stepDefinitions: string | string[];
  readonly messages?: {
    enabled: boolean;
    output?: string;
  };
  readonly json?: {
    enabled: boolean;
    formatter?: string;
    output?: string;
  };
  readonly filterSpecs?: boolean;
  readonly omitFiltered?: boolean;
}

export interface IEnvironmentOverrides {
  stepDefinitions?: string | string[];
  messagesEnabled?: boolean;
  messagesOutput?: string;
  jsonEnabled?: boolean;
  jsonFormatter?: string;
  jsonOutput?: string;
  filterSpecs?: boolean;
  omitFiltered?: boolean;
}

export class PreprocessorConfiguration implements IPreprocessorConfiguration {
  constructor(
    private explicitValues: Partial<IPreprocessorConfiguration>,
    private environmentOverrides: IEnvironmentOverrides
  ) {}

  get stepDefinitions() {
    return (
      this.environmentOverrides.stepDefinitions ??
      this.explicitValues.stepDefinitions ?? [
        "[filepath]/**/*.{js,ts}",
        "[filepath].{js,ts}",
        "cypress/support/step_definitions/**/*.{js,ts}",
      ]
    );
  }

  get messages() {
    return {
      enabled:
        this.json.enabled ||
        (this.environmentOverrides.messagesEnabled ??
          this.explicitValues.messages?.enabled ??
          false),
      output:
        this.environmentOverrides.messagesOutput ??
        this.explicitValues.messages?.output ??
        "cucumber-messages.ndjson",
    };
  }

  get json() {
    return {
      enabled:
        this.environmentOverrides.jsonEnabled ??
        this.explicitValues.json?.enabled ??
        false,
      formatter:
        this.environmentOverrides.jsonFormatter ??
        this.explicitValues.json?.formatter ??
        "cucumber-json-formatter",
      output:
        this.environmentOverrides.jsonOutput ??
        (this.explicitValues.json?.output || "cucumber-report.json"),
    };
  }

  get filterSpecs() {
    return (
      this.environmentOverrides.filterSpecs ??
      this.explicitValues.filterSpecs ??
      false
    );
  }

  get omitFiltered() {
    return (
      this.environmentOverrides.omitFiltered ??
      this.explicitValues.omitFiltered ??
      false
    );
  }
}

async function cosmiconfigResolver(projectRoot: string) {
  const result = await cosmiconfig("cypress-cucumber-preprocessor").search(
    projectRoot
  );

  return result?.config;
}

export type ConfigurationFileResolver = (
  projectRoot: string
) => any | Promise<any>;

export async function resolve(
  projectRoot: string,
  environment: Record<string, unknown>,
  configurationFileResolver: ConfigurationFileResolver = cosmiconfigResolver
) {
  const result = await configurationFileResolver(projectRoot);

  const environmentOverrides = validateEnvironmentOverrides(environment);

  if (result) {
    if (typeof result !== "object" || result == null) {
      throw new Error(
        `Malformed configuration, expected an object, but got ${util.inspect(
          result
        )}`
      );
    }

    const config: Partial<IPreprocessorConfiguration> = Object.assign(
      {},
      ...Object.entries(result).map((entry) =>
        validateConfigurationEntry(...entry)
      )
    );

    debug(`resolved configuration ${util.inspect(config)}`);

    return new PreprocessorConfiguration(config, environmentOverrides);
  } else {
    debug("resolved no configuration");

    return new PreprocessorConfiguration({}, environmentOverrides);
  }
}
