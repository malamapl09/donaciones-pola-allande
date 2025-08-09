#!/bin/bash

# AWS Environment Variables Generator
# Generates the environment variables needed for Amplify deployment

echo "🔐 AWS Environment Variables Generator"
echo "===================================="
echo ""

# Generate secure secrets
JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || echo "MANUAL_GENERATE_NEEDED")
ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || python3 -c "import secrets; print(secrets.token_urlsafe(32))" 2>/dev/null || echo "MANUAL_GENERATE_NEEDED")
ADMIN_PASSWORD=$(openssl rand -base64 16 2>/dev/null || python3 -c "import secrets; print(secrets.token_urlsafe(16))" 2>/dev/null || echo "MANUAL_GENERATE_NEEDED")

echo "📝 Environment Variables for AWS Amplify Console"
echo "Copy these to: App Settings → Environment variables"
echo ""
echo "=== BACKEND VARIABLES ==="
echo "NODE_ENV=production"
echo "PORT=3001"
echo "DATABASE_URL=postgresql://donaciones_admin:[YOUR_RDS_PASSWORD]@[YOUR_RDS_ENDPOINT]:5432/donaciones_pola_allande"
echo "JWT_SECRET=$JWT_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo "FRONTEND_URL=https://[YOUR_AMPLIFY_DOMAIN].amplifyapp.com"
echo "BANK_NAME=Banco Santander"
echo "BANK_ACCOUNT_NUMBER=ES21 1234 5678 9012 3456 7890"
echo "BANK_ACCOUNT_HOLDER=Asociación Cultural Pola de Allande"
echo "BANK_SWIFT_CODE=BSCHESMM"
echo "ADMIN_EMAIL=admin@polaallande.org"
echo "ADMIN_PASSWORD=$ADMIN_PASSWORD"
echo "GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX"
echo "DEBUG=false"
echo ""
echo "=== FRONTEND VARIABLES ==="
echo "VITE_API_URL=https://[YOUR_AMPLIFY_DOMAIN].amplifyapp.com/api"
echo "VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX"
echo "VITE_NODE_ENV=production"
echo ""
echo "🔑 IMPORTANT: Save these secrets securely!"
echo "   JWT_SECRET: $JWT_SECRET"
echo "   ENCRYPTION_KEY: $ENCRYPTION_KEY"
echo "   ADMIN_PASSWORD: $ADMIN_PASSWORD"
echo ""
echo "📝 TODO: Replace the following placeholders:"
echo "   [YOUR_RDS_PASSWORD] - Your RDS database password"
echo "   [YOUR_RDS_ENDPOINT] - Your RDS endpoint URL"
echo "   [YOUR_AMPLIFY_DOMAIN] - Your Amplify app domain"
echo "   G-XXXXXXXXXX - Your Google Analytics measurement ID"