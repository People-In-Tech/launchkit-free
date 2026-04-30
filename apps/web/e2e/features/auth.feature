@auth
Feature: Authentication
  As a visitor
  I want to sign up and sign in to LaunchKit
  So I can access the dashboard and purchase the product

  @smoke
  Scenario: Sign-up page loads correctly
    Given I navigate to "/auth/sign-up"
    Then the page should not have any errors
    And I should be on the "/auth/sign-up" page
    And the page title should contain "LaunchKit"

  @smoke
  Scenario: Sign-in page loads correctly
    Given I navigate to "/auth/sign-in"
    Then the page should not have any errors
    And I should be on the "/auth/sign-in" page
    And the page title should contain "LaunchKit"

  Scenario: Clerk sign-up component renders
    Given I navigate to "/auth/sign-up"
    Then the Clerk auth container should be present
    And the page lang should be "en"

  Scenario: Clerk sign-in component renders
    Given I navigate to "/auth/sign-in"
    Then the Clerk auth container should be present

  @smoke
  Scenario: Dashboard is protected — unauthenticated users redirected
    Given I am not signed in
    When I navigate to "/dashboard"
    Then I should be redirected away from "/dashboard"
    And the redirect URL should contain "sign-in"

  Scenario: Admin panel is protected — unauthenticated users redirected
    Given I am not signed in
    When I navigate to "/admin"
    Then I should be redirected away from "/admin"
    And the redirect URL should contain "sign-in"

  Scenario: Clicking "Get LaunchKit" when unauthenticated redirects to sign-up
    Given I am on the landing page
    And I am not signed in
    When I click the "Get LaunchKit — $149" CTA button
    Then I should be redirected to the sign-up page
    And the redirect URL should include a "redirect_url" param

  Scenario: Clicking "Try free" navigates to sign-up
    Given I am on the landing page
    When I click the "Try free" button
    Then I should be on the "/auth/sign-up" page
