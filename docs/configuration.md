# Configuration

The preprocessor uses [cosmiconfig](https://github.com/davidtheclark/cosmiconfig), which means you can place configuration options in EG. `.cypress-cucumber-preprocessorrc.json` or `package.json`, with corresponding examples shown below.

```
// .cypress-cucumber-preprocessorrc.json
{
  "json": {
    "enabled": true
  }
}
```

```
// package.json
{
  "dependencies": {
    "@badeball/cypress-cucumber-preprocessor": "latest"
  },
  "cypress-cucumber-preprocessor": {
    "json": {
      "enabled": true
    }
  }
}
```

## Configuration overrides

Configuration options can be overriden using (Cypress-) [environment variable](https://docs.cypress.io/guides/guides/environment-variables). The `filterSpecs` options (described in [docs/tags.md](tags.md)) can for instance be overriden by running Cypress like shown below.

```
$ cypress run -e filterSpecs=true
```

Cypress environment variables can also be configured through ordinary environment variables, like shown below.

```
$ CYPRESS_filterSpecs=true cypress run
```

Every configuration option has a similar key which can be use to override it, shown in the table below.

| JSON path          | Environment key   | Example(s)                               |
|--------------------|-------------------|------------------------------------------|
| `stepDefinitions`  | `stepDefinitions` | `[filepath].{js,ts}` |
| `messages.enabled` | `messagesEnabled` | `true`, `false`                          |
| `messages.output`  | `messagesOutput`  | `cucumber-messages.ndjson`               |
| `json.enabled`     | `jsonEnabled`     | `true`, `false`                          |
| `json.formatter`   | `jsonFormatter`   | `/usr/bin/cucumber-json-formatter`       |
| `json.output`      | `jsonOutput`      | `cucumber-report.json`                   |
| `filterSpecs`      | `filterSpecs`     | `true`, `false`                          |
| `omitFiltered`     | `omitFiltered`    | `true`, `false`                          |
