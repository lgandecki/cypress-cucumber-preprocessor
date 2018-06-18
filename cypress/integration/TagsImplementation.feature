Feature: Tags Implementation

  As a cucumber cypress plugin which handles Tags
  I want to allow people to tag their scenarios with any tag
  And then they can use those tags as per https://docs.cucumber.io/cucumber/api/#tags

  Scenario: Pass no tags (see Background)
    Given my CLI string is '--lots of random things'
    Then the cypress runner should not break
  
  Scenario: Pass a single tag
    Given my CLI string is '--tags @smoke-tests'
    Then my filter should specify ONLY '@smoke-tests'

  Scenario: Pass a tag to ignore
    Given my CLI string is '--tags ~@ignore'
    Then my filter should specify to IGNORE '@ignore'

  Scenario: Passing multiple tags
    Given my CLI string is '--tags "@foo and @bar"'
    Then my filter should specify ONLY '@foo' AND '@bar'