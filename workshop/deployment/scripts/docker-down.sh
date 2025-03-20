#!/bin/bash

# Change to deployment directory (where this script is located)
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
DEPLOYMENT_DIR="$( cd "$SCRIPT_DIR/.." && pwd )"

# Go to deployment directory
cd "$DEPLOYMENT_DIR"

# Run docker-compose down
docker-compose down "$@"

echo "All services have been stopped" 