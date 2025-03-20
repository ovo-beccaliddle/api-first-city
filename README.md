# API First City Services

This is a monorepo for the API First City Services Workshop, powered by Turborepo for efficient builds and workflows.

## Viewing the course content

In your root, run `yarn serve:workshop`

Navigate to <http://localhost:8080/>

## RUN DATABSE

```bash

docker run -d \        --name some-postgres \
        -p 5433:5432 -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=sample_service  \
        -e PGDATA=/var/lib/postgresql/data/pgdata \
        postgres

        ```

## Project Structure

The project follows a monorepo structure with Turborepo:

```
api-first-city/
├── turbo.json                # Turborepo configuration
├── package.json              # Root package.json
├── TODO.md                   # Implementation todo list
├── workshop/                 # Main workshop folder
│   ├── common/               # Shared code across all services
│   ├── infrastructure/       # Core infrastructure services
│   │   ├── api-gateway/      # API Gateway (Gravitee)
│   │   ├── iam/              # Identity and Access Management
│   │   ├── service-registry/ # Service discovery
│   │   └── event-bus/        # Event bus setup
│   ├── services/             # City services
│   │   ├── sample/           # Complete sample service
│   │   └── templates/        # Templates for other services
│   ├── deployment/           # Deployment configuration
│   │   ├── docker-compose.yml# Local development setup
│   │   ├── kubernetes/       # K8s deployment manifests
│   │   └── scripts/          # Setup and utility scripts
│   └── exercises/            # Workshop exercises
```

## Getting Started

### Prerequisites

- Node.js (v20+)
- Yarn (v1.22+)
- Docker & Docker Compose
- kubectl (for Kubernetes deployment)
- k3d (for local Kubernetes)

### Setup

Run the following scripts to prepare the workshop environment:

```bash
yarn # Installs dependencies
yarn dev # Runs dev using turbo
```

This script will:

1. Check prerequisites
2. Install dependencies
3. Build common packages
4. Validate API specifications
5. Build Docker images

## Available Scripts

Thanks to Turborepo, you can run various commands across all packages:

- `yarn build` - Build all packages
- `yarn dev` - Start development mode for all services
- `yarn lint` - Lint all packages
- `yarn test` - Run tests for all packages
- `yarn clean` - Clean build artifacts
- `yarn start` - Start all services in production mode
- `yarn deploy` - Build, test, and deploy all services
- `yarn run-all` - Run all core services concurrently in development mode