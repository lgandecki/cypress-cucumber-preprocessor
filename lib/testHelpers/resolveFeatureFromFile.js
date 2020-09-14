/* eslint-disable global-require */
const fs = require("fs");

const { createTestsFromFeature } = require("../createTestsFromFeature");

const resolveFeatureFromFile = (featureFile) => {
  const spec = fs.readFileSync(featureFile);
  createTestsFromFeature(featureFile, spec);
};

module.exports = {
  resolveFeatureFromFile,
};
