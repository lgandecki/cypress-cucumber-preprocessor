#!/usr/bin/env node

const { Parser } = require("gherkin");
const glob = require("glob");
const fs = require("fs");
const { execFileSync } = require("child_process");

const { shouldProceedCurrentStep } = require("./lib/tagsHelper");

const debug = (message, ...rest) =>
  process.env.DEBUG
    ? console.log(`DEBUG: ${message}`, rest.length ? rest : "")
    : null;

function parseArgsOrDefault(argPrefix, defaultValue) {
  const matchedArg = process.argv
    .slice(2)
    .find(arg => arg.includes(`${argPrefix}=`));

  // Cypress requires env vars to be passed as comma separated list
  // otherwise it only accepts the last provided variable,
  // the way we replace here accomodates for that.
  const argValue = matchedArg
    ? matchedArg.replace(new RegExp(`.*${argPrefix}=`), "").replace(/,.*/, "")
    : "";

  return argValue !== "" ? argValue : defaultValue;
}

// TODO currently we only work with feature files in cypress/integration folder.
// It should be easy to base this on the cypress.json configuration - we are happy to take a PR
// here if you need this functionality!
const defaultGlob = "cypress/integration/**/*.feature";

const specGlob = parseArgsOrDefault("GLOB", defaultGlob);
debug("Found glob", specGlob);
const envTags = parseArgsOrDefault("TAGS", "");
debug("Found tag expression", envTags);

const paths = glob.sync(specGlob);

const featuresToRun = [];

paths.forEach(featurePath => {
  const spec = `${fs.readFileSync(featurePath)}`;
  const parsedFeature = new Parser().parse(spec);

  if (!parsedFeature.feature) {
    debug(`Feature: ${featurePath} is empty`);
    return;
  }

  const featureTags = parsedFeature.feature.tags;
  const featureShouldRun = shouldProceedCurrentStep(featureTags, envTags);
  const taggedScenarioShouldRun = parsedFeature.feature.children.some(
    section =>
      section.tags &&
      section.tags.length &&
      shouldProceedCurrentStep(section.tags.concat(featureTags), envTags)
  );
  debug(
    `Feature: ${featurePath}, featureShouldRun: ${featureShouldRun}, taggedScenarioShouldRun: ${taggedScenarioShouldRun}`
  );
  if (featureShouldRun || taggedScenarioShouldRun) {
    featuresToRun.push(featurePath);
  }
});

try {
  if (featuresToRun.length || envTags === "") {
    execFileSync(
      process.platform === "win32"
        ? `cypress.cmd`
        : `${__dirname}/../.bin/cypress`,
      [...process.argv.slice(2), "--spec", featuresToRun.join(",")],
      {
        stdio: [process.stdin, process.stdout, process.stderr]
      }
    );
  } else {
    console.log("No matching tags found");
    process.exit(0);
  }
} catch (e) {
  debug("Error while running cypress (or just a test failure)", e);
  process.exit(1);
}
