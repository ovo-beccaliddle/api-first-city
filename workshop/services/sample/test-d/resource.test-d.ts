import { expectType, expectError, expectAssignable } from 'tsd';
import { ResourceStatus } from '../src/generated/types.gen';
import type { Resource, ResourceCreate, ResourceUpdate } from '../src/generated/types.gen';
import type { ResourceService } from '../src/services/resource-service';
import type { ResourceRepository } from '../src/repositories/resource-repository';

// Resource type tests
const validResource: Resource = {
  id: '123',
  name: 'Test Resource',
  description: 'A test resource',
  status: ResourceStatus.ACTIVE,
  tags: ['test'],
  createdAt: new Date(),
  updatedAt: new Date()
};

expectType<Resource>(validResource);

// Should error on missing required fields
expectError<Resource>({
  id: '123',
  name: 'Test Resource',
  status: ResourceStatus.ACTIVE,
  createdAt: new Date(),
  updatedAt: new Date()
});

// ResourceCreate type tests
const validResourceCreate: ResourceCreate = {
  name: 'New Resource',
  description: 'A new resource',
  status: ResourceStatus.ACTIVE,
  tags: ['new']
};

expectType<ResourceCreate>(validResourceCreate);

// Should error on extra fields
expectError<ResourceCreate>({
  name: 'New Resource',
  description: 'A new resource',
  // @ts-expect-error id should not be included in create
  id: '123' // id should not be included in create
});

// ResourceUpdate type tests
const validResourceUpdate: ResourceUpdate = {
  name: 'Updated Resource',
  description: 'An updated resource',
  status: ResourceStatus.INACTIVE
};

expectType<ResourceUpdate>(validResourceUpdate);

// Service interface tests
declare const resourceService: ResourceService;

// getResources should accept optional filters
expectType<Promise<{ items: Resource[]; total: number; page: number; page_size: number }>>(
  resourceService.getResources({})
);

expectType<Promise<{ items: Resource[]; total: number; page: number; page_size: number }>>(
  resourceService.getResources({ name: 'test' })
);

// getResourceById should require id
expectType<Promise<Resource>>(
  resourceService.getResourceById('123')
);

// createResource should accept ResourceCreate
expectType<Promise<Resource>>(
  resourceService.createResource(validResourceCreate)
);

// updateResource should accept id and ResourceUpdate
expectType<Promise<Resource>>(
  resourceService.updateResource('123', validResourceUpdate)
);

// deleteResource should accept id
expectType<Promise<void>>(
  resourceService.deleteResource('123')
);

// Repository interface tests
declare const resourceRepository: ResourceRepository;

// findAll should accept optional filters
expectType<Promise<{ items: Resource[]; total: number; page: number; page_size: number }>>(
  resourceRepository.findAll({})
);

expectType<Promise<{ items: Resource[]; total: number; page: number; page_size: number }>>(
  resourceRepository.findAll({ name: 'test' })
);

// findById should require id and may return null
expectType<Promise<Resource | null>>(
  resourceRepository.findById('123')
);

// create should accept ResourceCreate
expectType<Promise<Resource>>(
  resourceRepository.create(validResourceCreate)
);

// update should accept id and ResourceUpdate and may return null
expectType<Promise<Resource | null>>(
  resourceRepository.update('123', validResourceUpdate)
);

// delete should accept id and return boolean
expectType<Promise<boolean>>(
  resourceRepository.delete('123')
); 