#!/bin/bash

# This script builds all services in the monorepo using Turborepo

set -e

# Move to the project root
cd "$(dirname "$0")/../../"
REPO_ROOT=$(pwd)

echo "🚀 Building all services using Turborepo..."

# Run Turborepo build first
echo "📦 Running monorepo build..."
yarn turbo run build
BUILD_STATUS=$?

if [ $BUILD_STATUS -ne 0 ]; then
  echo "❌ Turborepo build failed"
  exit 1
fi

echo "✅ Turborepo build completed successfully"

# Check if Docker is available
if ! command -v docker &> /dev/null; then
  echo "❌ Docker is not installed. Please install Docker to build images."
  exit 1
fi

# Run the Docker build script
echo "🐳 Building Docker images..."
node deployment/scripts/docker-build.js

echo "🎉 All services built successfully!" 