# Testing Your City Service Implementation

Your city service is now fully implemented with models, repositories, services, controllers, and registry integration. But before we can celebrate, we need to make sure everything works as expected. Testing is a critical part of the API-first approach, ensuring that your implementation adheres to your API contract.

## Why Testing Matters

Testing your service implementation offers several benefits:

- **Contract validation**: Ensures your service behaves according to the API contract
- **Bug detection**: Catches issues before they affect other services or users
- **Regression prevention**: Makes sure new changes don't break existing functionality
- **Documentation**: Tests serve as living documentation of how your service should behave
- **Confidence**: Gives you and other services' developers confidence in your implementation

## Types of Tests for Your Service

We'll explore different types of tests for your city service:

### 1. API Contract Testing

This validates that your implementation adheres to the OpenAPI specification.

### 2. Functional Testing

This verifies that the service's business logic works correctly.

### 3. Integration Testing

This checks that your service works correctly with other services.

## Testing Your API Contract

The first level of testing is ensuring your implementation follows your API contract. The OpenAPI validator middleware you've already set up helps with this at runtime, but let's also create some explicit tests.

### 1. Set Up Testing Environment

First, let's add some testing tools to your project:

```bash
cd services/your-service-name
npm install --save-dev jest supertest @types/jest @types/supertest ts-jest
```

### 2. Configure Jest

Create a Jest configuration file:

```bash
touch jest.config.js
```

Add the following configuration:

```javascript
// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts'],
  verbose: true
};
```

Add test scripts to your package.json:

```json
"scripts": {
  "start": "ts-node src/index.ts",
  "build": "tsc",
  "test": "jest",
  "test:watch": "jest --watch"
}
```

### 3. Create API Contract Tests

Create a directory for your tests:

```bash
mkdir -p services/your-service-name/src/__tests__
```

Now, let's create a test file for your API endpoints. Here's an example for the patrol controller:

