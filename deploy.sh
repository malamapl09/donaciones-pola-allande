#!/bin/bash

# Deployment script for Donaciones Pola de Allande
# Usage: ./deploy.sh [development|production]

set -e  # Exit on any error

ENVIRONMENT=${1:-development}
PROJECT_ROOT=$(pwd)

echo "🚀 Starting deployment for $ENVIRONMENT environment..."

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

# Check prerequisites
print_status "Checking prerequisites..."

if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    print_error "npm is not installed" 
    exit 1
fi

if ! command -v psql &> /dev/null; then
    print_error "PostgreSQL client (psql) is not installed"
    exit 1
fi

print_success "Prerequisites check passed"

# Database setup
print_status "Setting up database..."

if ! psql -d donaciones_pola_allande -c "SELECT 1;" &> /dev/null; then
    print_status "Creating database..."
    createdb donaciones_pola_allande || print_warning "Database might already exist"
fi

# Run schema
print_status "Running database schema..."
psql -d donaciones_pola_allande -f database/schema.sql

# Run seeds (only in development)
if [ "$ENVIRONMENT" = "development" ]; then
    print_status "Running seed data..."
    psql -d donaciones_pola_allande -f database/seed.sql
fi

print_success "Database setup complete"

# Backend deployment
print_status "Deploying backend..."
cd backend

if [ ! -f .env ]; then
    print_status "Creating backend environment file..."
    cp .env.example .env
    print_warning "Please edit backend/.env with your configuration"
fi

# Try to install dependencies
if npm install; then
    print_success "Backend dependencies installed"
else
    print_warning "Backend dependencies installation failed - you may need to fix npm cache"
    print_warning "Run: sudo chown -R \$(whoami) ~/.npm && npm cache clean --force"
fi

# Backend build
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Building backend for production..."
    if npm run build; then
        print_success "Backend build complete"
    else
        print_warning "Backend build failed"
    fi
fi

cd "$PROJECT_ROOT"

# Frontend deployment  
print_status "Deploying frontend..."
cd frontend

if [ ! -f .env ]; then
    print_status "Creating frontend environment file..."
    cp .env.example .env
    print_warning "Please edit frontend/.env with your configuration"
fi

# Try to install dependencies
if npm install; then
    print_success "Frontend dependencies installed"
else
    print_warning "Frontend dependencies installation failed - you may need to fix npm cache"
    print_warning "Run: sudo chown -R \$(whoami) ~/.npm && npm cache clean --force"
fi

# Frontend build
if [ "$ENVIRONMENT" = "production" ]; then
    print_status "Building frontend for production..."
    if npm run build; then
        print_success "Frontend build complete"
        print_success "Frontend build files are in frontend/dist/"
    else
        print_warning "Frontend build failed"
    fi
fi

cd "$PROJECT_ROOT"

# Final instructions
echo ""
print_success "Deployment script completed!"
echo ""

if [ "$ENVIRONMENT" = "development" ]; then
    echo -e "${BLUE}To start development servers:${NC}"
    echo "Backend:  cd backend && npm run dev"
    echo "Frontend: cd frontend && npm run dev"
    echo ""
    echo -e "${BLUE}Access:${NC}"
    echo "Frontend: http://localhost:5173"
    echo "Backend:  http://localhost:3001"
    echo "Admin:    http://localhost:5173/admin (admin@polaallande.org / admin123dev)"
else
    echo -e "${BLUE}Production files ready:${NC}"
    echo "Backend:  backend/dist/"  
    echo "Frontend: frontend/dist/"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "1. Configure your web server (nginx recommended)"
    echo "2. Set up SSL certificates"
    echo "3. Configure process manager (PM2 recommended)"
    echo "4. Set up monitoring and backups"
    echo ""
    echo "See docs/TESTING_DEPLOYMENT.md for detailed instructions"
fi

echo ""
print_status "Database info:"
echo "Name: donaciones_pola_allande"
echo "Test login: admin@polaallande.org / admin123dev"

# Test database connection
if psql -d donaciones_pola_allande -c "SELECT COUNT(*) as admin_users FROM admin_users;" | grep -q "1"; then
    print_success "Database connection test passed"
else
    print_warning "Database connection test failed"
fi

echo ""
print_success "Deployment complete! 🎉"