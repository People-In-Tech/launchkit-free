@mobile @responsive
Feature: Mobile Responsiveness
  As a mobile user
  I want the LaunchKit site to be usable on my phone
  So I can browse and purchase on any device

  Background:
    Given I am viewing on a mobile viewport

  @smoke
  Scenario: Landing page has no horizontal scroll on mobile
    When I am on the landing page
    Then the page should not have horizontal overflow

  @smoke
  Scenario: Hero section readable on mobile
    When I am on the landing page
    Then I should see the headline "Ship your SaaS"
    And the mobile command snippet should be visible

  Scenario: Stack configurator renders without overflow on mobile
    When I am on the landing page
    And I scroll to the stack configurator
    Then the stack configurator should be visible
    And the terminal block should not overflow horizontally
    And the command "--db=neon" should be visible

  @smoke
  Scenario: Mobile hamburger button is visible
    When I am on the landing page
    Then the hamburger button should be visible
    And the desktop nav should be hidden

  @smoke
  Scenario: Full mobile menu flow
    When I am on the landing page
    And I click the hamburger menu button
    Then the mobile menu panel should be visible
    And I should see "Free Prompts" in the mobile menu
    When I click "Pricing" in the mobile menu
    Then I should be on the "/pricing" page

  Scenario: Pricing page has no horizontal scroll on mobile
    When I navigate to "/pricing"
    Then the page should not have horizontal overflow

  Scenario: Prompts page loads on mobile
    When I navigate to "/prompts"
    Then the page should not have horizontal overflow
    And the page should load without errors

  Scenario: All CTA buttons are full-width on mobile
    When I am on the landing page
    Then the "Get LaunchKit — $149" button should be full width on mobile