```typescript
// src/__tests__/patrol-api.test.ts
import request from 'supertest';
import express from 'express';
import { json } from 'body-parser';
import patrolController from '../controllers/patrol-controller';
import { OpenAPIValidator } from 'express-openapi-validator';
import { join } from 'path';
import errorHandler from '../middleware/error-handler';

// Create a test app
const app = express();
app.use(json());

// OpenAPI validation middleware
app.use(
  OpenAPIValidator.middleware({
    apiSpec: join(__dirname, '../../api/openapi.yaml'),
    validateRequests: true,
    validateResponses: true
  })
);

// Register the controller
app.use('/patrols', patrolController);

// Error handling middleware
app.use(errorHandler);

describe('Patrol API', () => {
  // Test GET /patrols
  test('GET /patrols should return an array of patrols', async () => {
    const response = await request(app).get('/patrols');
    
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    
    // If we have data, validate the structure of a patrol
    if (response.body.length > 0) {
      const patrol = response.body[0];
      expect(patrol).toHaveProperty('id');
      expect(patrol).toHaveProperty('location');
      expect(patrol.location).toHaveProperty('latitude');
      expect(patrol.location).toHaveProperty('longitude');
      expect(patrol).toHaveProperty('type');
      expect(patrol).toHaveProperty('status');
    }
  });
  
  // Test GET /patrols/:id
  test('GET /patrols/:id should return a single patrol', async () => {
    // First get all patrols to find a valid ID
    const allResponse = await request(app).get('/patrols');
    
    if (allResponse.body.length === 0) {
      // Skip this test if no patrols exist
      console.log('No patrols found, skipping test');
      return;
    }
    
    const patrolId = allResponse.body[0].id;
    const response = await request(app).get(`/patrols/${patrolId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', patrolId);
  });
  
  // Test GET /patrols/:id with invalid ID
  test('GET /patrols/:id with invalid ID should return 404', async () => {
    const response = await request(app).get('/patrols/invalid-id');
    
    expect(response.status).toBe(404);
  });
  
  // Test POST /patrols
  test('POST /patrols should create a new patrol', async () => {
    const newPatrol = {
      type: 'CAR',
      location: {
        latitude: 40.7128,
        longitude: -74.0060
      },
      officerCount: 2,
      status: 'AVAILABLE'
    };
    
    const response = await request(app)
      .post('/patrols')
      .send(newPatrol)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('type', newPatrol.type);
    expect(response.body).toHaveProperty('status', newPatrol.status);
    expect(response.body.location).toEqual(newPatrol.location);
  });
  
  // Test POST /patrols with invalid data
  test('POST /patrols with invalid data should return 400', async () => {
    const invalidPatrol = {
      // Missing required fields
      type: 'CAR'
    };
    
    const response = await request(app)
      .post('/patrols')
      .send(invalidPatrol)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    
    expect(response.status).toBe(400);
  });
  
  // Test PUT /patrols/:id/location
  test('PUT /patrols/:id/location should update a patrol\'s location', async () => {
    // First get all patrols to find a valid ID
    const allResponse = await request(app).get('/patrols');
    
    if (allResponse.body.length === 0) {
      // Skip this test if no patrols exist
      console.log('No patrols found, skipping test');
      return;
    }
    
    const patrolId = allResponse.body[0].id;
    const newLocation = {
      latitude: 40.7129,
      longitude: -74.0061
    };
    
    const response = await request(app)
      .put(`/patrols/${patrolId}/location`)
      .send(newLocation)
      .set('Accept', 'application/json')
      .set('Content-Type', 'application/json');
    
    expect(response.status).toBe(200);
    expect(response.body.location).toEqual(newLocation);
  });
  
  // Additional tests for other endpoints...
});
```

### 4. Run Your Tests

Run your API contract tests:

```bash
npm test
```

## Testing Business Logic

Next, let's test the business logic in your service layer. This ensures that your service behaves correctly according to your business rules.

### Create Service Tests

Create a test file for your service:

```typescript
// src/__tests__/patrol-service.test.ts
import { PatrolService } from '../services/patrol-service';
import { PatrolRepository } from '../repositories/patrol-repository';
import { PatrolStatus, PatrolType } from '../models/patrol';

// Mock the repository
jest.mock('../repositories/patrol-repository');

