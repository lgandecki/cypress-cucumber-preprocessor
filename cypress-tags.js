#!/usr/bin/env node

const { Parser } = require("gherkin");
const glob = require("glob");
const fs = require("fs");
const { execFileSync } = require("child_process");

const { shouldProceedCurrentStep } = require("./lib/tagsHelper");

// TODO currently we only work with feature files in cypress/integration folder.
// It should be easy to base this on the cypress.json configuration - we are happy to take a PR
// here if you need this functionality!

const paths = glob.sync("cypress/integration/**/*.feature");

const featuresToRun = [];

const debug = (message, ...rest) =>
  process.env.DEBUG
    ? console.log(`DEBUG: ${message}`, rest.length ? rest : "")
    : null;

const found = process.argv.slice(2).find(arg => arg.indexOf("TAGS=") === 0);

const envTags = found.replace(/.*=/, "");
debug("Found tag expression", envTags);

paths.forEach(featurePath => {
  const spec = `${fs.readFileSync(featurePath)}`;
  const parsedFeature = new Parser().parse(spec);

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
  execFileSync(
    process.platform === "win32"
      ? `${__dirname}/../.bin/cypress.cmd`
      : `${__dirname}/../.bin/cypress`,
    [...process.argv.slice(2), "--spec", featuresToRun.join(",")],
    {
      stdio: [process.stdin, process.stdout, process.stderr]
    }
  );
} catch (e) {
  debug("Error while running cypress (or just a test failure)", e);
  process.exit(1);
}
