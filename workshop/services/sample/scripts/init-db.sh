#!/bin/bash

# Create main database if it doesn't exist
psql -U postgres -h localhost -p 5432 -c "SELECT 1 FROM pg_database WHERE datname = 'sample_service'" | grep -q 1 || psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE sample_service"

# Create test database if it doesn't exist
psql -U postgres -h localhost -p 5432 -c "SELECT 1 FROM pg_database WHERE datname = 'sample_service_test'" | grep -q 1 || psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE sample_service_test"

echo "Databases created successfully" 