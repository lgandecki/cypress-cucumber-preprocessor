const cucumber = require("cypress-cucumber-preprocessor").default; // eslint-disable-line

module.exports = on => {
  on("file:preprocessor", cucumber());
};
