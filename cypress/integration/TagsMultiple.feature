Feature: Tags Multiple

  I should be able to pass @tagName and @tagName2 to run ONLY scenarios tagged with BOTH tags

  Background:
    Given I pass the CLI option '--tags "@foo and @bar"'

  @foo
  Scenario: Scenario tagged as @foo
    Then this step marks the '@foo' as done
  
  @bar
  Scenario: Scenario tagged as @bar
    Then this step marks the '@bar' as done

  @foo @bar
  Scenario: Scenario tagged as @foo and @bar
    Then this step marks the '@foo and @bar' as done
    Then the '@foo and @bar' scenario SHOULD have run
    And the '@foo' scenario should NOT have been run
    And the '@bar' scenario should NOT have been run

  @foo @bar
  Scenario: Clear the state
    Then clear the state