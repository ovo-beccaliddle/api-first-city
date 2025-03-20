import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidationError } from '@city-services/common';
import { ResourceStatus } from '../../generated/types.gen';

// Import directly from the generated directory to use the real schemas
import * as zod from '../../generated/zod.gen';

// Create test suite for validating resources using Zod schemas from generated files
describe('Resource Schema Validation', () => {
  describe('Resource Creation Schema', () => {
    it('should validate a valid resource creation payload', async () => {
      // Setup valid creation payload
      const validPayload = {
        name: 'Test Resource',
        description: 'Test Description',
        status: ResourceStatus.ACTIVE,
        tags: ['test', 'validation']
      };
      
      // Use the real Zod schema for validation
      const result = await zod.zResourceCreate.parseAsync(validPayload);
      
      // Assertions
      expect(result).toEqual(validPayload);
    });

    it('should reject an invalid resource creation payload', async () => {
      // Setup invalid payload (missing required name)
      const invalidPayload = {
        status: ResourceStatus.ACTIVE
      };
      
      // Validate using the real schema and expect it to throw
      await expect(zod.zResourceCreate.parseAsync(invalidPayload))
        .rejects.toThrow();
    });
  });

  describe('Resource Update Schema', () => {
    it('should validate a valid resource update payload', async () => {
      // Setup valid update payload
      const validPayload = {
        name: 'Updated Resource',
        description: 'Updated Description',
        status: ResourceStatus.INACTIVE
      };
      
      // Use the real Zod schema for validation
      const result = await zod.zResourceUpdate.parseAsync(validPayload);
      
      // Assertions
      expect(result).toEqual(validPayload);
    });

    it('should reject an invalid resource update payload', async () => {
      // Setup invalid payload (invalid status)
      const invalidPayload = {
        status: 'invalid-status' // Not a valid ResourceStatus
      };
      
      // Validate using the real schema and expect it to throw
      await expect(zod.zResourceUpdate.parseAsync(invalidPayload))
        .rejects.toThrow();
    });
  });

  describe('ValidationError', () => {
    it('should create a proper ValidationError object', () => {
      const error = new ValidationError({ 
        path: 'name', 
        message: 'Name is required' 
      });
      
      expect(error).toBeInstanceOf(ValidationError);
      expect(error.name).toBe('ValidationError');
      expect(error.statusCode).toBe(400);
      expect(error.details).toEqual({ path: 'name', message: 'Name is required' });
    });
  });
}); 