describe('PatrolService', () => {
  beforeEach(() => {
    // Clear all mocks between tests
    jest.clearAllMocks();
  });
  
  // Test getting all patrols
  test('getAllPatrols should return all patrols from repository', () => {
    // Arrange
    const mockPatrols = [
      { id: '1', type: PatrolType.CAR, status: PatrolStatus.AVAILABLE, location: { latitude: 1, longitude: 1 }, officerCount: 2 },
      { id: '2', type: PatrolType.BIKE, status: PatrolStatus.BUSY, location: { latitude: 2, longitude: 2 }, officerCount: 1 }
    ];
    
    // Set up the mock
    (PatrolRepository.findAll as jest.Mock).mockReturnValue(mockPatrols);
    
    // Act
    const result = PatrolService.getAllPatrols();
    
    // Assert
    expect(PatrolRepository.findAll).toHaveBeenCalled();
    expect(result).toEqual(mockPatrols);
  });
  
  // Test creating a patrol
  test('createPatrol should validate officer count for car patrols', () => {
    // Arrange
    const invalidPatrol = {
      type: PatrolType.CAR,
      status: PatrolStatus.AVAILABLE,
      location: { latitude: 1, longitude: 1 },
      officerCount: 1 // Invalid: Car patrols need at least 2 officers
    };
    
    // Act & Assert
    expect(() => PatrolService.createPatrol(invalidPatrol)).toThrow();
    expect(PatrolRepository.create).not.toHaveBeenCalled();
  });
  
  test('createPatrol should set default status if not provided', () => {
    // Arrange
    const patrolWithoutStatus = {
      type: PatrolType.BIKE,
      location: { latitude: 1, longitude: 1 },
      officerCount: 1
    };
    
    const expectedPatrolWithStatus = {
      ...patrolWithoutStatus,
      status: PatrolStatus.AVAILABLE
    };
    
    const createdPatrol = {
      id: '123',
      ...expectedPatrolWithStatus
    };
    
    // Set up the mock
    (PatrolRepository.create as jest.Mock).mockReturnValue(createdPatrol);
    
    // Act
    const result = PatrolService.createPatrol(patrolWithoutStatus);
    
    // Assert
    expect(PatrolRepository.create).toHaveBeenCalledWith(expectedPatrolWithStatus);
    expect(result).toEqual(createdPatrol);
  });
  
  // Test assigning a patrol to a call
  test('assignToCall should update patrol status and set active call', () => {
    // Arrange
    const patrolId = '123';
    const callId = '456';
    
    const availablePatrol = {
      id: patrolId,
      type: PatrolType.CAR,
      status: PatrolStatus.AVAILABLE,
      location: { latitude: 1, longitude: 1 },
      officerCount: 2
    };
    
    const updatedPatrol = {
      ...availablePatrol,
      status: PatrolStatus.BUSY,
      activeCall: callId
    };
    
    // Set up the mocks
    (PatrolRepository.findById as jest.Mock).mockReturnValue(availablePatrol);
    (PatrolRepository.update as jest.Mock).mockReturnValue(updatedPatrol);
    
    // Act
    const result = PatrolService.assignToCall(patrolId, callId);
    
    // Assert
    expect(PatrolRepository.findById).toHaveBeenCalledWith(patrolId);
    expect(PatrolRepository.update).toHaveBeenCalledWith(patrolId, {
      status: PatrolStatus.BUSY,
      activeCall: callId
    });
    expect(result).toEqual(updatedPatrol);
  });
  
  test('assignToCall should not assign unavailable patrol', () => {
    // Arrange
    const patrolId = '123';
    const callId = '456';
    
    const busyPatrol = {
      id: patrolId,
      type: PatrolType.CAR,
      status: PatrolStatus.BUSY,
      location: { latitude: 1, longitude: 1 },
      officerCount: 2,
      activeCall: '789'
    };
    
    // Set up the mock
    (PatrolRepository.findById as jest.Mock).mockReturnValue(busyPatrol);
    
    // Act
    const result = PatrolService.assignToCall(patrolId, callId);
    
    // Assert
    expect(PatrolRepository.findById).toHaveBeenCalledWith(patrolId);
    expect(PatrolRepository.update).not.toHaveBeenCalled();
    expect(result).toBeUndefined();
  });
  
  // Additional tests for other service methods...
});
```

## Integration Testing with the Registry

Finally, let's test that your service properly registers with the city registry and can communicate with other services.

### Create Registry Integration Tests

```typescript
// src/__tests__/registry-integration.test.ts
import axios from 'axios';
import { registryClient } from '../clients/registry-client';
import { ServiceDiscovery } from '../utils/service-discovery';

// Mock axios
jest.mock('axios');

