Feature: Using And and but
Scenario: With an And everything is find
    Given I do something
    And Something else
    Then I happily work

Scenario: With a But also the step definition 
    Given I dont do something
    And it is sunday
    Then I stream on twitch
    But only when not tired
