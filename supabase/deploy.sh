#!/bin/bash
# ================================================
# Fintutto Edge Functions Deployment Script
# ================================================
#
# Voraussetzungen:
# 1. Supabase CLI installiert: npm install -g supabase
# 2. Login: supabase login
# 3. Link: supabase link --project-ref aaefocdqgdgexkcrjhks
#
# Secrets setzen (einmalig):
#   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
#   supabase secrets set SOVENDUS_WEBHOOK_SECRET=your_secret_here
#
# Dann dieses Script ausfuehren:
#   chmod +x supabase/deploy.sh
#   ./supabase/deploy.sh
#
# ================================================

set -e

echo "=== Fintutto Edge Functions Deployment ==="
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

FUNCTIONS=(
  "billing"
  "setupStripeBundles"
  "affiliatePartnerEngine"
  "sovendusTracking"
  "sovendusPostback"
  "abTestEngine"
  "ecosystemBundlePricing"
  "ecosystemCrossSell"
  "setupDatabase"
)

echo -e "${BLUE}Deploying ${#FUNCTIONS[@]} Edge Functions...${NC}"
echo ""

SUCCESS=0
FAILED=0

for func in "${FUNCTIONS[@]}"; do
  echo -n "  Deploying $func... "
  if supabase functions deploy "$func" --no-verify-jwt 2>/dev/null; then
    echo -e "${GREEN}OK${NC}"
    ((SUCCESS++))
  else
    echo "FAILED"
    ((FAILED++))
  fi
done

echo ""
echo "=== Ergebnis ==="
echo -e "  ${GREEN}Erfolgreich: $SUCCESS${NC}"
if [ $FAILED -gt 0 ]; then
  echo "  Fehlgeschlagen: $FAILED"
fi
echo ""

echo "=== Naechste Schritte ==="
echo "1. Secrets pruefen:"
echo "   supabase secrets list"
echo ""
echo "2. Stripe Bundles einrichten:"
echo "   curl -X POST https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/setupStripeBundles \\"
echo "     -H 'Authorization: Bearer YOUR_SERVICE_ROLE_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"action\": \"setup_bundles\"}'"
echo ""
echo "3. Partner-Daten laden:"
echo "   curl -X POST https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/setupDatabase \\"
echo "     -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"action\": \"seed_partners\"}'"
echo ""
echo "4. A/B-Tests konfigurieren:"
echo "   curl -X POST https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/setupDatabase \\"
echo "     -H 'Authorization: Bearer YOUR_ANON_KEY' \\"
echo "     -H 'Content-Type: application/json' \\"
echo "     -d '{\"action\": \"seed_ab_tests\"}'"
echo ""
echo "5. Sovendus Postback-URL im Sovendus Dashboard hinterlegen:"
echo "   https://aaefocdqgdgexkcrjhks.supabase.co/functions/v1/sovendusPostback"
echo ""
echo "=== Fertig! ==="
