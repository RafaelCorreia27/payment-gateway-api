#!/usr/bin/env bash
# ============================================
# Script de teste da Payment Gateway API
# ============================================
# Uso: ./test-api.sh [BASE_URL]
# Exemplo: ./test-api.sh
#          ./test-api.sh http://localhost:3333
# ============================================

set -e

BASE_URL="${1:-http://localhost:3333}"

echo "🧪 Testando Payment Gateway API"
echo "================================"
echo ""

# 1. Rota raiz
echo "1️⃣  Testando rota raiz..."
root_code="000"
if root_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/" 2>/dev/null); then
  true
fi
if [ "$root_code" = "200" ]; then
  echo "✅ Rota raiz OK (HTTP $root_code)"
  curl -s "$BASE_URL/" | head -c 200
  echo ""
else
  echo "❌ Rota raiz falhou (HTTP $root_code)"
fi
echo ""

# 2. Login
echo "2️⃣  Fazendo login..."
login_response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@paymentgateway.com","password":"admin123"}')
login_code=$(echo "$login_response" | tail -n1)
body=$(echo "$login_response" | sed '$d')

if [ "$login_code" = "200" ]; then
  echo "✅ Login OK (HTTP $login_code)"
  echo "   Token recebido."
  echo "$body" | head -c 150
  echo "..."
else
  echo "❌ Login falhou"
  echo "   HTTP: $login_code"
  echo "   Resposta: $(echo "$body" | head -c 120)"
fi
echo ""

# Aviso se algo falhou
if [ "$root_code" != "200" ] || [ "$login_code" != "200" ]; then
  echo "⚠️  Verifique se as migrations e seeders foram executados:"
  echo "   docker compose exec app node ace.js migration:run          # (WORKDIR é /app/build)"
  echo "   docker compose exec app node /app/run-seed-standalone.js   # seed (sem Adonis/Ace)"
  echo ""
  echo "   Ou localmente:"
  echo "   node ace migration:run"
  echo "   node ace db:seed   # ou: node run-seed.js"
fi
