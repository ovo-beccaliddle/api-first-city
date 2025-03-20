interface RemoteConfigOptions {
    firebaseConfig: {
        projectId: string;
        clientEmail?: string;
        privateKey?: string;
        serviceAccountPath?: string;
    };
    servicePrefix?: string;
    teamId?: string;
}
/**
 * Remote Config Service for managing configuration settings
 *
 * This allows workshop facilitators to update configuration for all teams
 * while also allowing individual teams to have their own custom settings.
 */
export declare class RemoteConfigService {
    private remoteConfig;
    private firebaseApp;
    private initialized;
    private servicePrefix;
    private teamId;
    private logger;
    private defaultValues;
    constructor(options: RemoteConfigOptions);
    /**
     * Set default values to use when Firebase is unavailable
     */
    setDefaults(defaults: Record<string, any>): void;
    /**
     * Initialize and fetch remote configuration
     */
    initialize(): Promise<boolean>;
    /**
     * Helper to safely extract value from parameter
     */
    private getParameterValue;
    /**
     * Get a configuration value with a specific hierarchy:
     * 1. Team-specific value for this service
     * 2. Global team value
     * 3. Workshop-provided value for this service
     * 4. Global workshop value
     * 5. Default value provided locally
     */
    getValue<T>(key: string, defaultValue: T): Promise<T>;
    /**
     * Get all config values relevant to a service
     */
    getAllValues(): Promise<Record<string, any>>;
}
export {};
