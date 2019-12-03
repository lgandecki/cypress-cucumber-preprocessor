const ps = require("ps-node");
const minimist = require("minimist");

let cypressExecArgs;
const lookupCypressQuery = {
  command: "cypress",
  arguments: "--config-file"
};

module.exports = {
  load: async () =>
    new Promise(resolve => {
      ps.lookup(lookupCypressQuery, (err, resultList) => {
        if (err) {
          resolve();
        }
        cypressExecArgs = resultList
          .filter(process => process && process.arguments.length)
          .map(process => minimist(process.arguments))
          .reduce(
            (processArgs, finalProcessArgs) => ({
              ...finalProcessArgs,
              ...processArgs
            }),
            {}
          );
        resolve();
      });
    }),
  getArguments: () => cypressExecArgs
};
