# API First Workshop: City Services Technical Implementation Guide

## Overview

This document outlines the comprehensive implementation plan for the "API First" workshop using a City Services metaphor. The workshop is designed to provide hands-on experience for both Engineering and Product teams in applying API-first principles to develop cohesive, well-designed APIs that function as products.

The technical implementation will serve as the foundation for the workshop, enabling participants to engage with concrete examples while learning abstract principles of API-first development.

## Workshop Structure

The workshop runs for approximately 240 minutes, broken down into several key sections:

1. **Requirements & Design (100 mins)**

   - Introduction to API First principles
   - Designing APIs as Products
   - Collaborative exercises for both Engineering and Product teams

2. **Implementation & Lifecycle (100 mins)**

   - Building for Change
   - Testing strategies
   - Versioning and compatibility
   - Monitoring and feedback loops

3. **Open Space (90 mins)** - For exploration and questions

## City Services Metaphor

The workshop uses a city metaphor to illustrate the concept of connected but independent services:

- Different city departments represent distinct APIs/services
- City infrastructure represents shared components and patterns
- Citizens represent API consumers with varying needs
- City planning represents the API-first approach

This metaphor provides an intuitive understanding of domain boundaries while offering opportunities for exploring service interactions.

## Technical Implementation Requirements

### Project Structure

The technical implementation will be a modular monorepo with the following structure:

```
city-services/
├── infrastructure/
│   ├── api-gateway/
│   └── service-registry/
├── common/
│   ├── models/
│   │   ├── sample/
│   │   ├── (...)police/
│   │   ├── (...)fire/
│   │   ├── (...)ambulance/
│   ├── errors/
│   │   ├── sample/
│   │   ├── (...)police/
│   │   ├── (...)fire/
│   │   ├── (...)ambulance/
│   ├── logging/
│   │   ├── sample/
│   │   ├── (...)police/
│   │   ├── (...)fire/
│   │   ├── (...)ambulance/
│   └── testing/
│   │   ├── sample/
│   │   ├── (...)police/
│   │   ├── (...)fire/
│   │   ├── (...)ambulance/
├── services/
│   │   ├── sample/
│   │   ├── emergency-services/
│   │   │   ├── (...)police/
│   │   │   ├── (...)fire/
│   │   │   └── (...)ambulance/
│   │   ├── utilities/
│   │   │   └── (...)water/
│   │   │   └── (...)electric/
│   │   │   └── (...)waste/
│   │   └── transportation/
│   │       ├── traffic/
│   │       └── public-transit/
│   └── citizen-services/
│       ├── requests/
│       └── permits/
└── docs/
```

### Technology Stack

The base technology stack should be accessible to a wide range of developers while demonstrating best practices:

1. **Core Technologies**

   - Node.js (v20+) with TypeScript
   - Express.js for API implementation
   - OpenAPI 3.0 for contract definition
   - Jest for testing
   - Docker for containerization
   - k3d for deployment

2. **Supporting Tools**
   - Swagger UI for API documentation and exploration
   - Prism for API mocking
   - ESLint and Prettier for code quality
   - GitHub Actions or similar for CI/CD examples

### Service Templates

Each service will follow a consistent pattern to reinforce best practices:

```
service-name/
├── api/
│   ├── openapi.yaml       # API contract definition
│   └── examples/          # Request/response examples
├── src/
│   ├── controllers/       # Route handlers
│   ├── services/          # Business logic
│   ├── models/            # Domain models
│   ├── repositories/      # Data access
│   └── middleware/        # Custom middleware
├── tests/
│   ├── unit/
│   ├── integration/
│   └── contract/          # Contract tests
├── Dockerfile
└── package.json
```

### Core API Design Patterns to Demonstrate

The implementation should showcase these essential API-first patterns:

1. **Contract-First Development**

   - OpenAPI specifications written before implementation
   - Generated API documentation
   - Contract validation middleware

2. **Resource Modeling**

   - RESTful resource design
   - Clear resource relationships
   - Consistent naming conventions

3. **Versioning Strategy**

   - URL or header-based versioning examples
   - Backward compatibility pattern
   - API deprecation approach

4. **Error Handling**

   - Standardized error format
   - Meaningful error codes
   - Comprehensive error documentation

5. **Security Patterns**

   - Authentication mechanisms
   - Authorization models
   - API key management

6. **Pagination and Filtering**

   - Cursor or offset-based pagination
   - Filtering parameters
   - Sorting options

7. **Testing Strategies**
   - Unit testing controllers and services
   - Integration testing APIs
   - Contract testing between services

