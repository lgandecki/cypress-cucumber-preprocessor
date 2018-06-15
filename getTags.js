const getTags = (cliArg = process.argv.join(" ")) => {
  // cliArg looks a bit like `cypress features/ --tags "~@ignore and ~@slow"`
  const tagsRegex = new RegExp("--tags ([^\n-]+)"); // eslint-disable-line no-control-regex
  // "~@ignore and ~@slow"
  const tagsArg = cliArg.match(tagsRegex)[0];
  const filter = {
    ignore: [],
    only: []
  };
  console.log(tagsArg);
  const tags = tagsArg.split(" ").filter(elm => !!elm.match(/(?:@|~).+$/g)); // ["~@ignore", "~@slow"]
  tags.forEach(tag => {
    console.log(tag);
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
