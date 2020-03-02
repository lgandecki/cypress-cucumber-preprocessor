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

// TODO currently we only work with feature files in cypress/integration folder.
// It should be easy to base this on the cypress.json configuration - we are happy to take a PR
// here if you need this functionality!
const defaultGlob = "cypress/integration/**/*.feature";

const specArg = process.argv.slice(2).find(arg => arg.indexOf("GLOB=") === 0);

const specGlob = specArg ? specArg.replace(/.*=/, "") : defaultGlob;

if (specArg) {
  debug("Found glob", specGlob);
}

const paths = glob.sync(specGlob);

const featuresToRun = [];

const found = process.argv.slice(2).find(arg => arg.indexOf("TAGS=") === 0);

const envTags = found ? found.replace(/.*=/, "") : "";
debug("Found tag expression", envTags);

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

function getOsSpecificExecutable(command) {
  return process.platform === "win32" ? `${command}.cmd` : command;
}

function getCypressExecutable() {
  const command = getOsSpecificExecutable(`${__dirname}/../.bin/cypress`);
  // fallback to the globally installed cypress instead
  return fs.existsSync(command) ? command : getOsSpecificExecutable("cypress");
}

try {
  if (featuresToRun.length || envTags === "") {
    execFileSync(
      getCypressExecutable(),
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
