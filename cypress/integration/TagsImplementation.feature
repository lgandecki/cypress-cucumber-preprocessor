Feature: Tags Implementation

  As a cucumber cypress plugin which handles Tags
  I want to allow people to tag their scenarios with any tag
  And then they can use those tags as per https://docs.cucumber.io/cucumber/api/#tags

  Scenario: Pass no tags
    Given my cypress environment variable TAGS is 'lots of random things'
    Then the cypress runner should not break

  Scenario: Pass a single tag
    Given my cypress environment variable TAGS is '@smoke-tests'
    Then tests tagged '@smoke-tests' should proceed
    And tests tagged '@wrong-tag' should not proceed
    And tests tagged '@focus' should proceed

  Scenario: Pass a tag to ignore
    Given my cypress environment variable TAGS is 'not @ignore'
    Then tests tagged '@ignore' should not proceed
    And tests tagged '@do-not-ignore' should proceed
    And tests tagged '@focus' should proceed
    And tests tagged '@ignore @focus' should proceed

  Scenario: Passing multiple tags joined by AND operator
    Given my cypress environment variable TAGS is '@foo and @bar'
    Then tests tagged '@foo @bar' should proceed
    And tests tagged '@foo @ba' should not proceed
    And tests tagged '@focus' should proceed

  Scenario: Passing multiple tags joined by OR operator
    Given my cypress environment variable TAGS is '@foo or @bar'
    Then tests tagged '@foo' should proceed
    And tests tagged '@bar' should proceed
    And tests tagged '@foo @baz' should proceed
    And tests tagged '@fo @ba' should not proceed
    And tests tagged '@focus' should proceed