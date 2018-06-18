Feature: Tags

  As a cucumber cypress plugin which handles Tags
  I want to allow people to tag their scenarios with any tag
  And then they can use those tags as per https://docs.cucumber.io/cucumber/api/#tags

  Scenario: Pass no tags
    Given I pass the CLI option '--lots of random things'
    Then the cypress runner should not break
  
  Scenario: Pass a single tag
    Given I pass the CLI option '--tags @smoke-tests'
    Then ONLY scenarios tagged '@smoke-tests' should run

  Scenario: Pass a tag to ignore
    Given I pass the CLI option '--tags ~@ignore'
    Then all scenarios EXCEPT those tagged '@ignore' should run 

  Scenario: Passing multiple tags
    Given I pass the CLI option '--tags "@foo and @bar"'
    Then ONLY scenarios tagged both '@foo' and '@bar' should run