describe('Registry Integration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  // Test service registration
  test('registryClient.register should register service with the registry', async () => {
    // Arrange
    (axios.post as jest.Mock).mockResolvedValue({ status: 200, data: { success: true } });
    
    // Act
    const result = await registryClient.register();
    
    // Assert
    expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/register'), expect.any(Object));
    expect(result).toBe(true);
  });
  
  // Test service discovery
  test('ServiceDiscovery.findService should find a service by name', async () => {
    // Arrange
    const serviceName = 'test-service';
    const mockService = {
      name: serviceName,
      url: 'http://localhost:3001',
      status: 'ONLINE'
    };
    
    // Mock the registry client's getServiceByName method
    jest.spyOn(registryClient, 'getServiceByName').mockResolvedValue(mockService);
    
    // Act
    const result = await ServiceDiscovery.findService(serviceName);
    
    // Assert
    expect(registryClient.getServiceByName).toHaveBeenCalledWith(serviceName);
    expect(result).toEqual(mockService);
  });
  
  // Test calling another service
  test('ServiceDiscovery.callService should call another service\'s API', async () => {
    // Arrange
    const serviceName = 'test-service';
    const endpoint = '/api/test';
    const mockService = {
      name: serviceName,
      url: 'http://localhost:3001',
      status: 'ONLINE'
    };
    const mockResponse = { data: { result: 'success' } };
    
    // Mock the service discovery and axios
    jest.spyOn(ServiceDiscovery, 'findService').mockResolvedValue(mockService);
    (axios.get as jest.Mock).mockResolvedValue(mockResponse);
    
    // Act
    const result = await ServiceDiscovery.callService(serviceName, endpoint);
    
    // Assert
    expect(ServiceDiscovery.findService).toHaveBeenCalledWith(serviceName);
    expect(axios.get).toHaveBeenCalledWith(`${mockService.url}${endpoint}`);
    expect(result).toEqual(mockResponse.data);
  });
  
  test('ServiceDiscovery.callService should return null if service not found', async () => {
    // Arrange
    const serviceName = 'nonexistent-service';
    const endpoint = '/api/test';
    
    // Mock the service discovery to return null (service not found)
    jest.spyOn(ServiceDiscovery, 'findService').mockResolvedValue(null);
    
    // Act
    const result = await ServiceDiscovery.callService(serviceName, endpoint);
    
    // Assert
    expect(ServiceDiscovery.findService).toHaveBeenCalledWith(serviceName);
    expect(axios.get).not.toHaveBeenCalled();
    expect(result).toBeNull();
  });
});
```

## Manual Testing

Besides automated tests, it's also important to manually test your service. Here are some tests you can run:

### 1. Start Your Service and Test Endpoints

Start your service:

```bash
cd services/your-service-name
npm start
```

Use curl, Postman, or your browser to test your endpoints:

```bash
# Get all patrols
curl http://localhost:3000/patrols

# Create a new patrol
curl -X POST http://localhost:3000/patrols \
  -H "Content-Type: application/json" \
  -d '{"type": "CAR", "location": {"latitude": 40.7128, "longitude": -74.0060}, "officerCount": 2, "status": "AVAILABLE"}'

# Get available patrols
curl http://localhost:3000/patrols/available
```

### 2. Validate OpenAPI Documentation

Open your API documentation in the browser:

```
http://localhost:3000/api-docs
```

Check that it accurately represents your service capabilities.

### 3. Test Registry Integration

Start the city registry service:

```bash
cd city-registry
npm start
```

Then start your service and check if it registers:

```bash
cd services/your-service-name
npm start
```

Check the registry to see if your service appears:

```bash
curl http://localhost:4000/services
```

### 4. Test Integration with Other Services

If you have other city services running, test that they can discover and communicate with your service through the registry.

## Bonus: Continuous Integration

For a more robust testing approach, consider setting up continuous integration:

1. Create a `.github/workflows/ci.yml` file (if using GitHub Actions)
2. Configure it to run your tests on each push or pull request
3. Add steps to build and test your service

This ensures that your tests are run automatically, catching issues early.

## Conclusion

Congratulations! You've now built a full-featured city service following the API-first approach and validated it with comprehensive tests. Your service:

1. Follows a well-defined OpenAPI contract
2. Implements clean separation of concerns with models, repositories, services, and controllers
3. Registers with the city service registry for discoverability
4. Has been validated with automated tests to ensure it works correctly

This provides a solid foundation for your service to operate reliably within the city services ecosystem. In the next exercise, we'll explore how to implement more advanced patterns for service-to-service communication.

Ready to continue? Head over to [Exercise 3: Connecting City Services Together](./03-connecting-services.md) 