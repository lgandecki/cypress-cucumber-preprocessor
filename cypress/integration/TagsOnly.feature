Feature: Tags Only

  I should be able to pass @tagName to run ONLY scenarios tagged with that tag

  Background:
    Given I pass the CLI option '--tags @smoke-tests'

  Scenario: Scenario not tagged as @smoke-tests
    Then this step marks the 'not smoke tests' as done

  @smoke-tests
  Scenario: Scenario tagged as @smoke-tests
    Then this step marks the '@smoke-tests' as done
    And the 'not smoke tests' scenario should NOT have been run
    And the '@smoke-tests' scenario SHOULD have run

  Scenario Outline: Scenario outline with mixture of tags
    Then this step marks the '<scenario>' as done
  
    Examples:
      | scenario      |
      | to-be-ignored |
    
    @smoke-tests
    Examples:
      | scenario      |
      | do-not-ignore |

  @smoke-tests
  Scenario: Validate Tags for Scenario Outline Examples
    Then the 'to-be-ignored' scenario should NOT have been run
    And the 'do-not-ignore' scenario SHOULD have run

  @smoke-tests
  Scenario: Clear the state
    Then clear the state