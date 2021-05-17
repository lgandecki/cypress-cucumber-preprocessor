const minimist = require("minimist");
const dargs = require("dargs");

const minimistConfig = {
  alias: { g: "glob" },
  string: ["g"],
};

function stripCLIArguments(argsToRemove = []) {
  const command = process.argv[2];
  const userOptions = process.argv.slice(3);

  const minimistArgs = minimist(userOptions);
  const argsAndAliasesToExclude =
    argsToRemove.length > 0
      ? Object.entries(minimistConfig.alias)
          .map(([key, value]) => [key, value].flat())
          .filter((aliasedOption) =>
            aliasedOption.some((option) => argsToRemove.includes(option))
          )
          .flat()
      : [];

  return [
    command,
    ...dargs(minimistArgs, {
      excludes: [...new Set([...argsAndAliasesToExclude, ...argsToRemove])],
      useEquals: false,
    }),
  ];
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
  const args = minimist(process.argv.slice(2), minimistConfig);
  return args.g || parseArgsOrDefault("GLOB", false);
}

module.exports = {
  stripCLIArguments,
  parseArgsOrDefault,
  getGlobArg,
};
