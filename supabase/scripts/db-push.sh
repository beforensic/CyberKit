#!/usr/bin/env bash
# Pousse les migrations Supabase vers le projet lié (CyberKit).
# Prérequis : npx + session Supabase CLI connectée (supabase login).

set -euo pipefail
cd "$(dirname "$0")/../.."

echo "→ Push migrations vers le projet lié..."
npx --yes supabase@2.101.0 db push --yes

echo "→ État des migrations :"
npx --yes supabase@2.101.0 migration list --linked
