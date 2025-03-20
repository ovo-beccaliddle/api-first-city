#!/bin/bash

# Script to set up environment files for all services

set -e

# Base directory
BASE_DIR=$(dirname "$0")
cd $BASE_DIR

echo "🔧 Setting up environment files for API-First City Services..."

# Copy root .env file if it doesn't exist
if [ ! -f ".env" ]; then
  echo "Creating root .env file..."
  cp .env.example .env
fi

# Array of service directories that need .env files
SERVICES=(
  "infrastructure/iam"
  "infrastructure/service-registry"
  "infrastructure/event-bus"
  "services/sample"
)

# Load environment variables from root .env
echo "Loading environment variables from root .env..."
source .env

# Create .env files for each service - now making sure they use PORT=3000 internally
for SERVICE in "${SERVICES[@]}"; do
  if [ -f "$SERVICE/.env.example" ]; then
    echo "Creating .env file for $SERVICE..."
    cp "$SERVICE/.env.example" "$SERVICE/.env"
    
    # Ensure PORT is set to 3000 for internal container use
    sed -i.bak 's/^PORT=.*/PORT=3000/' "$SERVICE/.env"
    
    # Update port configuration based on root .env
    case "$SERVICE" in
      "infrastructure/iam")
        # For IAM service
        sed -i.bak "s/^EXTERNAL_PORT=.*/EXTERNAL_PORT=${IAM_PORT:-3001}/" "$SERVICE/.env"
        ;;
      "infrastructure/service-registry")
        # For Service Registry
        sed -i.bak "s/^EXTERNAL_PORT=.*/EXTERNAL_PORT=${SERVICE_REGISTRY_PORT:-3002}/" "$SERVICE/.env"
        ;;
      "infrastructure/event-bus")
        # For Event Bus (if needed)
        if [ -n "$PUBSUB_EMULATOR_PORT" ]; then
          sed -i.bak "s/^PUBSUB_EMULATOR_PORT=.*/PUBSUB_EMULATOR_PORT=${PUBSUB_EMULATOR_PORT:-8085}/" "$SERVICE/.env"
        fi
        ;;
      "services/sample")
        # For Sample Service
        sed -i.bak "s/^EXTERNAL_PORT=.*/EXTERNAL_PORT=${SAMPLE_SERVICE_PORT:-3010}/" "$SERVICE/.env"
        ;;
    esac
    
    # Remove backup files
    rm -f "$SERVICE/.env.bak"
  fi
done

echo "✅ Environment setup complete!"
echo "You can customize service ports in the root .env file."
echo "For a consistent experience when using 'yarn dev', ports are synchronized from the root .env file." 