Feature: Custom Parameter Types

  As a cucumber cypress plugin which handles Custom Parameter Types
  I want to allow people to add custom parameter types and use them into their step definitions

  Scenario: Play an A on my piano
    When I press the 1st key of my piano
    Then I should hear an A sound

  Scenario: Play an E on my piano
    When I press the 26th key of my piano
    Then I should hear an E sound
