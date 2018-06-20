const extractTagsArgFromCli = cliArg => {
  // e.g. cliArg = `cypress features/ --tags "~@ignore and @slow"`
  const tagsRegex = new RegExp('--tags (["a-zA-Z·@~ -](?!--))+'); // eslint-disable-line no-control-regex
  const tagsPassed = cliArg.match(tagsRegex); // e.g. `--tags "~@ignore and @slow"`
  return tagsPassed
    ? tagsPassed[0].replace(/"/g, "") // e.g. `"~@ignore and @slow"` -> `~@ignore and @slow`
    : "";
};

const tagsStringToArray = tagsString =>
  tagsString
    .split(" ") // e.g. ["~@ignore", "and", "@slow"]
    .filter(elm => !!elm.match(/(?:@|~).+$/g)); // e.g. ["~@ignore", "@slow"]

const nameOfTag = tag => tag.replace("~", "");

const getTags = (cliArg = process.argv.join(" ")) => {
  const filter = {
    ignore: [],
    only: []
  };
  const tags = tagsStringToArray(extractTagsArgFromCli(cliArg));
  tags.forEach(tag => {
    if (tag.startsWith("~")) {
      filter.ignore.push(nameOfTag(tag));
    } else {
      filter.only.push(nameOfTag(tag));
    }
  });
  return filter;
};

module.exports = {
  getTags
};
