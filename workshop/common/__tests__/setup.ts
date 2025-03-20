// Global test setup
import { vi } from 'vitest';

// Mock firebase-admin
vi.mock('firebase-admin/app', () => {
  return {
    initializeApp: vi.fn().mockReturnValue({}),
    cert: vi.fn().mockReturnValue({}),
  };
});

// Mock firebase-admin/remote-config
vi.mock('firebase-admin/remote-config', () => {
  return {
    getRemoteConfig: vi.fn().mockReturnValue({
      getTemplate: vi.fn().mockResolvedValue({
        parameters: {
          'test.key': {
            defaultValue: {
              text: 'test-value',
            },
          },
          'workshop.test.key': {
            defaultValue: {
              text: 'workshop-test-value',
            },
          },
          'team-01.test.key': {
            defaultValue: {
              text: 'team-test-value',
            },
          },
          'team-01.sample-service.test.key': {
            defaultValue: {
              text: 'team-service-test-value',
            },
          },
          'json.key': {
            defaultValue: {
              text: '{"foo":"bar"}',
            },
          },
          'boolean.key': {
            defaultValue: {
              text: 'true',
            },
          },
          'number.key': {
            defaultValue: {
              text: '42',
            },
          },
        },
      }),
    }),
  };
});

// Mock Logger from the logging module
vi.mock('../logging', () => {
  return {
    Logger: vi.fn().mockImplementation(() => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
      debug: vi.fn(),
    })),
  };
});
