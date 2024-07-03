import * as messages from "@cucumber/messages";

import { assert } from "./assertions";

export type StrictTimestamp = {
  seconds: number;
  nanos: number;
};

export function createTimestamp(): StrictTimestamp {
  const now = new Date().getTime();

  const seconds = Math.floor(now / 1_000);

  const nanos = (now - seconds * 1_000) * 1_000_000;

  return {
    seconds,
    nanos,
  };
}

export function duration(
  start: StrictTimestamp,
  end: StrictTimestamp
): StrictTimestamp {
  return {
    seconds: end.seconds - start.seconds,
    nanos: end.nanos - start.nanos,
  };
}

export function durationToNanoseconds(duration: StrictTimestamp): number {
  return Math.floor(duration.seconds * 1_000_000_000 + duration.nanos);
}

/**
 * Some messages are emitted out-of-order, but not all. The messages below are the ones that need
 * additional sorting. The remaining messages are untouched.
 */
const MESSAGES_ORDER: (keyof messages.Envelope)[] = [
  "meta",
  "source",
  "gherkinDocument",
  "pickle",
  "parameterType",
  "stepDefinition",
  "hook",
  "testRunStarted",
  "testCase",
];

export function orderMessages(
  messages: messages.Envelope[]
): messages.Envelope[] {
  const toBeSorted = messages.map((message, i) => {
    const keys = Object.keys(message) as (keyof messages.Envelope)[];

    assert(
      keys.length === 1,
      "Expected a message to have one, and only one, property"
    );

    const [key] = keys;

    const primary = MESSAGES_ORDER.indexOf(key);

    return {
      primary: primary === -1 ? null : primary,
      secondary: i,
      message,
    };
  });

  return toBeSorted
    .sort((a, b) => {
      if (a.primary === null && b.primary === null) {
        return a.secondary - b.secondary;
      } else if (a.primary === null) {
        return 1; // b comes first,
      } else if (b.primary === null) {
        return -1; // a comes first.
      } else {
        const order = a.primary - b.primary;

        // To get stable sorting out of a non-stable sorting function.
        return order === 0 ? a.secondary - b.secondary : order;
      }
    })
    .map(({ message }) => message);
}
