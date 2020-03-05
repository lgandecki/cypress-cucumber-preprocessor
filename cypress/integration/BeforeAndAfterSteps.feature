Feature: Using Before and After

Scenario: With Untagged Before
    Then Untagged Before was called once
    And Tagged Before was not called

# After is tested in following scenario by verifying that the After ran at the end of the previous one
Scenario: With Untagged After part 1
  Given I executed empty step

Scenario: With Untagged After part 2
  Then Flag should be set by untagged After

# After is tested in following scenario by verifying that the After ran at the end of the previous one.
@withTaggedAfter
Scenario: With tagged After part 1
  Given I executed empty step

Scenario: With tagged After part 2
  Then Flag should be set by tagged After

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

# After is tested in following scenario by verifying that the After ran at the end of the previous one
# Even though the previous one failed - commented because can't have tests that fail in the suite
Scenario: After runs after test failure part 1
    Given I executed empty step
    # And An error happens
    And I executed empty step

Scenario: After runs after test failure part 2
    Then Flag should be set by untagged After

# After is tested in following scenario by verifying that the After ran at the end of the previous one
# Even though the previous one failed in the Before block - commented because can't have tests that fail in the suite
#@errorInBefore
Scenario: After runs after Before failure part 1
    Given I executed empty step

Scenario: After runs after Before failure part 2
    Then Flag should be set by untagged After
