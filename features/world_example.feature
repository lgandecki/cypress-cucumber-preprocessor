Feature: world

  Scenario: example of an World
    Given a file named "cypress/e2e/a.feature" with:
      """
      Feature: Simple maths
        In order to do maths
        As a developer
        I want to increment variables

        Scenario: easy maths
          Given a variable set to 1
          When I increment the variable by 1
          Then the variable should contain 2

        Scenario Outline: much more complex stuff
          Given a variable set to <var>
          When I increment the variable by <increment>
          Then the variable should contain <result>

          Examples:
            | var | increment | result |
            | 100 |         5 |    105 |
            |  99 |      1234 |   1333 |
            |  12 |         5 |     17 |
      """
    And a file named "cypress/support/e2e.ts" with:
      """
      beforeEach(function () {
        // This mimics setWorldConstructor of cucumber-js.
        const world = {
          variable: 0,

          setTo(number) {
            this.variable = number;
          },
        
          incrementBy(number) {
            this.variable += number;
          }
        };

        Object.assign(this, world);
      });
      """
    And a file named "cypress/support/step_definitions/steps.js" with:
      """
      const { Given, When, Then } = require("@badeball/cypress-cucumber-preprocessor");

      Given("a variable set to {int}", function(number) {
        this.setTo(number);
      });

      When("I increment the variable by {int}", function(number) {
        this.incrementBy(number);
      });

      Then("the variable should contain {int}", function(number) {
        expect(this.variable).to.equal(number);
      });
      """
    When I run cypress
    Then it passes
