Feature: Being a plugin handling Scenario Outline

  As a cucumber cypress plugin which handles Scenario Outline
  I want to allow people to write Scenario Outline tests and run it in cypress

  Scenario Outline: Using Scenario Outlines
    When I add <provided number> and <another provided number>
    Then I verify that the result is equal the <provided>

    Examples:
      | provided number | another provided number | provided |
      | 1               | 2                       | 3        |
      | 100             | 200                     | 300      |

  Scenario Outline: Use juicer with <fruit>
    Given I put "<fruit>" in a juicer
    When I switch it on
    Then I should get "<juice>"

    Examples:
      | fruit      | juice            |
      | apple      | apple juice      |
      | pineapple  | pineapple juice  |
      | strawberry | strawberry juice |

  Scenario Outline: A calculation
    When I enter <first> and <second>
    Then I see following result table
      | first   | second   | result   |
      | <first> | <second> | <result> |

    Examples:
      | first | second | result |
      | 1     | 2      | 3      |
      | 3     | 4      | 7      |
      | 5     | 6      | 11     |