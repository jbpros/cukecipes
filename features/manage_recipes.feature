Feature: manage recipes
  As a veggie
  In order to remember great cucumber recipes
  I want to manage them in a diary

  Scenario: add recipe
    When I add a recipe
    Then I see the recipe in the diary
