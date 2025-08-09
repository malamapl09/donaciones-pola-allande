#!/bin/bash

# Database setup script for Donaciones Pola de Allande
# Usage: ./setup.sh [database_name] [username]

DB_NAME=${1:-"donaciones_pola"}
DB_USER=${2:-"postgres"}

echo "Setting up database: $DB_NAME"
echo "User: $DB_USER"

# Create database
echo "Creating database..."
createdb -U $DB_USER $DB_NAME

# Apply schema
echo "Applying schema..."
psql -U $DB_USER -d $DB_NAME -f schema.sql

# Apply seed data
echo "Inserting seed data..."
psql -U $DB_USER -d $DB_NAME -f seed.sql

echo "Database setup completed!"
echo "Connection string: postgresql://$DB_USER@localhost:5432/$DB_NAME"