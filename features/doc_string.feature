Feature: doc string

  Scenario: as only step definition argument
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a doc string step
            \"\"\"
            The cucumber (Cucumis sativus) is a widely cultivated plant in the gourd family Cucurbitaceae.
            \"\"\"
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a doc string step", function(docString) {
        expect(docString).to.equal("The cucumber (Cucumis sativus) is a widely " +
                                   "cultivated plant in the gourd family Cucurbitaceae.")
      })
      """
    When I run cypress
    Then it passes

  Scenario: with other step definition arguments
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: a feature
        Scenario: a scenario
          Given a "doc string" step
            \"\"\"
            The cucumber (Cucumis sativus) is a widely cultivated plant in the gourd family Cucurbitaceae.
            \"\"\"
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given } = require("@badeball/cypress-cucumber-preprocessor");
      Given("a {string} step", function(type, docString) {
        expect(type).to.equal("doc string")
        expect(docString).to.equal("The cucumber (Cucumis sativus) is a widely " +
                                   "cultivated plant in the gourd family Cucurbitaceae.")
      })
      """
    When I run cypress
    Then it passes
