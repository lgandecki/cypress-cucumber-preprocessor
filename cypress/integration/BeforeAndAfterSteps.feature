Feature: Using Before and After

Scenario: With Untagged Before
    Then Untagged Before was called once
    And Tagged Before was not called

# After is tested in following scenario by verifying that the After ran at the end of the previous one
Scenario: With Untagged After part 1
  Given I executed empty step

Scenario: With Untagged After part 2
  Then Flag should be set by untagged After

# After is tested in following scenario by verifying that the After ran at the end of the previous one
# Note: Since this test requires that a scenario fails, it must be run manually enabled and run and
# "Given I executed step causing error" is expected to cause an error
# Scenario: With Untagged After having test errors in steps part 1
#   Given I executed step causing error
# Scenario: With Untagged After having test errors in steps part 2
#   Then Error flag should be set by untagged After

# After is tested in following scenario by verifying that the After ran at the end of the previous one.
@withTaggedAfter
Scenario: With tagged After part 1
  Given I executed empty step

Scenario: With tagged After part 2
  Then Flag should be set by tagged After

# After is tested in following scenario by verifying that the After ran at the end of the previous one.
# Note: Since this test requires that a scenario fails, it must be run manually enabled and run and
# "Given I executed step causing error" is expected to cause an error
@withTaggedErroredAfter
# Scenario: With tagged After having test errors part 1
#   Given I executed step causing error
#
# Scenario: With tagged After having test errors part 2
#   Then Error flag should be set by tagged After

@withTaggedBefore
Scenario: With tagged Before only
  Then Tagged Before was called once
  And Untagged Before was called once

@withTaggedBefore
@withAnotherTaggedBefore
Scenario: With multiple tags
    Given I executed empty step
    Then Tagged Before was called twice
    And Untagged Before was called once

Scenario Outline: With tagged Before only on one of the examples
  Then Tagged Before was <result>

  @withTaggedBefore
  Examples:
  | result      |
  | called once |

  Examples:
    | result     |
    | not called |

@withTaggedBefore
Scenario Outline: With tagged Before on scenario outline with multiple examples
    Then Tagged Before was <result>

    Examples:
      | result      |
      | called once |

    Examples:
      | result      |
      | called once |