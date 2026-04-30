@landing
Feature: Landing Page
  As a visitor
  I want to see the LaunchKit landing page
  So I can understand the product and decide to purchase

  Background:
    Given I am on the landing page

  @smoke
  Scenario: Hero section renders correctly
    Then I should see the headline "Ship your SaaS"
    And I should see the headline "this weekend."
    And I should see a "Get LaunchKit — $149" CTA button
    And I should see a "Try free" button

  @smoke
  Scenario: Stack configurator shows correct order
    When I scroll to the stack configurator
    Then I should see step "1" labeled "Auth"
    And I should see step "2" labeled "Payments"
    And I should see step "3" labeled "Database"
    And I should see "Clerk" selected for auth
    And I should see "Stripe" selected for payments

  Scenario: Copy command matches demo style
    When I scroll to the stack configurator
    Then the terminal should show "npx create-launchkit@latest"
    And the terminal should show "my-app"
    And the free template link should be visible

  Scenario: Copying the command with Neon database
    When I scroll to the stack configurator
    And I click the "Copy" button in the terminal
    Then the button should show "Copied!"

  Scenario: Switching to Supabase changes the command
    When I scroll to the stack configurator
    And I click the "Supabase" database option
    Then the terminal should show "--db=supabase"

  @smoke
  Scenario: Navigation links are visible on desktop
    Then the desktop nav should show "Features"
    And the desktop nav should show "Pricing"
    And the desktop nav should show "Free Prompts"
    And the desktop nav should show "Docs"
    And the desktop nav should show "Changelog"

  Scenario: AI tools section lists all six tools
    When I scroll to the AI tools section
    Then I should see "Claude Code" in the AI tools list
    And I should see "Cursor" in the AI tools list
    And I should see "Windsurf" in the AI tools list
    And I should see "Antigravity" in the AI tools list
    And I should see "Codex / o3" in the AI tools list

  Scenario: Templates section shows all 6 templates
    When I scroll to the templates section
    Then I should see the template "Haveno"
    And I should see the template "Socialhub"
    And I should see the template "Agenix"

  Scenario: Pricing section shows correct prices
    When I scroll to the pricing section on the landing page
    Then I should see "$149" pricing
    And I should see "one-time" pricing type

  Scenario: Footer renders with correct content
    When I scroll to the footer
    Then the footer should show "People In Tech LLC" or "LaunchKit"
    And I should see footer links

  @mobile
  Scenario: Mobile command snippet is visible on small screens
    Given I am viewing on a mobile viewport
    When I am on the landing page
    Then I should see "npx create-launchkit@latest my-saas" in the mobile snippet
