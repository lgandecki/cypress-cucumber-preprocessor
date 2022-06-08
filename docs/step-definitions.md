# Step definitions

Step definitions are resolved using search paths that are configurable through the `stepDefinitions` property. The preprocessor uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig), which means you can place configuration options in EG. `.cypress-cucumber-preprocessorrc.json` or `package.json`. The default search paths are shown below.

```json
{
  "stepDefinitions": [
    "[filepath]/**/*.{js,ts}",
    "[filepath].{js,ts}",
    "cypress/support/step_definitions/**/*.{js,ts}",
  ]
}
```

This means that if you have a file `cypress/e2e/duckduckgo.feature`, it will match step definitions found in

* `cypress/e2e/duckduckgo/steps.ts`
* `cypress/e2e/duckduckgo.ts`
* `cypress/support/step_definitions/duckduckgo.ts`

## Hierarchy

There's also a `[filepart]` option available. Given a configuration shown below

```json
{
  "stepDefinitions": [
    "[filepart]/step_definitions/**/*.{js,ts}"
  ]
}
```

... and a feature file `cypress/e2e/foo/bar/baz.feature`, the preprocessor would look for step definitions in

* `cypress/e2e/foo/bar/baz/step_definitions/**/*.{js,ts}`
* `cypress/e2e/foo/bar/step_definitions/**/*.{js,ts}`
* `cypress/e2e/foo/step_definitions/**/*.{js,ts}`
* `cypress/e2e/step_definitions/**/*.{js,ts}`
* `cypress/step_definitions/**/*.{js,ts}`
* `step_definitions/**/*.{js,ts}`
