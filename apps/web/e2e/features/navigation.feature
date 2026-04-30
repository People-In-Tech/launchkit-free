@navigation
Feature: Navigation
  As a visitor
  I want to navigate the LaunchKit site
  So I can find information and access different sections

  Background:
    Given I am on the landing page

  @smoke
  Scenario: Pricing link navigates to pricing page
    When I click the "Pricing" nav link on desktop
    Then I should be on the "/pricing" page
    And I should see the pricing heading

  Scenario: Demo link navigates to demo page
    When I click the "Demo" nav link on desktop
    Then I should be on the "/demo" page

  @smoke @mobile
  Scenario: Mobile hamburger menu opens
    Given I am viewing on a mobile viewport
    When I click the hamburger menu button
    Then the mobile menu panel should be visible
    And I should see "Features" in the mobile menu
    And I should see "Pricing" in the mobile menu
    And I should see "Free Prompts" in the mobile menu

  @mobile
  Scenario: Mobile menu closes when a nav link is clicked
    Given I am viewing on a mobile viewport
    When I click the hamburger menu button
    And I click "Pricing" in the mobile menu
    Then the mobile menu panel should not be visible
    And I should be on the "/pricing" page

  @mobile
  Scenario: Mobile menu closes when backdrop is clicked
    Given I am viewing on a mobile viewport
    When I click the hamburger menu button
    Then the mobile menu panel should be visible
    When I click the backdrop overlay
    Then the mobile menu panel should not be visible

  @mobile
  Scenario: Mobile menu CTA buttons are visible
    Given I am viewing on a mobile viewport
    When I click the hamburger menu button
    Then I should see a "Sign In" button in the mobile menu
    And I should see a "Get LaunchKit" button in the mobile menu

  Scenario: Logo link navigates to home
    When I navigate to "/pricing"
    And I click the logo in the header
    Then I should be on the "/" page
