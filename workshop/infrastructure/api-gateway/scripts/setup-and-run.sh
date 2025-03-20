#!/bin/bash

# Download PostgreSQL JDBC driver
echo "Step 1: Downloading PostgreSQL JDBC driver..."
curl -L https://jdbc.postgresql.org/download/postgresql-42.7.4.jar -o postgresql-42.7.4.jar
if [ ! -f postgresql-42.7.4.jar ]; then
    echo "Failed to download PostgreSQL JDBC driver!"
    exit 1
fi
echo "PostgreSQL JDBC driver downloaded successfully."

# Build and start the containers
echo "Step 2: Building and starting containers..."
docker compose -f docker-compose-apim.yml up -d --build

# Check if containers are running
echo "Step 3: Checking container status..."
sleep 10
docker compose -f docker-compose-apim.yml ps

echo "Setup completed. API Gateway should be running now."
echo "PostgreSQL is available at localhost:5432"
echo "API Gateway is available at localhost:8082"
echo "Management API is available at localhost:8083" 