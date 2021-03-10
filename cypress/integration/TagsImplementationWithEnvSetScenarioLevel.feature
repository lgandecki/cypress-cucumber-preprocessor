Feature: Tags Implementation with environmental variables set only at scenario level

  As a cucumber cypress plugin which handles Tags
  I want to allow people set any tags via CLI
  And run only tests selected even if they are tagged only at scenario level

  Scenario: This scenario should not run if @test-tag is present in env
    Given '@test-tag' is in current TAGS environmental variable
    Then this should not run

  @test-tag
  Scenario: This scenario should run
    Given '@test-tag' is in current TAGS environmental variable
    Then this should run

  @focus
  Scenario: This scenario should run
    Given '@test-tag' is in current TAGS environmental variable
    Then this should run
