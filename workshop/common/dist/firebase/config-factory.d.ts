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
export declare class ConfigFactory {
    private remoteConfig;
    private localConfig;
    private serviceName;
    private isInitialized;
    constructor(options: ConfigFactoryOptions);
    /**
     * Initialize the configuration system
     * This will fetch remote config if available
     */
    initialize(): Promise<void>;
    /**
     * Get a configuration value
     * Will check remote config first (if available) then fall back to local config
     */
    getValue<T>(key: string, defaultValue: T): Promise<T>;
    /**
     * Get all configuration values as an object
     */
    getAllValues(): Promise<Record<string, any>>;
    /**
     * Create a typed config accessor for a specific section
     * This makes it easier to use strongly-typed config values
     */
    createConfig<T extends Record<string, any>>(prefix: string, defaults: T): {
        get<K extends keyof T>(key: K): Promise<T[K]>;
    };
}
