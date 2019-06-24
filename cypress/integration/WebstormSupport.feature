Feature: Webstorm support

  As a cucumber cypress plugin I want Webstorm to recognize capitalized
  step definitions so I can navigate from feature files to the corresponding
  step definition

  Scenario: The plugin recognizes capitalized Given, When and Then
    Given I am using the Cypress Cucumber plugin
    When I write my steps using caps
    Then Webstorm recognizes my 3 steps
    And Webstorm recognizes "words"
