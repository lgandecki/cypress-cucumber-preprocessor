# Changelog

All notable changes to this project will be documented in this file.

## Next

Fixed [Cypress 10 compatibility issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/722).

Breaking changes:

- Preprocessor is no longer compatible with Cypress versions <10.
- `stepDefinitions` configuration using `[filepath]` and `[filepart]` must be adapted due to the disapperance of the `integrationFolder` (cf. [step definitions](https://github.com/badeball/cypress-cucumber-preprocessor/blob/master/docs/step-definitions.md)).

Basically, if you add the following Cypress configuration :

```json
{
  "integrationFolder": "cypress/integration"
}
```

and the following cypress-cucumber-preprocessor configuration :

```json
{
  "stepDefinitions": "cypress/integration/[filepath].{ts,js}"
}
```

Then, now that `integrationFolder` has been removed, you have to change your cypress-cucumber-preprocessor configuration to :

```json
{
  "stepDefinitions": "[filepath].{ts,js}"
}
```

(same applies to `[filepart]`).

## v10.0.2

- Allow integration folders outside of project root, fixes [#719](https://github.com/badeball/cypress-cucumber-preprocessor/issues/719).

## v10.0.1

- Fixed an [issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/720) where internal calls to `cy.wrap` was being logged.

## v10.0.0

Breaking changes:

- Exported member `resolvePreprocessorConfiguration` now *requires* a `projectRoot` variable and a `environment` variable.

Other changes:

- Configuration values can now be overriden using (Cypress-) [environment variable](https://docs.cypress.io/guides/guides/environment-variables).

## v9.2.1

- Fixed an [issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/713) with returning chainables from step definitions.

## v9.2.0

- Allow handlers to be omitted and attached explicitly, fixes [#705](https://github.com/badeball/cypress-cucumber-preprocessor/issues/705) (undocumented, experimental and API is subject to change anytime).

## v9.1.3

- Fixed an [issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/704) where programmatically skipping a test would error.

## v9.1.2

- Fixed an [issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/701) where Before hooks would error.

## v9.1.1

- Add timestamps and durations to messages.

## v9.1.0

- Automatically skip tests marked with `@skip`.

## v9.0.5

- Correct types for `isFeature` and `doesFeatureMatch`.

## v9.0.4

- Prevent an error when `experimentalInteractiveRunEvents` is enabled.

## v9.0.3

- Fixed an issue where the preprocessor was throwing in interactive mode when JSON reports was enabled.

## v9.0.2

- Fixed an [issue](https://github.com/badeball/cypress-cucumber-preprocessor/issues/694) when running all specs.

## v9.0.1

Due to an publishing error from my side, this version is identical to v9.0.0.

## v9.0.0

This is the point where [badeball](https://github.com/badeball)'s fork becomes the mainline and replaces [TheBrainFamily](https://github.com/TheBrainFamily)'s implementation. This implementation has been re-written from scratch in TypeScript, has more thorough test coverage and is filled with a bunch of new feature. Read more about the transfer of ownership [here](https://github.com/badeball/cypress-cucumber-preprocessor/issues/689).

The changelog of the two ancestors can be found at

- [TheBrainFamily's history / changelog](https://github.com/badeball/cypress-cucumber-preprocessor/blob/7031d0283330bca814d6923d35d984224622b4cf/CHANGELOG.md)
- [badeball's history / changelog](https://github.com/badeball/cypress-cucumber-preprocessor/blob/v9.0.0/CHANGELOG.md)
