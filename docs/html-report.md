[← Back to documentation](readme.md)

# HTML reports

HTML reports are powered by [`@cucumber/html-formatter`](https://github.com/cucumber/html-formatter). They can be enabled using the `html.enabled` property. The preprocessor uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig), which means you can place configuration options in EG. `.cypress-cucumber-preprocessorrc.json` or `package.json`. An example configuration is shown below.

```json
{
  "html": {
    "enabled": true
  }
}
```

The report is outputted to `cucumber-report.html` in the project directory, but can be configured through the `html.output` property.

`html.override` is a boolean flag defaulted to true, if set to `false` files will be created with epoch timestamp

## Screenshots

Screenshots are automatically added to HTML reports, including that of failed tests (unless you have disabled `screenshotOnRunFailure`).

## Attachments

Attachments can also be added to HTML reports through an API. This API is further explained in [JSON report](json-report.md), but applies to HTML reports as well.
