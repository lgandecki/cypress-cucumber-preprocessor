// Replace with "Array.prototype.flat()" once all browsers fully support it.
const flattenArray = (arr) => [].concat(...arr);

module.exports = {
  flattenArray,
};
