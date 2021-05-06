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

module.exports = {
  shouldProceedCurrentStep,
  getEnvTags,
};
