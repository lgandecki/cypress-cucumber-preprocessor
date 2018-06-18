Feature: Tags

  As a cucumber cypress plugin which handles Tags
  I want to allow people to tag their scenarios with any tag
  And then they can use those tags as per https://docs.cucumber.io/cucumber/api/#tags

  Scenario: Pass no tags
    Given I pass '--lots of random things'
    Then the cypress runner should not break
  
  Scenario: Pass a single tag
    Given I pass '--tags @smoke-tests'
    Then scenarios tagged '@smoke-tests' should run

  Scenario: Pass a tag to ignore
    Given I pass '--tags ~@ignore'
    Then all scenarios EXCEPT those tagged '@ignore' should run 

  Scenario: Passing multiple tags
    Given I pass '--tags "@foo and @bar"'
    Then all scenarios tagged as both '@foo' and '@bar' should run

  @ignore
  Scenario: Scenario tagged as @ignore
    Then the '@ignore' scenario was run

  Scenario: Scenario tagged as @ignore - was it ignored?
    Given we've run our suite of tests with the '~@ignore' parameter
    Then the '@ignore' scenario should NOT have been run

  # @smoke-tests
  # Scenario: Scenario tagged as @ignore
  #   Then the 'smoke-tests' scenario was run

  # @foo @bar
  # Scenario: Scenario tagged as @foo and @bar
  #   Then the 'foo' / 'bar' scenario was run
