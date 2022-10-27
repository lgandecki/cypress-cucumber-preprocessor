import { expectType } from "tsd";

import messages from "@cucumber/messages";

import "./";

import {
  Given,
  When,
  Then,
  Step,
  defineParameterType,
  Before,
  After,
  DataTable,
} from "../methods";

Given("foo", function (foo, bar: number, baz: string) {
  expectType<Mocha.Context>(this);
  expectType<unknown>(foo);
  expectType<number>(bar);
  expectType<string>(baz);
});

Given(/foo/, function (foo, bar: number, baz: string) {
  expectType<Mocha.Context>(this);
  expectType<unknown>(foo);
  expectType<number>(bar);
  expectType<string>(baz);
});

When("foo", function (foo, bar: number, baz: string) {
  expectType<Mocha.Context>(this);
  expectType<unknown>(foo);
  expectType<number>(bar);
  expectType<string>(baz);
});

When(/foo/, function (foo, bar: number, baz: string) {
  expectType<Mocha.Context>(this);
  expectType<unknown>(foo);
  expectType<number>(bar);
  expectType<string>(baz);
});

Then("foo", function (foo, bar: number, baz: string) {
  expectType<Mocha.Context>(this);
  expectType<unknown>(foo);
  expectType<number>(bar);
  expectType<string>(baz);
});

Then(/foo/, function (foo, bar: number, baz: string) {
  expectType<Mocha.Context>(this);
  expectType<unknown>(foo);
  expectType<number>(bar);
  expectType<string>(baz);
});

declare const table: DataTable;

Then("foo", function () {
  // Step should consume Mocha.Context.
  Step(this, "foo");
});

Then("foo", function () {
  // Step should consume DataTable's.
  Step(this, "foo", table);
});

Then("foo", function () {
  // Step should consume doc strings.
  Step(this, "foo", "bar");
});

defineParameterType({
  name: "foo",
  regexp: /foo/,
  transformer(foo, bar, baz) {
    expectType<Mocha.Context>(this);
    expectType<string>(foo);
    expectType<string>(bar);
    expectType<string>(baz);
  },
});

Before(function () {
  expectType<Mocha.Context>(this);
});

Before({}, function () {
  expectType<Mocha.Context>(this);
});

Before({ tags: "foo" }, function () {
  expectType<Mocha.Context>(this);
});

After(function () {
  expectType<Mocha.Context>(this);
});

After({}, function () {
  expectType<Mocha.Context>(this);
});

After({ tags: "foo" }, function () {
  expectType<Mocha.Context>(this);
});

interface CustomWorld extends Mocha.Context {
  pageDriver: {
    navigateTo(url: string): void;
  };
}

Given(/foo/, function (this: CustomWorld, url: string) {
  expectType<CustomWorld>(this);
  this.pageDriver.navigateTo(url);
});

When(/foo/, function (this: CustomWorld, url: string) {
  expectType<CustomWorld>(this);
  this.pageDriver.navigateTo(url);
});

Then(/foo/, function (this: CustomWorld, url: string) {
  expectType<CustomWorld>(this);
  this.pageDriver.navigateTo(url);
});

expectType<messages.GherkinDocument>(window.testState.gherkinDocument);
expectType<messages.Pickle[]>(window.testState.pickles);
expectType<messages.Pickle>(window.testState.pickle);
expectType<messages.PickleStep | undefined>(window.testState.pickleStep);
