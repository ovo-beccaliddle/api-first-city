# API Gateway Infrastructure

This directory contains the infrastructure configuration for the Gravitee API Gateway used in the City Services platform, focused on PostgreSQL integration.

## Setup

### PostgreSQL JDBC Driver Setup

Before building the Docker images, you need to download the PostgreSQL JDBC driver:

```bash
./download-jdbc-driver.sh
```

This script will download the PostgreSQL JDBC driver (postgresql-42.7.4.jar) to the current directory.

### Building and Starting the Gateway

After downloading the JDBC driver, build and start the API Gateway infrastructure:

```bash
docker-compose -f docker-compose-apim.yml up -d --build
```

The `--build` flag ensures that the custom Docker images for the gateway and management API are built with the PostgreSQL JDBC driver installed.

If you need to rebuild the images after making changes:

```bash
docker-compose -f docker-compose-apim.yml build --no-cache
docker-compose -f docker-compose-apim.yml up -d
```

## Configuration

The API Gateway is configured to use PostgreSQL as its data store. The configuration is defined in:

1. `config.yaml` - Contains gateway configuration and PostgreSQL connection settings
2. `docker-compose-apim.yml` - Defines PostgreSQL, API Gateway, and Management API services
3. `Dockerfile.gateway` and `Dockerfile.management-api` - Custom Dockerfiles that copy the PostgreSQL JDBC driver into the images

### PostgreSQL Configuration

The PostgreSQL database is configured with the following parameters:

- Database: gravitee
- Username: postgres
- Password: postgres
- Port: 5432

## Simplified Services

The API Gateway infrastructure has been simplified to include only the essential services:

- PostgreSQL - Data storage for API Gateway and Management API
- API Gateway - Handles API requests (with built-in JDBC driver)
- Management API - Backend for administration (with built-in JDBC driver)

Other services (MongoDB, Elasticsearch, Management UI, Portal UI) have been commented out to focus on the core gateway and PostgreSQL integration.
