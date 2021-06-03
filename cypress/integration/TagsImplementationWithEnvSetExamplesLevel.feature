Feature: Tags Implementation with environmental variables set only at examples level

  As a cucumber cypress plugin which handles Tags
  I want to allow people set any tags via CLI
  And run only tests selected even if they are tagged only at examples level

  Scenario Outline: This scenario should run only 1 example
    Given '@test-tag' is in current TAGS environmental variable
    Then this <result>

    @test-tag
    Examples:
      | result     |
      | should run |

    Examples:
      | result         |
      | should not run |