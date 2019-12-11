let options;

function set(cypressOptions) {
  options = cypressOptions;
}

function get(option) {
  return options && options[option];
}

module.exports = {
  set,
  get
};
