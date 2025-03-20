#!/bin/bash
set -e

# Color output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Store test path if provided
TEST_PATH=$1

# Function to cleanup resources
cleanup() {
  echo -e "${YELLOW}Cleaning up resources...${NC}"
  
  # Always attempt to teardown the test database
  ./scripts/teardown-test-db.sh || true
  
  echo -e "${GREEN}Cleanup complete${NC}"
}

# Set up trap to ensure cleanup happens even on failure
trap cleanup EXIT INT TERM

# Set up the test database
echo -e "${GREEN}Setting up test database...${NC}"
./scripts/setup-test-db.sh

# Export environment variables for tests
export DB_HOST=localhost
export DB_PORT=5433
export DB_USERNAME=postgres
export DB_PASSWORD=postgres
export DB_DATABASE=sample_service_test

# Run the tests with the appropriate path and increased timeout
echo -e "${GREEN}Running tests...${NC}"
if [ -z "$TEST_PATH" ]; then
  # Run all tests if no path provided
  yarn test --mode test
else
  # Run tests in the specified path
  yarn test "$TEST_PATH" --mode test
fi

# Note: cleanup will happen automatically via the trap 