# Tags

Tests can be filtered using the (Cypress-) [environment variable](https://docs.cypress.io/guides/guides/environment-variables) `tags` or `TAGS`. Note that the term "environment variable" here does **not** refer to OS-level environment variables.

A feature or scenario can have as many tags as you like, separated by spaces. Tags can be placed above the following Gherkin elements.

* `Feature`
* `Rule`
* `Scenario`
* `Scenario Outline`
* `Examples`

In `Scenario Outline`, you can use tags on different example like below.

```cucumber
Scenario Outline: Steps will run conditionally if tagged
  Given user is logged in
  When user clicks <link>
  Then user will be logged out

  @mobile
  Examples:
    | link                  |
    | logout link on mobile |

  @desktop
  Examples:
    | link                   |
    | logout link on desktop |
```

It is not possible to place tags above `Background` or steps (`Given`, `When`, `Then`, `And` and `But`).

## Tag inheritance

Tags are inherited by child elements. Tags that are placed above a `Feature` will be inherited by `Scenario`, `Scenario Outline`, or `Examples`. Tags that are placed above a `Scenario Outline` will be inherited by `Examples`.

## Running a subset of scenarios

Normally when running a subset of scenarios using `cypress run --env tags=@foo`, you could potentially encounter files containing no matching scenarios. These can be pre-filtered away by setting `filterSpecs` to `true`, thus saving you execution time.

## Ignoring a subset of scenarios

You can ignore scenarios using `cypress run --env tags="not @foo"`.  If you define this in the `package.json`, be sure to escape the quotes, e.g. 
```
 "scripts": {
    "runFeaturesNotIgnore": "node_modules\\.bin\\cypress run --env tags=\"not @foo\" "
  },
```

## Omit filtered tests

By default, all filtered tests are made *pending* using `it.skip` method. If you want to completely omit them, set `omitFiltered` to `true`.

## Smart tagging

In the absence of a `tags` value and presence of a scenario with `@only`, only said scenario will run. You can in other words use this tag as you would use `.only()` in Mocha.

Similarly, scenarios tagged with `@skip` will always be skipped, despite being tagged with something else matching a tag filter.

