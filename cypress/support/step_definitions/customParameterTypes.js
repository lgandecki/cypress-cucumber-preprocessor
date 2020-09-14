/* global defineParameterType, Then, When */

const notes = ["A", "B", "C", "D", "E", "F", "G"];

defineParameterType({
  name: "note",
  regexp: new RegExp(notes.join("|")),
});

defineParameterType({
  name: "ordinal",
  regexp: /(\d+)(?:st|nd|rd|th)/,
  transformer(s) {
    return parseInt(s, 10);
  },
});

let keySound = null;

When("I press the {ordinal} key of my piano", (number) => {
  keySound = notes[(number - 1) % 7];
});

Then("I should hear a(n) {note} sound", (note) => {
  expect(note).to.equal(keySound);
});
