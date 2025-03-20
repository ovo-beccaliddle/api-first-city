"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigFactory = void 0;
const remote_config_1 = require("./remote-config");
/**
 * Config Factory creates a configuration system that combines:
 * - Local config values (from env vars, files, etc.)
 * - Remote config from Firebase (centrally controlled)
 *
 * This allows workshop facilitators to adjust config for all teams
 * while teams can still have their own custom settings.
 */
class ConfigFactory {
    constructor(options) {
        this.remoteConfig = null;
        this.isInitialized = false;
        this.localConfig = options.localConfig;
        this.serviceName = options.serviceName;
        // Only setup remote config if Firebase config is provided
        if (options.firebaseConfig) {
            this.remoteConfig = new remote_config_1.RemoteConfigService({
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
    async initialize() {
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
    async getValue(key, defaultValue) {
        if (!this.isInitialized) {
            console.warn(`[ConfigFactory] Getting value before initialization: ${key}`);
        }
        if (this.remoteConfig) {
            return this.remoteConfig.getValue(key, defaultValue);
        }
        return this.localConfig[key] ?? defaultValue;
    }
    /**
     * Get all configuration values as an object
     */
    async getAllValues() {
        if (this.remoteConfig) {
            return this.remoteConfig.getAllValues();
        }
        return { ...this.localConfig };
    }
    /**
     * Create a typed config accessor for a specific section
     * This makes it easier to use strongly-typed config values
     */
    createConfig(prefix, defaults) {
        return {
            get: async (key) => {
                const fullKey = prefix ? `${prefix}.${String(key)}` : String(key);
                return this.getValue(fullKey, defaults[key]);
            },
        };
    }
}
exports.ConfigFactory = ConfigFactory;
//# sourceMappingURL=config-factory.js.map