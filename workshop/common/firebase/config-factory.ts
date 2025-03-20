import { RemoteConfigService } from './remote-config';

export interface FirebaseConfigOptions {
  projectId: string;
  clientEmail?: string;
  privateKey?: string;
  serviceAccountPath?: string;
}

export interface ConfigFactoryOptions {
  firebaseConfig?: FirebaseConfigOptions;
  serviceName: string;
  teamId?: string;
  environment: string;
  localConfig: Record<string, any>;
}

/**
 * Config Factory creates a configuration system that combines:
 * - Local config values (from env vars, files, etc.)
 * - Remote config from Firebase (centrally controlled)
 *
 * This allows workshop facilitators to adjust config for all teams
 * while teams can still have their own custom settings.
 */
export class ConfigFactory {
  private remoteConfig: RemoteConfigService | null = null;
  private localConfig: Record<string, any>;
  // @ts-ignore
  private serviceName: string;
  private isInitialized = false;

  constructor(options: ConfigFactoryOptions) {
    this.localConfig = options.localConfig;
    this.serviceName = options.serviceName;

    // Only setup remote config if Firebase config is provided
    if (options.firebaseConfig) {
      this.remoteConfig = new RemoteConfigService({
        firebaseConfig: options.firebaseConfig,
        servicePrefix: options.serviceName,
        teamId: options.teamId || 'default',
      });

      // Setup local config as fallback defaults
      this.remoteConfig.setDefaults(options.localConfig);
    }
  }

  /**
   * Initialize the configuration system
   * This will fetch remote config if available
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.remoteConfig) {
      await this.remoteConfig.initialize();
    }

    this.isInitialized = true;
  }

  /**
   * Get a configuration value
   * Will check remote config first (if available) then fall back to local config
   */
  public async getValue<T>(key: string, defaultValue: T): Promise<T> {
    if (!this.isInitialized) {
      console.warn(`[ConfigFactory] Getting value before initialization: ${key}`);
    }

    if (this.remoteConfig) {
      return this.remoteConfig.getValue<T>(key, defaultValue);
    }

    return this.localConfig[key] ?? defaultValue;
  }

  /**
   * Get all configuration values as an object
   */
  public async getAllValues(): Promise<Record<string, any>> {
    if (this.remoteConfig) {
      return this.remoteConfig.getAllValues();
    }

    return { ...this.localConfig };
  }

  /**
   * Create a typed config accessor for a specific section
   * This makes it easier to use strongly-typed config values
   */
  public createConfig<T extends Record<string, any>>(
    prefix: string,
    defaults: T
  ): { get<K extends keyof T>(key: K): Promise<T[K]> } {
    return {
      get: async <K extends keyof T>(key: K): Promise<T[K]> => {
        const fullKey = prefix ? `${prefix}.${String(key)}` : String(key);
        return this.getValue(fullKey, defaults[key]);
      },
    };
  }
}
