/* global defineParameterType, then, when */

const notes = ["A", "B", "C", "D", "E", "F", "G"];

defineParameterType({
  name: "note",
  regexp: new RegExp(notes.join("|"))
});

defineParameterType({
  name: "ordinal",
  regexp: /(\d+)(?:st|nd|rd|th)/,
  transformer(s) {
    return parseInt(s, 10);
  }
});

let keySound = null;

when("I press the {ordinal} key of my piano", number => {
  keySound = notes[(number - 1) % 7];
});

then("I should hear a(n) {note} sound", note => {
  expect(note).to.equal(keySound);
});