## Example Services in Detail

### Emergency Services: Police Department

This example service will be fully implemented to demonstrate the complete pattern:

#### OpenAPI Definition (police/api/openapi.yaml)

```yaml
openapi: 3.0.0
info:
  title: Police Department API
  version: 1.0.0
  description: API for city police department services
paths:
  /incidents:
    get:
      summary: List incidents
      parameters:
        - name: status
          in: query
          schema:
            type: string
            enum: [reported, in-progress, resolved]
        - name: neighborhood
          in: query
          schema:
            type: string
      responses:
        200:
          description: List of incidents
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: "#/components/schemas/Incident"
    post:
      summary: Report a new incident
      requestBody:
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/IncidentReport"
      responses:
        201:
          description: Incident created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/Incident"
components:
  schemas:
    Incident:
      type: object
      properties:
        id:
          type: string
          format: uuid
        type:
          type: string
          enum: [theft, vandalism, noise, traffic, other]
        location:
          $ref: "#/components/schemas/Location"
        status:
          type: string
          enum: [reported, in-progress, resolved]
        reportedAt:
          type: string
          format: date-time
        description:
          type: string
      required:
        - id
        - type
        - location
        - status
        - reportedAt
    IncidentReport:
      type: object
      properties:
        type:
          type: string
          enum: [theft, vandalism, noise, traffic, other]
        location:
          $ref: "#/components/schemas/Location"
        description:
          type: string
      required:
        - type
        - location
    Location:
      type: object
      properties:
        address:
          type: string
        neighborhood:
          type: string
        coordinates:
          type: object
          properties:
            latitude:
              type: number
              format: float
            longitude:
              type: number
              format: float
          required:
            - latitude
            - longitude
      required:
        - address
        - neighborhood
```

#### Implementation Highlights

The implementation will demonstrate:

1. **Separation of Concerns**

   - Controllers handle request/response formatting
   - Services implement business logic
   - Repositories manage data access

2. **Integration with Other Services**

   - Example of calling Emergency Services API
   - Event publication for cross-service notifications

3. **Testing Examples**
   - Unit tests for business logic
   - API tests validating against the OpenAPI spec
   - Mock integration tests for third-party dependencies

## Service Implementation Framework

Rather than specifying the exact implementation details for each potential city service, the workshop will provide a framework that allows teams to develop their assigned service within the city ecosystem. Each team will work from a base sample service that can be extended according to the needs of their particular city department.

### Sample Service Template

The sample service provides a fully-functional foundation that demonstrates key API-first principles. Participants will:

1. Clone or generate a new service based on this sample
2. Adapt it to fit their assigned city department
3. Define domain-specific resources and operations
4. Implement required business logic
5. Connect with relevant services in the city ecosystem

Realistically, as the tasks are designed to be thin, a majority of these "mappings" will be designed up front (the inter-service communications) - but with a good enough pattern, these can be reproduced.

### City Service Categories

Teams will be assigned to different categories of city services, each with their own domain focus but following consistent API-first principles:

1. **Emergency Services**

   - Police, Fire, Ambulance
   - Focus on incident response and management
   - Event-driven communication patterns

2. **Utilities**

   - Water, Electric, Waste Management
   - Focus on resource monitoring and management
   - Versioning and evolution patterns

3. **Transportation**

   - Traffic Management, Public Transit
   - Focus on real-time data and status updates
   - Integration with other city services

4. **Citizen Services**
   - Permit Applications, Service Requests
   - Focus on workflow and status tracking
   - Authentication and authorization patterns

### Service Integration Patterns

The workshop will emphasize several integration patterns that connect the various city services:

1. **Event-Based Communication**

   - Services publish events when significant state changes occur
   - Interested services subscribe to relevant events
   - Example: Police publishes "incident reported" events that Traffic Management consumes

2. **Direct API Calls**

   - Services call other service APIs when immediate information is needed
   - Standard patterns for error handling and retry logic
   - Example: Citizen Services calls Utilities APIs to check service availability

3. **Shared Resources**
   - Common domain objects used across multiple services
   - Consistent naming and structure
   - Example: Location information used by multiple city services

## BONUS: City Dashboard: Workshop Finale

A central component of the workshop is the City Dashboard, which provides a visual representation of all the services built by participants. This dashboard creates a compelling finale that demonstrates how individual services combine to form a functioning ecosystem.

### Dashboard Functionality

The City Dashboard provides:

