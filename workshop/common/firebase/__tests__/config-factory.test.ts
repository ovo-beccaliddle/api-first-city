import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ConfigFactory } from '../config-factory';
import * as RemoteConfigModule from '../remote-config';

describe('ConfigFactory', () => {
  const localConfig = {
    'local.key': 'local-value',
    'override.key': 'local-override',
  };

  const options = {
    firebaseConfig: {
      projectId: 'test-project',
    },
    serviceName: 'test-service',
    teamId: 'team-01',
    environment: 'test',
    localConfig,
  };

  let mockRemoteConfig: {
    setDefaults: ReturnType<typeof vi.fn>;
    initialize: ReturnType<typeof vi.fn>;
    getValue: ReturnType<typeof vi.fn>;
    getAllValues: ReturnType<typeof vi.fn>;
  };

  // Reset mocks before each test
  beforeEach(() => {
    mockRemoteConfig = {
      setDefaults: vi.fn(),
      initialize: vi.fn().mockResolvedValue(true),
      getValue: vi.fn().mockImplementation(async (key: string, defaultValue: any) => {
        if (key === 'mocked.key') return 'mocked-value';
        if (key === 'prefix.nested') return { key: 'nested-value' };
        if (key === 'json.key') return { foo: 'bar' };
        return defaultValue;
      }),
      getAllValues: vi.fn().mockResolvedValue({
        'mocked.key': 'mocked-value',
        'prefix.nested': { key: 'nested-value' },
        'json.key': { foo: 'bar' },
      }),
    };

    // Mock the constructor to return our mock instance
    vi.spyOn(RemoteConfigModule, 'RemoteConfigService').mockImplementation(() => {
      return mockRemoteConfig as any;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('constructor', () => {
    it('should create an instance without RemoteConfig if firebaseConfig is not provided', () => {
      const factory = new ConfigFactory({
        ...options,
        firebaseConfig: undefined,
      });

      expect(factory).toBeDefined();
      expect(RemoteConfigModule.RemoteConfigService).not.toHaveBeenCalled();
    });

    it('should create a RemoteConfigService instance if firebaseConfig is provided', () => {
      const factory = new ConfigFactory(options);

      expect(factory).toBeDefined();
      expect(RemoteConfigModule.RemoteConfigService).toHaveBeenCalledWith({
        firebaseConfig: options.firebaseConfig,
        servicePrefix: options.serviceName,
        teamId: options.teamId,
      });
    });
  });

  describe('initialize', () => {
    it('should initialize RemoteConfigService if available', async () => {
      const factory = new ConfigFactory(options);
      await factory.initialize();

      expect(mockRemoteConfig.initialize).toHaveBeenCalledTimes(1);
    });

    it('should not throw if RemoteConfigService is not available', async () => {
      const factory = new ConfigFactory({
        ...options,
        firebaseConfig: undefined,
      });

      await expect(factory.initialize()).resolves.not.toThrow();
    });

    it('should be idempotent (can be called multiple times)', async () => {
      const factory = new ConfigFactory(options);
      await factory.initialize();
      await factory.initialize();

      expect(mockRemoteConfig.initialize).toHaveBeenCalledTimes(1);
    });
  });

  describe('getValue', () => {
    it('should get values from RemoteConfigService if available', async () => {
      const factory = new ConfigFactory(options);
      await factory.initialize();

      const value = await factory.getValue('mocked.key', 'default');

      expect(value).toBe('mocked-value');
      expect(mockRemoteConfig.getValue).toHaveBeenCalledWith('mocked.key', 'default');
    });

    it('should fall back to local config if RemoteConfigService is not available', async () => {
      const factory = new ConfigFactory({
        ...options,
        firebaseConfig: undefined,
      });
      await factory.initialize();

      const value = await factory.getValue('local.key', 'default');

      expect(value).toBe('local-value');
    });

    it('should fall back to default value if key is not in local config', async () => {
      const factory = new ConfigFactory({
        ...options,
        firebaseConfig: undefined,
      });
      await factory.initialize();

      const value = await factory.getValue('unknown.key', 'default-value');

      expect(value).toBe('default-value');
    });

    it('should warn if getValue is called before initialization', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const factory = new ConfigFactory(options);
      await factory.getValue('mocked.key', 'default');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Getting value before initialization')
      );

      consoleSpy.mockRestore();
    });
  });

  describe('getAllValues', () => {
    it('should get all values from RemoteConfigService if available', async () => {
      const factory = new ConfigFactory(options);
      await factory.initialize();

      const values = await factory.getAllValues();

      expect(values).toHaveProperty('mocked.key', 'mocked-value');
      expect(values).toHaveProperty('json.key');
      expect(values['json.key']).toEqual({ foo: 'bar' });
      expect(mockRemoteConfig.getAllValues).toHaveBeenCalledTimes(1);
    });

    it('should return local config if RemoteConfigService is not available', async () => {
      const factory = new ConfigFactory({
        ...options,
        firebaseConfig: undefined,
      });
      await factory.initialize();

      const values = await factory.getAllValues();

      expect(values).toEqual(localConfig);
    });
  });

  describe('createConfig', () => {
    it('should create a typed config accessor with the given prefix', async () => {
      const factory = new ConfigFactory(options);
      await factory.initialize();

      const typedConfig = factory.createConfig('prefix', { nested: { key: 'default' } });
      const value = await typedConfig.get('nested');

      expect(value).toEqual({ key: 'nested-value' });
      expect(mockRemoteConfig.getValue).toHaveBeenCalledWith('prefix.nested', { key: 'default' });
    });

    it('should handle empty prefix correctly', async () => {
      const factory = new ConfigFactory(options);
      await factory.initialize();

      const typedConfig = factory.createConfig('', { 'mocked.key': 'default' });
      const value = await typedConfig.get('mocked.key');

      expect(value).toBe('mocked-value');
      expect(mockRemoteConfig.getValue).toHaveBeenCalledWith('mocked.key', 'default');
    });
  });
});
