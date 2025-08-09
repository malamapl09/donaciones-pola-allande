#!/bin/bash

# AWS Amplify Deployment Helper Script
# Helps prepare the project for AWS Amplify + RDS deployment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${BLUE}▶ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

echo "🚀 AWS Amplify Deployment Preparation"
echo "==================================="
echo ""

# Check if AWS CLI is installed
print_status "Checking AWS CLI availability..."
if command -v aws &> /dev/null; then
    AWS_VERSION=$(aws --version 2>&1 | cut -d/ -f2 | cut -d' ' -f1)
    print_success "AWS CLI v$AWS_VERSION found"
else
    print_warning "AWS CLI not found. You can install it later or use AWS Console"
fi

# Check production environment files
print_status "Checking production environment configuration..."

if [ ! -f "backend/.env.production" ]; then
    print_warning "Creating backend production environment template..."
    cp backend/.env.production.template backend/.env.production
    print_warning "Please edit backend/.env.production with your RDS connection details"
fi

if [ ! -f "frontend/.env.production" ]; then
    print_warning "Creating frontend production environment template..."
    cp frontend/.env.production.template frontend/.env.production
    print_warning "Please edit frontend/.env.production with your Amplify domain"
fi

# Generate secure secrets if needed
print_status "Checking security configuration..."

JWT_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "PLEASE_GENERATE_32_CHAR_JWT_SECRET")
ENCRYPTION_KEY=$(openssl rand -base64 32 2>/dev/null || echo "PLEASE_GENERATE_32_CHAR_ENCRYPTION_KEY")

echo "Generated secrets (save these for your environment variables):"
echo "JWT_SECRET=$JWT_SECRET"
echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
echo ""

# Test builds
print_status "Testing production builds..."

# Backend build test
print_status "Testing backend build..."
cd backend
if npm run build; then
    print_success "Backend builds successfully"
else
    print_error "Backend build failed - please fix before deploying"
    exit 1
fi
cd ..

# Frontend build test
print_status "Testing frontend build..."
cd frontend
if npm run build; then
    print_success "Frontend builds successfully"
    BUILD_SIZE=$(du -sh dist 2>/dev/null | cut -f1 || echo "unknown")
    print_success "Frontend build size: $BUILD_SIZE"
else
    print_error "Frontend build failed - please fix before deploying"
    exit 1
fi
cd ..

# Check required files for Amplify
print_status "Verifying Amplify deployment files..."

REQUIRED_FILES=(
    "amplify.yml"
    "backend/package.json"
    "frontend/package.json"
    "database/schema.sql"
    "database/seed.sql"
)

for file in "${REQUIRED_FILES[@]}"; do
    if [ -f "$file" ]; then
        print_success "$file ✓"
    else
        print_error "$file missing"
    fi
done

# Database preparation check
print_status "Database preparation checklist..."
echo "□ RDS PostgreSQL instance created"
echo "□ Security group configured (port 5432 open)"
echo "□ Database connection details saved"
echo "□ Schema and seed data uploaded to RDS"

# Final checklist
echo ""
print_status "Pre-deployment checklist:"
echo "□ AWS Account with billing set up"
echo "□ GitHub repository pushed with latest changes"
echo "□ RDS PostgreSQL database created and configured"
echo "□ Environment variables ready (see templates above)"
echo "□ Domain name purchased (optional)"
echo ""

print_success "Project ready for AWS Amplify deployment!"
echo ""
print_status "Next steps:"
echo "1. Create RDS PostgreSQL database in AWS Console"
echo "2. Update environment variables in backend/.env.production"
echo "3. Push code to GitHub"
echo "4. Deploy via AWS Amplify Console"
echo ""
print_status "See docs/AWS_AMPLIFY_DEPLOYMENT.md for detailed instructions"

# Deployment URLs
echo ""
print_status "Useful AWS Console URLs:"
echo "🗄️  RDS Console: https://console.aws.amazon.com/rds/"
echo "🚀 Amplify Console: https://console.aws.amazon.com/amplify/"
echo "📊 CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/"
echo ""

print_success "Ready to deploy to AWS! 🎉"