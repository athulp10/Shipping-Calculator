# ============================================================
# Feature: Shipping Cost Calculator
# Covers: happy flow, fee breakdown, edge cases,
#         boundary values, input validation, API contract
# ============================================================

Feature: Shipping Cost Calculator
  As a customer or logistics operator
  I want to calculate the shipping cost for a package
  So that I know the exact price before placing a shipment

  Background:
    Given the shipping calculator service is running
    And the API endpoint is "POST /api/shipping/calculate"
    And the pricing rules are:
      | Rule              | Value  |
      | Base fee          | $5.00  |
      | Rate per kg       | $0.50  |
      | Rate per 100 km   | $1.00  |
      | Fragile surcharge | $3.00  |


  # ------------------------------------------------------------
  # Happy Flow – Standard Shipments
  # ------------------------------------------------------------

  Scenario: Standard fragile shipment (acceptance criterion baseline)
    Given a package weighing 2 kg
    And a delivery distance of 300 km
    And the package is fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the response currency should be "USD"
    And the fee breakdown should be:
      | Fee               | Amount |
      | base_fee          | 5.00   |
      | weight_fee        | 1.00   |
      | distance_fee      | 3.00   |
      | fragile_surcharge | 3.00   |
    And the total shipping cost should be $12.00

  Scenario: Standard non-fragile shipment
    Given a package weighing 2 kg
    And a delivery distance of 300 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the fee breakdown should include a fragile_surcharge of $0.00
    And the total shipping cost should be $9.00

  Scenario: Heavy long-distance non-fragile shipment
    Given a package weighing 100 kg
    And a delivery distance of 5000 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the fee breakdown should be:
      | Fee               | Amount |
      | base_fee          | 5.00   |
      | weight_fee        | 50.00  |
      | distance_fee      | 50.00  |
      | fragile_surcharge | 0.00   |
    And the total shipping cost should be $105.00

  Scenario: Heavy long-distance fragile shipment
    Given a package weighing 100 kg
    And a delivery distance of 5000 km
    And the package is fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the total shipping cost should be $108.00


  # ------------------------------------------------------------
  # Fee Breakdown Verification
  # ------------------------------------------------------------

  Scenario Outline: Fee breakdown is calculated correctly per component
    Given a package weighing <weight_kg> kg
    And a delivery distance of <distance_km> km
    And the package fragile status is <is_fragile>
    When I request a shipping cost calculation
    Then the response status should be 200
    And the fee breakdown should be:
      | Fee               | Amount            |
      | base_fee          | <base_fee>        |
      | weight_fee        | <weight_fee>      |
      | distance_fee      | <distance_fee>    |
      | fragile_surcharge | <fragile_charge>  |
    And the total shipping cost should be $<total>

    Examples:
      | weight_kg | distance_km | is_fragile | base_fee | weight_fee | distance_fee | fragile_charge | total  |
      | 2         | 300         | true       | 5.00     | 1.00       | 3.00         | 3.00           | 12.00  |
      | 2         | 300         | false      | 5.00     | 1.00       | 3.00         | 0.00           | 9.00   |
      | 10        | 200         | false      | 5.00     | 5.00       | 2.00         | 0.00           | 12.00  |
      | 10        | 200         | true       | 5.00     | 5.00       | 2.00         | 3.00           | 15.00  |
      | 0         | 0           | false      | 5.00     | 0.00       | 0.00         | 0.00           | 5.00   |
      | 1.5       | 0           | false      | 5.00     | 0.75       | 0.00         | 0.00           | 5.75   |
      | 0         | 150         | false      | 5.00     | 0.00       | 1.50         | 0.00           | 6.50   |
      | 100       | 5000        | false      | 5.00     | 50.00      | 50.00        | 0.00           | 105.00 |


  # ------------------------------------------------------------
  # Edge Cases – Boundary Values
  # ------------------------------------------------------------

  Scenario: Zero weight and zero distance — only base fee applies
    Given a package weighing 0 kg
    And a delivery distance of 0 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the total shipping cost should be $5.00
    And the fee breakdown should include a weight_fee of $0.00
    And the fee breakdown should include a distance_fee of $0.00

  Scenario: Zero weight and zero distance — fragile only adds surcharge
    Given a package weighing 0 kg
    And a delivery distance of 0 km
    And the package is fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the total shipping cost should be $8.00

  Scenario: Fractional weight is calculated correctly
    Given a package weighing 1.5 kg
    And a delivery distance of 0 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the fee breakdown should include a weight_fee of $0.75
    And the total shipping cost should be $5.75

  Scenario: Fractional distance is calculated correctly
    Given a package weighing 0 kg
    And a delivery distance of 150 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the fee breakdown should include a distance_fee of $1.50
    And the total shipping cost should be $6.50

  Scenario: Distance that is exactly a multiple of 100 km
    Given a package weighing 0 kg
    And a delivery distance of 100 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the fee breakdown should include a distance_fee of $1.00
    And the total shipping cost should be $6.00

  Scenario: Very small fractional weight produces correct total rounding
    Given a package weighing 0.1 kg
    And a delivery distance of 0 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the total shipping cost should be $5.05

  Scenario: Large weight and large distance without overflow
    Given a package weighing 1000 kg
    And a delivery distance of 10000 km
    And the package is fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the total shipping cost should be $608.00

  Scenario: Currency is always USD regardless of input values
    Given a package weighing 5 kg
    And a delivery distance of 100 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the response currency should be "USD"


  # ------------------------------------------------------------
  # Input Validation – Missing Fields
  # ------------------------------------------------------------

  Scenario: Missing weight_kg returns a validation error
    Given a delivery distance of 300 km
    And the package is not fragile
    But no weight_kg is provided
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "weight_kg is required"

  Scenario: Missing distance_km returns a validation error
    Given a package weighing 2 kg
    And the package is not fragile
    But no distance_km is provided
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "distance_km is required"

  Scenario: Missing is_fragile returns a validation error
    Given a package weighing 2 kg
    And a delivery distance of 300 km
    But no is_fragile is provided
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "is_fragile is required"

  Scenario: Completely empty request body returns three validation errors
    Given an empty request body
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain exactly 3 errors
    And the error details should contain "weight_kg is required"
    And the error details should contain "distance_km is required"
    And the error details should contain "is_fragile is required"


  # ------------------------------------------------------------
  # Input Validation – Wrong Types
  # ------------------------------------------------------------

  Scenario: String value for weight_kg returns a type validation error
    Given a weight_kg of "heavy"
    And a delivery distance of 300 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "weight_kg must be a number"

  Scenario: String value for distance_km returns a type validation error
    Given a package weighing 2 kg
    And a distance_km of "far"
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "distance_km must be a number"

  Scenario: String value for is_fragile returns a type validation error
    Given a package weighing 2 kg
    And a delivery distance of 300 km
    And an is_fragile value of "yes"
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "is_fragile must be a boolean"

  Scenario: Numeric 1 used instead of boolean true for is_fragile
    Given a package weighing 2 kg
    And a delivery distance of 300 km
    And an is_fragile value of 1
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "is_fragile must be a boolean"

  Scenario: Numeric 0 used instead of boolean false for is_fragile
    Given a package weighing 2 kg
    And a delivery distance of 300 km
    And an is_fragile value of 0
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "is_fragile must be a boolean"

  Scenario: NaN passed as weight_kg is rejected as not a number
    Given a weight_kg of NaN
    And a delivery distance of 300 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "weight_kg must be a number"

  Scenario: null weight_kg is treated as missing
    Given a weight_kg of null
    And a delivery distance of 300 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "weight_kg is required"


  # ------------------------------------------------------------
  # Input Validation – Out-of-Range Values
  # ------------------------------------------------------------

  Scenario: Negative weight_kg is rejected
    Given a package weighing -1 kg
    And a delivery distance of 300 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "weight_kg must be >= 0"

  Scenario: Negative distance_km is rejected
    Given a package weighing 2 kg
    And a delivery distance of -10 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "distance_km must be >= 0"

  Scenario: Multiple out-of-range fields return multiple errors
    Given a package weighing -5 kg
    And a delivery distance of -100 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "weight_kg must be >= 0"
    And the error details should contain "distance_km must be >= 0"


  # ------------------------------------------------------------
  # Input Validation – Multiple Simultaneous Errors
  # ------------------------------------------------------------

  Scenario: Wrong type for weight and missing is_fragile returns multiple errors
    Given a weight_kg of "heavy"
    And a delivery distance of 300 km
    But no is_fragile is provided
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain "weight_kg must be a number"
    And the error details should contain "is_fragile is required"

  Scenario: All three fields have wrong types — three errors returned
    Given a weight_kg of "heavy"
    And a distance_km of "far"
    And an is_fragile value of "yes"
    When I request a shipping cost calculation
    Then the response status should be 400
    And the error code should be "VALIDATION_ERROR"
    And the error details should contain exactly 3 errors


  # ------------------------------------------------------------
  # API Contract – Response Structure
  # ------------------------------------------------------------

  Scenario: Successful response always includes a breakdown object
    Given a package weighing 5 kg
    And a delivery distance of 200 km
    And the package is fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the response body should contain a "breakdown" object
    And the "breakdown" object should contain "base_fee"
    And the "breakdown" object should contain "weight_fee"
    And the "breakdown" object should contain "distance_fee"
    And the "breakdown" object should contain "fragile_surcharge"
    And the response body should contain a "total" field
    And the response body should contain a "currency" field

  Scenario: Error response always includes error code and details array
    Given an empty request body
    When I request a shipping cost calculation
    Then the response status should be 400
    And the response body should contain an "error" field
    And the response body should contain a "details" array

  Scenario: Total is rounded to two decimal places
    Given a package weighing 0.1 kg
    And a delivery distance of 33 km
    And the package is not fragile
    When I request a shipping cost calculation
    Then the response status should be 200
    And the total shipping cost should have at most 2 decimal places
