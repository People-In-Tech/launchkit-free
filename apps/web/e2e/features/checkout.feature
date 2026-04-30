@checkout @stripe
Feature: Stripe Checkout
  As an authenticated user
  I want to purchase LaunchKit
  So I can access the full codebase and templates

  # ──────────────────────────────────────────────────────────────
  # NOTE: Stripe tests require:
  #   1. STRIPE_SECRET_KEY=sk_test_... (test mode key)
  #   2. stripe listen --forward-to localhost:3000/api/webhooks/stripe
  #   3. TEST_USER_EMAIL + TEST_USER_PASSWORD in .env.test
  # Test cards: https://stripe.com/docs/testing#cards
  # ──────────────────────────────────────────────────────────────

  Background:
    Given I am signed in as a test user

  @smoke @happy-path
  Scenario: Checkout API creates a Stripe session for Solo plan
    When I POST to "/api/billing/checkout" with plan "pro"
    Then the response status should be 200
    And the response should contain a "url" field
    And the "url" should start with "https://checkout.stripe.com"

  @smoke @happy-path
  Scenario: Successful Solo purchase with test card
    Given I am on the pricing page
    When I click "Get LaunchKit — $149"
    Then I should be redirected to Stripe Checkout
    And the Stripe Checkout should show "$149"
    When I fill in the email field with my test email
    And I fill in the card number with "4242 4242 4242 4242"
    And I fill in the expiry with "12 / 26"
    And I fill in the CVC with "424"
    And I fill in the cardholder name with "Test User"
    And I fill in the billing ZIP with "12345"
    And I click the "Pay" button
    Then I should be redirected back to the app
    And the page should not show any checkout error

  Scenario: Declined card shows error on Stripe Checkout
    Given I am on the pricing page
    When I click "Get LaunchKit — $149"
    Then I should be redirected to Stripe Checkout
    When I fill in the email field with my test email
    And I fill in the card number with "4000 0000 0000 9995"
    And I fill in the expiry with "12 / 26"
    And I fill in the CVC with "424"
    And I fill in the billing ZIP with "12345"
    And I click the "Pay" button
    Then Stripe should show a card decline error

  Scenario: 3DS authentication challenge is presented
    Given I am on the pricing page
    When I click "Get LaunchKit — $149"
    Then I should be redirected to Stripe Checkout
    When I fill in the email field with my test email
    And I fill in the card number with "4000 0025 0000 3155"
    And I fill in the expiry with "12 / 26"
    And I fill in the CVC with "424"
    And I fill in the billing ZIP with "12345"
    And I click the "Pay" button
    Then Stripe should show a 3D Secure authentication challenge

  Scenario: Checkout API returns error for unauthenticated request
    Given I am not signed in
    When I POST to "/api/billing/checkout" with plan "pro"
    Then the response status should be 401

  Scenario: Pricing page shows correct prices and one-time label
    Given I navigate to "/pricing"
    Then I should see "$149" for the Solo plan
    And I should see "$299" for the Teams plan
    And I should see "one-time" pricing type for both plans

  Scenario: Checkout session expired — does not grant access
    Given a checkout session has expired
    When the webhook "checkout.session.expired" fires
    Then no access record should be created for that session

  @webhook
  Scenario: Webhook grants access on successful payment
    Given a test checkout session completes successfully
    When the webhook "checkout.session.completed" fires with a valid signature
    Then the user should have an access record in the database
    And the user should be able to access pro templates
