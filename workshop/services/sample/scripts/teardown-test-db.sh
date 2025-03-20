#!/bin/bash
set -e

# Configuration
TEST_CONTAINER_NAME="sample-test-postgres"

# Color output
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${GREEN}Tearing down test database environment...${NC}"

# Check if the container exists and remove it
if [ "$(docker ps -a -q -f name=$TEST_CONTAINER_NAME)" ]; then
    echo "Stopping and removing test database container..."
    docker stop $TEST_CONTAINER_NAME
    docker rm $TEST_CONTAINER_NAME
    echo -e "${GREEN}Test database container removed.${NC}"
else
    echo "No test database container found."
fi

# Clean up environment file
if [ -f .env.test ]; then
    echo "Removing temporary environment file..."
    rm .env.test
fi

echo -e "${GREEN}Test database environment has been cleaned up!${NC}" 