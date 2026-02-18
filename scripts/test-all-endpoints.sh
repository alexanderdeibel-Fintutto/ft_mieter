#!/bin/bash
# =============================================================================
# Fintutto Ecosystem - Comprehensive Endpoint Test Script
# =============================================================================
# Tests all Edge Functions: Bundle Pricing, Affiliate Partners, A/B Tests,
# Cross-Sell, Sovendus Tracking, and Billing.
#
# Usage: ./scripts/test-all-endpoints.sh
# =============================================================================

set -e

BASE_URL="https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3NjA0NzAsImV4cCI6MjA4NDMzNjQ3MH0.qsLTEZo7shbafWY9w4Fo7is9GDW-1Af1wup_iCy2vVQ"
SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFhZWZvY2RxZ2RnZXhrY3JqaGtzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc2MDQ3MCwiZXhwIjoyMDg0MzM2NDcwfQ.cUzSAWSOXSkVkbXewXPaZS-CvdptCx5mE8kjXJnT6Ok"

PASS=0
FAIL=0
TOTAL=0

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
  echo ""
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${BLUE}  $1${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

run_test() {
  local name="$1"
  local endpoint="$2"
  local auth_header="$3"
  local payload="$4"
  local expected_field="$5"

  TOTAL=$((TOTAL + 1))
  echo -n "  [$TOTAL] $name ... "

  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "${BASE_URL}/${endpoint}" \
    -H "apikey: ${ANON_KEY}" \
    -H "Content-Type: application/json" \
    ${auth_header:+-H "Authorization: Bearer ${auth_header}"} \
    -d "${payload}" 2>/dev/null)

  local http_code
  http_code=$(echo "$response" | tail -n1)
  local body
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
    if echo "$body" | grep -q "\"${expected_field}\""; then
      echo -e "${GREEN}PASS${NC} (HTTP $http_code)"
      PASS=$((PASS + 1))
      # Print abbreviated response
      echo "      $(echo "$body" | head -c 200)..."
    else
      echo -e "${RED}FAIL${NC} (HTTP $http_code, missing '$expected_field')"
      FAIL=$((FAIL + 1))
      echo "      Response: $(echo "$body" | head -c 300)"
    fi
  else
    echo -e "${RED}FAIL${NC} (HTTP $http_code)"
    FAIL=$((FAIL + 1))
    echo "      Error: $(echo "$body" | head -c 300)"
  fi
}

echo ""
echo -e "${YELLOW}Fintutto Ecosystem - Endpoint Test Suite${NC}"
echo -e "${YELLOW}$(date)${NC}"

# =============================================================================
# 1. ECOSYSTEM BUNDLE PRICING
# =============================================================================
print_header "1. ECOSYSTEM BUNDLE PRICING"

run_test "Get all bundles (mieterapp context)" \
  "ecosystemBundlePricing" "" \
  '{"action":"get_bundles","current_app":"mieterapp"}' \
  "success"

run_test "Get all bundles (vermietify context)" \
  "ecosystemBundlePricing" "" \
  '{"action":"get_bundles","current_app":"vermietify"}' \
  "bundles"

run_test "Get bundle recommendation" \
  "ecosystemBundlePricing" "" \
  '{"action":"get_bundle_recommendation","current_app":"mieterapp"}' \
  "recommendation"

run_test "Create bundle checkout (mieter_plus monthly)" \
  "ecosystemBundlePricing" "${SERVICE_KEY}" \
  '{"action":"create_bundle_checkout","bundle_id":"mieter_plus","billing_cycle":"monthly"}' \
  "checkout_url"

run_test "Create bundle checkout (vermieter_komplett yearly)" \
  "ecosystemBundlePricing" "${SERVICE_KEY}" \
  '{"action":"create_bundle_checkout","bundle_id":"vermieter_komplett","billing_cycle":"yearly"}' \
  "checkout_url"

run_test "Create bundle checkout (fintutto_komplett monthly)" \
  "ecosystemBundlePricing" "${SERVICE_KEY}" \
  '{"action":"create_bundle_checkout","bundle_id":"fintutto_komplett","billing_cycle":"monthly"}' \
  "checkout_url"

run_test "Invalid bundle ID" \
  "ecosystemBundlePricing" "" \
  '{"action":"create_bundle_checkout","bundle_id":"nonexistent"}' \
  "error"

# =============================================================================
# 2. AFFILIATE PARTNER ENGINE
# =============================================================================
print_header "2. AFFILIATE PARTNER ENGINE"

run_test "Get all offers (mieter, dashboard)" \
  "affiliatePartnerEngine" "" \
  '{"action":"get_offers","user_role":"mieter","context":"dashboard"}' \
  "offers"

run_test "Get offers (vermieter, reparatur)" \
  "affiliatePartnerEngine" "" \
  '{"action":"get_offers","user_role":"vermieter","context":"reparatur"}' \
  "offers"

run_test "Get offers filtered by category (energie)" \
  "affiliatePartnerEngine" "" \
  '{"action":"get_offers","category":"energie","user_role":"mieter"}' \
  "offers"

run_test "Get offers filtered by category (handwerk)" \
  "affiliatePartnerEngine" "" \
  '{"action":"get_offers","category":"handwerk","user_role":"vermieter"}' \
  "offers"

