Feature: rate recipes

  @wip
  Scenario: rate an excellent recipe
    Given a recipe I tried
    When I rate it as "excellent"
    Then my rating is displayed on the recipe