1. **Service Discovery and Visualization**

   - Automatic detection of running services
   - Visual representation of each service on a city map
   - "Lighting up" parts of the city as services come online

2. **Service Health and Status**

   - Real-time health checks for all services
   - Status indicators for key functionality
   - Visual alerts for service issues

3. **Inter-Service Communication Visualization**

   - Visual representation of API calls between services
   - Event publication and subscription flows
   - Data movement throughout the city

4. **Documentation Access**
   - Centralized access to all service API documentation
   - Ability to explore available endpoints
   - Testing interface for service APIs

### Network Infrastructure Requirements

For the City Dashboard to provide a seamless experience, the workshop requires a dedicated network environment:

1. **Dedicated Workshop Network**

   - SSID: "CityAPI-Workshop" with simple password access
   - Isolated network segment (192.168.100.0/24) with DHCP enabled
   - Local DNS server configured to resolve `.city.local` domain
   - Multicast DNS (mDNS) traffic allowed for service discovery

2. **Zero-Configuration Service Discovery**

   - Automatic service registration with the dashboard
   - No manual configuration required by participants
   - Services become visible on the dashboard within seconds of starting

3. **Central Dashboard Access**
   - Dashboard accessible via `city-hall.city.local`
   - Services accessible via `[service-name].service.city.local`
   - Consistent DNS resolution throughout the workshop

### Participant Experience

From a participant perspective, the dashboard experience unfolds as follows:

1. Connect to the workshop WiFi network
2. Implement their assigned service using the provided template
3. Start their service locally on their machine
4. Watch as their service automatically appears on the central dashboard
5. Observe interactions with other city services as they come online
6. Experience the final "fully illuminated city" as all services become operational

## Workshop Implementation Plan

### Pre-Workshop Preparation

1. **Technical Environment Setup**

   - Prepare the base repository with sample service
   - Configure the network infrastructure
   - Set up the City Dashboard
   - Test end-to-end functionality

2. **Participant Materials**

   - Create workshop guides with step-by-step instructions
   - Prepare service-specific briefs for each team
   - Document API design patterns and best practices
   - Provide troubleshooting guides

3. **Facilitator Preparation**
   - Train facilitators on the technical implementation
   - Prepare discussion guides for key concepts
   - Create checkpoint criteria for progress tracking
   - Develop contingency plans for technical issues

### Workshop Delivery Flow

The technical implementation supports the workshop flow as follows:

1. **Introduction and Setup (30 mins)**

   - Overview of API-first principles
   - Introduction to the City Services metaphor
   - Environment setup and verification
   - Team assignments and service briefs

2. **Requirements and Design Phase (70 mins)**

   - Analysis of existing service APIs
   - Domain modeling for assigned service
   - API contract design using OpenAPI
   - Review and validation of contracts

3. **Implementation Phase (70 mins)**

   - Service implementation based on API contract
   - Unit and integration testing
   - Connection with other city services
   - Documentation and example creation

4. **Integration and Testing Phase (30 mins)**

   - End-to-end testing across services
   - Dashboard verification and visualization
   - Cross-service scenario testing
   - Performance and error handling verification

5. **Workshop Finale (30 mins)**
   - Demonstration of the fully connected city
   - Discussion of API-first benefits observed
   - Exploration of the completed ecosystem
   - Lessons learned and next steps

### Technical Success Criteria

To ensure a successful workshop experience, the implementation should meet these criteria:

1. **Simplicity and Accessibility**

   - Participants can get started with minimal setup
   - Templates provide clear starting points
   - Documentation is comprehensible to all skill levels

2. **Reliability and Robustness**

   - Services can run independently
   - Failures in one service don't crash the entire ecosystem
   - Recovery mechanisms for common issues

3. **Visibility and Feedback**

   - Clear indicators of successful implementation
   - Immediate feedback when integrations work
   - Visual representation of the entire ecosystem

4. **Educational Value**
   - Clear examples of API-first principles
   - Multiple patterns demonstrated across services
   - Opportunities to learn from both success and failure

## Participant Prerequisites

To ensure a smooth workshop experience, participants should have:

1. **Technical Requirements**

   - Laptop with Node.js (v20+) installed (but also there should be an included "install via nvm one liner" ), Typescript
   - Git client
   - Docker Desktop
   - VSCode or preferred IDE

2. **Knowledge Prerequisites**

   - Basic JavaScript/TypeScript experience
   - Familiarity with REST APIs
   - Understanding of HTTP concepts

3. **Team Composition**
   - Mix of engineering and product roles
   - Variety of experience levels
   - Distribution of domain knowledge
