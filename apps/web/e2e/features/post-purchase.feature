@access @post-purchase
Feature: Post-Purchase Access
  As a buyer
  I want to access the pro template and dashboard after purchasing
  So I can get the value I paid for

  Scenario: Access API returns 401 for unauthenticated users
    Given I am not signed in
    When I GET "/api/access/templates"
    Then the response status should be 401

  Scenario: Access API returns 403 for authenticated users without purchase
    Given I am signed in as a free user
    When I GET "/api/access/templates"
    Then the response status should be 403

  Scenario: Access API returns 200 for authenticated users with purchase
    Given I am signed in as a user who has purchased
    When I GET "/api/access/templates"
    Then the response status should be 200
    And the response should contain a "repoUrl" field

  Scenario: Dashboard loads for authenticated user
    Given I am signed in as a test user
    When I navigate to "/dashboard"
    Then I should be on the "/dashboard" page
    And the dashboard overview should load

  Scenario: Prompts page loads with gated content
    Given I navigate to "/prompts"
    Then the prompts page should load
    And prompt cards should be visible
    And at least one prompt image should be displayed

  Scenario: Free prompts page accessible without login
    Given I am not signed in
    When I navigate to "/prompts"
    Then I should be on the "/prompts" page
    And the page should load without errors
