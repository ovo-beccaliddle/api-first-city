#!/bin/bash
set -e

# Configuration
TEST_CONTAINER_NAME="sample-test-postgres"
TEST_DB_NAME="sample_service_test"
TEST_DB_PORT=5433  # Using a different port than default to avoid conflicts
TEST_DB_USER="postgres"
TEST_DB_PASSWORD="postgres"

# Color output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Setting up test database environment...${NC}"

# Check if the container is already running and remove it
if [ "$(docker ps -q -f name=$TEST_CONTAINER_NAME)" ]; then
    echo "Removing existing test database container..."
    docker stop $TEST_CONTAINER_NAME
    docker rm $TEST_CONTAINER_NAME
fi

# Start a PostgreSQL container
echo "Starting PostgreSQL container for testing..."
docker run --name $TEST_CONTAINER_NAME \
    -e POSTGRES_PASSWORD=$TEST_DB_PASSWORD \
    -e POSTGRES_USER=$TEST_DB_USER \
    -e POSTGRES_DB=$TEST_DB_NAME \
    -p $TEST_DB_PORT:5432 \
    -d postgres:16-alpine

# Wait for PostgreSQL to be ready
echo "Waiting for PostgreSQL to start..."
sleep 2
max_attempts=30
attempt=0
while ! docker exec $TEST_CONTAINER_NAME pg_isready -U $TEST_DB_USER > /dev/null 2>&1; do
    attempt=$((attempt+1))
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}Failed to connect to PostgreSQL after $max_attempts attempts${NC}"
        exit 1
    fi
    echo "Waiting for PostgreSQL to be ready... attempt $attempt/$max_attempts"
    sleep 1
done

echo -e "${GREEN}Test database is ready!${NC}"

# Export environment variables for the test database
export DB_HOST=localhost
export DB_PORT=$TEST_DB_PORT
export DB_USERNAME=$TEST_DB_USER
export DB_PASSWORD=$TEST_DB_PASSWORD
export DB_DATABASE=$TEST_DB_NAME

# Create an env file that the tests can source
cat > .env.test << EOF
DB_HOST=localhost
DB_PORT=$TEST_DB_PORT
DB_USERNAME=$TEST_DB_USER
DB_PASSWORD=$TEST_DB_PASSWORD
DB_DATABASE=$TEST_DB_NAME
EOF

echo -e "${GREEN}Environment variables set for testing:${NC}"
echo "DB_HOST=localhost"
echo "DB_PORT=$TEST_DB_PORT"
echo "DB_USERNAME=$TEST_DB_USER"
echo "DB_PASSWORD=$TEST_DB_PASSWORD"
echo "DB_DATABASE=$TEST_DB_NAME" 