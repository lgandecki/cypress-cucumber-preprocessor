const minimist = require("minimist");
const { TagExpressionParser } = require("cucumber-tag-expressions");

function getEnvTags() {
  return Cypress.env("TAGS") || "";
}

function shouldProceedCurrentStep(tags = [], envTags = getEnvTags()) {
  const parser = new TagExpressionParser();
  try {
    const expressionNode = parser.parse(envTags);
    const mappedTags = tags.map((tag) => tag.name);
    return expressionNode.evaluate(mappedTags);
  } catch (e) {
    /* eslint-disable-next-line no-console */
    console.log(`Error parsing tags: '${envTags}'. Message: ${e.message}`);
    return false;
  }
}

/*
  This is not a perfect solution since process.argv filtering should
  probably be done using a parser to cover all edge cases.
 */

function stripCLIArguments(argsToRemove = []) {
  const processArgv = process.argv.slice(2);

  let prevValue = null;
  for (let i = processArgv.length - 1; i >= 0; i -= 1) {
    if (/^--?/.test(processArgv[i])) {
      // eslint-disable-next-line no-loop-func
      argsToRemove.forEach((arg) => {
        const shortFlagChar = arg.slice(-1);
        if (processArgv[i] === arg) {
          processArgv.splice(i, prevValue ? 2 : 1);
        } else if (new RegExp(`^${arg}=`, "g").test(processArgv[i])) {
          processArgv.splice(i, 1);
        } else if (
          /^-[^-]+/.test(processArgv[i]) &&
          /^-[^-]+/.test(arg) &&
          processArgv[i].includes(shortFlagChar)
        ) {
          const flagPosition = processArgv[i].indexOf(shortFlagChar);
          processArgv[i] = processArgv[i].replace(shortFlagChar, "");
          if (prevValue && flagPosition === processArgv[i].length) {
            processArgv.splice(i + 1, 1);
          }
        }
      });
      prevValue = null;
    } else {
      prevValue = processArgv[i];
    }
  }
  return processArgv;
}
/**
 * Users will be expected to pass args by --glob/-g to avoid issues related to commas in those parameters.
 */
function parseArgsOrDefault(argPrefix, defaultValue) {
  const matchedArg = process.argv
    .slice(2)
    .find((arg) => arg.includes(`${argPrefix}=`));

  // Cypress requires env vars to be passed as comma separated list
  // otherwise it only accepts the last provided variable,
  // the way we replace here accomodates for that.
  const argValue = matchedArg
    ? matchedArg.replace(new RegExp(`.*${argPrefix}=`), "").replace(/,.*/, "")
    : "";

  return argValue !== "" ? argValue : defaultValue;
}

function getGlobArg() {
  const args = minimist(process.argv.slice(2), {
    alias: { g: "glob" },
    string: ["g"],
  });

  return args.g || parseArgsOrDefault("GLOB", false);
}

module.exports = {
  shouldProceedCurrentStep,
  getEnvTags,
  stripCLIArguments,
  parseArgsOrDefault,
  getGlobArg,
};
