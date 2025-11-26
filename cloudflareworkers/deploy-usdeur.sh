#!/bin/bash
# Deployment script for USD/EUR Exchange Rate Worker
# This script sets all required secrets and deploys the worker

echo "🚀 Deploying USD/EUR Exchange Rate Worker..."
echo ""

# Read values from .dev.vars
if [ ! -f .dev.vars ]; then
    echo "❌ Error: .dev.vars file not found!"
    exit 1
fi

echo "📋 Setting secrets from .dev.vars..."
echo ""

# Extract values from .dev.vars
BQ_PROJECT_ID=$(grep "^BQ_PROJECT_ID=" .dev.vars | cut -d'=' -f2)
GS_CLIENT_EMAIL=$(grep "^GS_CLIENT_EMAIL=" .dev.vars | cut -d'=' -f2)
GS_PRIVATE_KEY=$(grep "^GS_PRIVATE_KEY=" .dev.vars | cut -d'=' -f2- | sed 's/^-----BEGIN/-----BEGIN/')
BQ_LOCATION=$(grep "^BQ_LOCATION=" .dev.vars | cut -d'=' -f2)

# Set BQ_DATASET to "utils" for this worker (override .dev.vars value)
BQ_DATASET="utils"

echo "Setting BQ_PROJECT_ID..."
echo "$BQ_PROJECT_ID" | wrangler secret put BQ_PROJECT_ID --config wrangler-usdeur.toml

echo "Setting BQ_DATASET to 'utils'..."
echo "$BQ_DATASET" | wrangler secret put BQ_DATASET --config wrangler-usdeur.toml

echo "Setting GS_CLIENT_EMAIL..."
echo "$GS_CLIENT_EMAIL" | wrangler secret put GS_CLIENT_EMAIL --config wrangler-usdeur.toml

echo "Setting GS_PRIVATE_KEY..."
echo "$GS_PRIVATE_KEY" | wrangler secret put GS_PRIVATE_KEY --config wrangler-usdeur.toml

echo "Setting BQ_LOCATION..."
echo "$BQ_LOCATION" | wrangler secret put BQ_LOCATION --config wrangler-usdeur.toml

echo ""
echo "✅ All secrets set!"
echo ""
echo "📦 Deploying worker..."
wrangler deploy --config wrangler-usdeur.toml

echo ""
echo "✅ Deployment complete!"
echo ""
echo "🧪 Test the worker:"
echo "   curl https://usdeur-exchange-rate.YOUR_SUBDOMAIN.workers.dev/"
echo ""
echo "📊 The worker will:"
echo "   - Fetch all USD/EUR rates for the current year"
echo "   - Save to BigQuery: level-hope-462409-a8.utils.usdeur"
echo "   - Run daily at 02:00 UTC via cron"