run_test "Track affiliate click" \
  "affiliatePartnerEngine" "" \
  '{"action":"track_click","partner_id":"verivox_strom","partner_name":"Verivox","category":"energie","source_page":"dashboard"}' \
  "click_id"

run_test "Get revenue analytics (30d)" \
  "affiliatePartnerEngine" "" \
  '{"action":"get_revenue_analytics","period":"30d"}' \
  "analytics"

# =============================================================================
# 3. A/B TEST ENGINE
# =============================================================================
print_header "3. A/B TEST ENGINE"

run_test "List all A/B tests" \
  "abTestEngine" "${SERVICE_KEY}" \
  '{"action":"list_tests"}' \
  "tests"

run_test "Get variant for pricing_display test" \
  "abTestEngine" "${SERVICE_KEY}" \
  '{"action":"get_variant","test_id":"pricing_display"}' \
  "variant"

run_test "Get variant for affiliate_placement test" \
  "abTestEngine" "${SERVICE_KEY}" \
  '{"action":"get_variant","test_id":"affiliate_placement"}' \
  "variant"

run_test "Get all variants at once" \
  "abTestEngine" "${SERVICE_KEY}" \
  '{"action":"get_all_variants","test_ids":["pricing_display","affiliate_placement","cross_sell_timing","bundle_highlight"]}' \
  "variants"

run_test "Get test results for pricing_display" \
  "abTestEngine" "${SERVICE_KEY}" \
  '{"action":"get_results","test_id":"pricing_display"}' \
  "results"

# =============================================================================
# 4. ECOSYSTEM CROSS-SELL
# =============================================================================
print_header "4. ECOSYSTEM CROSS-SELL"

run_test "Cross-sell: mieterapp -> meter_reading" \
  "ecosystemCrossSell" "" \
  '{"action":"get_recommendation","source_app":"mieterapp","event_type":"meter_reading"}' \
  "show_recommendation"

run_test "Cross-sell: vermietify -> repair_created" \
  "ecosystemCrossSell" "" \
  '{"action":"get_recommendation","source_app":"vermietify","event_type":"repair_created"}' \
  "show_recommendation"

run_test "Cross-sell: vermietify -> nk_abrechnung_started" \
  "ecosystemCrossSell" "" \
  '{"action":"get_recommendation","source_app":"vermietify","event_type":"nk_abrechnung_started"}' \
  "target_app"

run_test "Cross-sell: ablesung -> readings_exported" \
  "ecosystemCrossSell" "" \
  '{"action":"get_recommendation","source_app":"ablesung","event_type":"readings_exported"}' \
  "target_app"

run_test "Cross-sell: no match (invalid event)" \
  "ecosystemCrossSell" "" \
  '{"action":"get_recommendation","source_app":"mieterapp","event_type":"nonexistent_event"}' \
  "no_matching_rules"

run_test "Get ecosystem stats" \
  "ecosystemCrossSell" "" \
  '{"action":"get_ecosystem_stats"}' \
  "stats"

# =============================================================================
# 5. SOVENDUS TRACKING
# =============================================================================
print_header "5. SOVENDUS TRACKING"

run_test "Track Sovendus impression" \
  "sovendusTracking" "" \
  '{"action":"track_event","event_type":"impression","trigger":"checkout_success","app_id":"mieterapp"}' \
  "success"

run_test "Track Sovendus click" \
  "sovendusTracking" "" \
  '{"action":"track_event","event_type":"click","trigger":"checkout_success","partner_name":"TestPartner","app_id":"mieterapp"}' \
  "success"

run_test "Get Sovendus analytics" \
  "sovendusTracking" "" \
  '{"action":"get_analytics","app_id":"mieterapp"}' \
  "analytics"

# =============================================================================
# 6. BILLING (Standard Plans)
# =============================================================================
print_header "6. BILLING (Standard Plans)"

run_test "List active Stripe prices" \
  "billing" "${SERVICE_KEY}" \
  '{"action":"listPrices"}' \
  "prices"

# =============================================================================
# 7. SETUP / VERIFICATION
# =============================================================================
print_header "7. DATABASE VERIFICATION"

run_test "Verify all database tables" \
  "setupDatabase" "" \
  '{"action":"verify"}' \
  "tables"

run_test "List Stripe bundles" \
  "setupStripeBundles" "${SERVICE_KEY}" \
  '{"action":"list_bundles"}' \
  "bundles"

# =============================================================================
# SUMMARY
# =============================================================================
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  TEST SUMMARY${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "  Total:  ${TOTAL}"
echo -e "  ${GREEN}Passed: ${PASS}${NC}"
echo -e "  ${RED}Failed: ${FAIL}${NC}"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "  ${GREEN}ALL TESTS PASSED!${NC}"
  echo ""
  echo -e "  ${YELLOW}Next steps:${NC}"
  echo "    1. Open the app: npm run dev"
  echo "    2. Go to /EcosystemPricing - select a bundle"
  echo "    3. Use test card: 4242 4242 4242 4242"
  echo "    4. After checkout: verify /BillingSuccess shows Sovendus widget"
  echo "    5. Check /Dashboard for affiliate partner offers"
else
  echo -e "  ${RED}SOME TESTS FAILED - check output above${NC}"
fi
echo ""
