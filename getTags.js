const getTags = (cliArg = process.argv.join(" ")) => {
  // e.g. cliArg = `cypress features/ --tags "~@ignore and @slow"`
  const filter = {
    ignore: [],
    only: []
  };
  const tagsRegex = new RegExp('--tags (["a-zA-Z·@~ -](?!--))+'); // eslint-disable-line no-control-regex
  const tagsPassed = cliArg.match(tagsRegex); // e.g. `--tags "~@ignore and @slow"`
  if (!tagsPassed) {
    return filter;
  }
  const tagsArg = tagsPassed[0]; // e.g. "~@ignore and @slow"
  const tags = tagsArg
    .replace(/"/g, "") // e.g. "~@ignore and @slow" -> ~@ignore and @slow
    .split(" ") // e.g. ["~@ignore", "and", "@slow"]
    .filter(elm => !!elm.match(/(?:@|~).+$/g)); // e.g. ["~@ignore", "@slow"]
  tags.forEach(tag => {
    const cleanTag = tag.replace("~", "");
    if (tag.startsWith("~")) {
      filter.ignore.push(cleanTag);
    } else {
      filter.only.push(cleanTag);
    }
  });
  return filter;
};

module.exports = {
  getTags
};
