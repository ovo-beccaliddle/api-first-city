/**
 * Configuration for the sample service
 */

import 'dotenv/config';
import { ConfigFactory, FirebaseConfigOptions, type ConfigFactoryOptions } from '@city-services/common/firebase/config-factory';

// Define the structure of our configuration
interface Config {
  port: number;
  environment: string;
  version: string;
  serviceRegistry: {
    url: string;
    heartbeatInterval: number;
  };
  iam: {
    url: string;
  };
  serviceName: string;
  db: {
    host: string;
    port: number;
    username: string;
    password: string;
    database: string;
  };
  // Add any firebase configuration if available
  firebaseConfig?: {
    projectId: string;
    clientEmail?: string | undefined;
    privateKey?: string | undefined;
    serviceAccountPath?: string | undefined;
  };
  // Team identifier for the workshop
  teamId?: string;
}

// Load basic configuration from environment variables with defaults
const localConfig: Config = {
  port: parseInt(process.env.PORT || '3000', 10),
  environment: process.env.NODE_ENV || 'development',
  version: process.env.VERSION || '1.0.0',
  serviceRegistry: {
    url: process.env.SERVICE_REGISTRY_URL || 'http://service-registry:3000',
    heartbeatInterval: parseInt(process.env.HEARTBEAT_INTERVAL || '30000', 10),
  },
  iam: {
    url: process.env.IAM_URL || 'http://iam-service:3000',
  },
  serviceName: process.env.SERVICE_NAME || 'sample-service',
  db: {
    host: process.env.DB_HOST || 'sample-service-db',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'sample_service',
  },
  // Optional Firebase config, only used if all values are provided
  ...(process.env.FIREBASE_PROJECT_ID && {
    firebaseConfig: {
      projectId: process.env.FIREBASE_PROJECT_ID,
      ...(process.env.FIREBASE_CLIENT_EMAIL && {
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
      ...(process.env.FIREBASE_PRIVATE_KEY && {
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
      ...(process.env.FIREBASE_SERVICE_ACCOUNT_PATH && {
        serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH,
      }),
    },
  }),
  // Team identifier for the workshop
  ...(process.env.TEAM_ID && { teamId: process.env.TEAM_ID }),
};

// Set up the config factory to handle remote configuration
const factoryOptions: ConfigFactoryOptions = {
  serviceName: localConfig.serviceName,
  environment: localConfig.environment,
  localConfig,
};

// Add optional properties only if they exist
if (localConfig.firebaseConfig) {
  factoryOptions.firebaseConfig = localConfig.firebaseConfig as FirebaseConfigOptions;
}
if (localConfig.teamId) {
  factoryOptions.teamId = localConfig.teamId;
}

const configFactory = new ConfigFactory(factoryOptions);

// Create a singleton cached configuration
class ConfigCache {
  private static instance: ConfigCache;
  private cachedConfig: Partial<Config> = {};
  private initializing = false;
  private initialized = false;

  private constructor() {}

  public static getInstance(): ConfigCache {
    if (!ConfigCache.instance) {
      ConfigCache.instance = new ConfigCache();
    }
    return ConfigCache.instance;
  }

  public async initialize(): Promise<void> {
    if (this.initialized || this.initializing) return;

    this.initializing = true;

    try {
      // Initialize the config factory
      await configFactory.initialize();

      // Cache basic values
      this.cachedConfig.port = await configFactory.getValue<number>('port', localConfig.port);
      this.cachedConfig.environment = await configFactory.getValue<string>(
        'environment',
        localConfig.environment
      );
      this.cachedConfig.version = await configFactory.getValue<string>(
        'version',
        localConfig.version
      );

      // Cache service registry values
      const srUrl = await configFactory.getValue<string>(
        'serviceRegistry.url',
        localConfig.serviceRegistry.url
      );
      const srHeartbeat = await configFactory.getValue<number>(
        'serviceRegistry.heartbeatInterval',
        localConfig.serviceRegistry.heartbeatInterval
      );
      this.cachedConfig.serviceRegistry = { url: srUrl, heartbeatInterval: srHeartbeat };

      // Cache IAM values
      const iamUrl = await configFactory.getValue<string>('iam.url', localConfig.iam.url);
      this.cachedConfig.iam = { url: iamUrl };

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize config', error);
      // Fall back to local config
      this.cachedConfig = { ...localConfig };
      this.initialized = true;
    } finally {
      this.initializing = false;
    }
  }

  public getConfig(): Config {
    return {
      ...localConfig,
      ...this.cachedConfig,
    } as Config;
  }

  // For values that might change during runtime, get them directly
  public async getValue<T>(key: string, defaultValue: T): Promise<T> {
    return configFactory.getValue<T>(key, defaultValue);
  }
}

// Export the config cache singleton
export const configCache = ConfigCache.getInstance();

// Initialize the config (fetches remote values if available)
export const initializeConfig = async (): Promise<void> => {
  await configCache.initialize();
};

// Export a simple config object for easy access to cached values
const config = {
  get port() {
    return configCache.getConfig().port;
  },
  get environment() {
    return configCache.getConfig().environment;
  },
  get version() {
    return configCache.getConfig().version;
  },
  get serviceRegistry() {
    return configCache.getConfig().serviceRegistry;
  },
  get iam() {
    return configCache.getConfig().iam;
  },
  get serviceName() {
    return configCache.getConfig().serviceName;
  },
  get db() {
    return configCache.getConfig().db;
  },
  // Helper for dynamic values
  async getValue<T>(key: string, defaultValue: T): Promise<T> {
    return configCache.getValue(key, defaultValue);
  },
};

export default config;
