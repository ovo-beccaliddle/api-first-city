#!/bin/bash

# Setup script for k3d Kubernetes cluster for City Services Workshop

# Colors for console output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Print section header
print_section() {
  echo -e "\n${CYAN}=== $1 ===${NC}\n"
}

# Check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
print_section "Checking Prerequisites"

# Check for k3d
if ! command_exists k3d; then
  echo -e "${RED}k3d is not installed. Please install it:${NC}"
  echo -e "curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash"
  exit 1
else
  echo -e "${GREEN}✓ k3d is installed${NC}"
fi

# Check for kubectl
if ! command_exists kubectl; then
  echo -e "${RED}kubectl is not installed. Please install it:${NC}"
  echo -e "https://kubernetes.io/docs/tasks/tools/install-kubectl/"
  exit 1
else
  echo -e "${GREEN}✓ kubectl is installed${NC}"
fi

# Check for Docker
if ! command_exists docker; then
  echo -e "${RED}Docker is not installed. Please install it:${NC}"
  echo -e "https://docs.docker.com/get-docker/"
  exit 1
else
  echo -e "${GREEN}✓ Docker is installed${NC}"
fi

# Create k3d cluster
print_section "Creating k3d Cluster"

CLUSTER_NAME="city-services"

# Check if cluster already exists
if k3d cluster list | grep -q "$CLUSTER_NAME"; then
  echo -e "${YELLOW}Cluster '$CLUSTER_NAME' already exists.${NC}"
  
  read -p "Do you want to delete and recreate it? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "Deleting existing cluster..."
    k3d cluster delete "$CLUSTER_NAME"
  else
    echo -e "Keeping existing cluster."
  fi
fi

# Create a new cluster if it doesn't exist
if ! k3d cluster list | grep -q "$CLUSTER_NAME"; then
  echo -e "Creating k3d cluster '$CLUSTER_NAME'..."
  k3d cluster create "$CLUSTER_NAME" \
    --api-port 6550 \
    -p "8000:80@loadbalancer" \
    --agents 1
  
  echo -e "${GREEN}Cluster created successfully!${NC}"
fi

# Set kubectl context
print_section "Setting kubectl Context"
kubectl config use-context k3d-"$CLUSTER_NAME"

# Build Docker images
print_section "Building Docker Images"

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORKSHOP_DIR="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Build images using docker-compose
echo -e "${BLUE}Building Docker images...${NC}"
docker-compose -f "$SCRIPT_DIR/../docker-compose.yml" build

# Import images to k3d
print_section "Importing Images to k3d"
echo -e "${BLUE}Importing images to k3d...${NC}"

# List of services to import
SERVICES=("api-gateway" "iam-service" "service-registry" "sample-service")

for service in "${SERVICES[@]}"; do
  echo -e "${BLUE}Importing ${service}...${NC}"
  k3d image import "city-services-${service}:latest" -c city-services
done

# Apply Kubernetes manifests
print_section "Applying Kubernetes Manifests"
echo -e "${BLUE}Applying Kubernetes manifests...${NC}"

# Apply manifests
kubectl apply -f "$SCRIPT_DIR/../kubernetes/"

# Final instructions
print_section "Setup Complete"
echo -e "${GREEN}The City Services Kubernetes environment is now set up!${NC}"
echo
echo -e "To access the API Gateway: ${YELLOW}http://localhost:8000${NC}"
echo
echo -e "To view running pods: ${YELLOW}kubectl get pods${NC}"
echo -e "To view services: ${YELLOW}kubectl get services${NC}"
echo
echo -e "To tear down the environment: ${YELLOW}k3d cluster delete city-services${NC}" 