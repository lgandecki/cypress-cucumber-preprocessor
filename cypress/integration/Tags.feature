Feature: Tags

  As a cucumber cypress plugin which handles Tags
  I want to allow people to write Tags tests and run it in cypress

  Background:
    Given tags counter is incremented

  Scenario: Scenario without ignore tags
    Then tags counter equals 1

  @ignore
  Scenario: Scenario with ignore tags
    Then tags counter equals 1


  Scenario Outline: Example ignore tags
    Then tags counter equals <number>
  @ignore
  Examples:
    | number |
    | 2      |
  Examples:
    | number |
    | 2      |
    | 3      |

