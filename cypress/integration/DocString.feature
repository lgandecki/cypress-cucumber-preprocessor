Feature: Being a plugin handling DocString scenario

  As a cucumber cypress plugin which handles DocString
  I want to allow people to write DocString scenarios and run it in cypress

  Scenario: DocString
    When I use DocString for code like this:
    """
    expect(true).to.equal(true)
    variableToVerify = "hello world"
    """
    Then I ran it and verify that it executes it

  Scenario: DocString
    When I use DocString for freemarker code like this
    """
    <div>
      <h1>${ article.title }</h1>
    </div>
    """
    Then I can interpret it as a string

  Scenario Outline: DocString
    When I use DocString with argument like this:
      """
      Hey,
      You have been granted <Role> rights.
      -The Admins
      """
    Then I should have a string with argument "<Role>"
    
   Examples:
    |  Role     |
    |  Manager  |
    |  Admin    |
