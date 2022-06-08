import path from "path";

import glob from "glob";

import util from "util";

import assert from "assert";

import isPathInside from "is-path-inside";

import { ICypressConfiguration } from "@badeball/cypress-configuration";

import debug from "./debug";

import { IPreprocessorConfiguration } from "./preprocessor-configuration";

export async function getStepDefinitionPaths(
  configuration: {
    cypress: ICypressConfiguration;
    preprocessor: IPreprocessorConfiguration;
  },
  filepath: string
): Promise<string[]> {
  const files = (
    await Promise.all(
      getStepDefinitionPatterns(configuration, filepath).map((pattern) =>
        util.promisify(glob)(pattern, { nodir: true })
      )
    )
  ).reduce((acum, el) => acum.concat(el), []);

  if (files.length === 0) {
    debug("found no step definitions");
  } else {
    debug(`found step definitions ${util.inspect(files)}`);
  }

  return files;
}

function trimFeatureExtension(filepath: string) {
  return filepath.replace(/\.feature$/, "");
}

export function pathParts(relativePath: string): string[] {
  assert(
    !path.isAbsolute(relativePath),
    `Expected a relative path but got ${relativePath}`
  );

  const parts: string[] = [];

  do {
    parts.push(relativePath);
  } while (
    (relativePath = path.normalize(path.join(relativePath, ".."))) !== "."
  );

  return parts;
}

export function getStepDefinitionPatterns(
  configuration: {
    cypress: Pick<ICypressConfiguration, "projectRoot">;
    preprocessor: IPreprocessorConfiguration;
  },
  filepath: string
): string[] {
  const projectRoot = configuration.cypress.projectRoot;

  if (!isPathInside(filepath, projectRoot)) {
    throw new Error(`${filepath} is not inside ${projectRoot}`);
  }

  debug(
    `looking for step definitions using ${util.inspect(
      configuration.preprocessor.stepDefinitions
    )}`
  );

  const filepathReplacement = trimFeatureExtension(
    path.relative(projectRoot, filepath)
  );

  debug(`replacing [filepath] with ${util.inspect(filepathReplacement)}`);

  const parts = pathParts(filepathReplacement);

  debug(`replacing [filepart] with ${util.inspect(parts)}`);

  return (
    typeof configuration.preprocessor.stepDefinitions === "string"
      ? [configuration.preprocessor.stepDefinitions]
      : configuration.preprocessor.stepDefinitions
  )
    .flatMap((pattern) => {
      if (pattern.includes("[filepath]") && pattern.includes("[filepart]")) {
        throw new Error(
          `Pattern cannot contain both [filepath] and [filepart], but got ${util.inspect(
            pattern
          )}`
        );
      } else if (pattern.includes("[filepath]")) {
        return pattern.replace("[filepath]", filepathReplacement);
      } else if (pattern.includes("[filepart]")) {
        return [
          ...parts.map((part) => pattern.replace("[filepart]", part)),
          path.normalize(pattern.replace("[filepart]", ".")),
        ];
      } else {
        return pattern;
      }
    })
    .map((pattern) => path.join(configuration.cypress.projectRoot, pattern));
}
