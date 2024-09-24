const globalPropertyName =
  "__cypress_cucumber_preprocessor_mocha_dont_use_this";

globalThis[globalPropertyName] = {
  before: globalThis.before,
  beforeEach: globalThis.beforeEach,
  after: globalThis.after,
  afterEach: globalThis.afterEach,
};

window.before = () => {};
window.beforeEach = () => {};
window.after = () => {};
window.afterEach = () => {};