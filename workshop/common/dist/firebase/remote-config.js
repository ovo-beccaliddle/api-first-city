"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RemoteConfigService = void 0;
const app_1 = require("firebase-admin/app");
const remote_config_1 = require("firebase-admin/remote-config");
const logging_1 = require("../logging");
/**
 * Remote Config Service for managing configuration settings
 *
 * This allows workshop facilitators to update configuration for all teams
 * while also allowing individual teams to have their own custom settings.
 */
class RemoteConfigService {
    constructor(options) {
        this.remoteConfig = null;
        this.firebaseApp = null;
        this.initialized = false;
        this.defaultValues = {};
        this.servicePrefix = options.servicePrefix || 'default';
        this.teamId = options.teamId || 'default';
        this.logger = new logging_1.Logger({ service: `${this.servicePrefix}-remote-config` });
        try {
            // Initialize Firebase Admin
            const appOptions = {
                projectId: options.firebaseConfig.projectId,
            };
            // Use service account if provided
            if (options.firebaseConfig.privateKey && options.firebaseConfig.clientEmail) {
                appOptions.credential = (0, app_1.cert)({
                    projectId: options.firebaseConfig.projectId,
                    clientEmail: options.firebaseConfig.clientEmail,
                    privateKey: options.firebaseConfig.privateKey,
                });
            }
            else if (options.firebaseConfig.serviceAccountPath) {
                appOptions.credential = (0, app_1.cert)(options.firebaseConfig.serviceAccountPath);
            }
            this.firebaseApp = (0, app_1.initializeApp)(appOptions);
            // Initialize Remote Config
            this.remoteConfig = (0, remote_config_1.getRemoteConfig)(this.firebaseApp);
            this.logger.info('Firebase Remote Config initialized');
        }
        catch (error) {
            this.logger.error('Failed to initialize Firebase Remote Config', error instanceof Error ? error : new Error(String(error)));
            this.remoteConfig = null;
        }
    }
    /**
     * Set default values to use when Firebase is unavailable
     */
    setDefaults(defaults) {
        this.defaultValues = defaults;
        this.logger.info('Default configuration values set', { count: Object.keys(defaults).length });
    }
    /**
     * Initialize and fetch remote configuration
     */
    async initialize() {
        if (!this.remoteConfig) {
            this.logger.warn('Remote config not available, using defaults only');
            this.initialized = true;
            return false;
        }
        try {
            // For Admin SDK, we need to fetch the template
            await this.remoteConfig.getTemplate();
            this.initialized = true;
            this.logger.info('Remote config template loaded successfully');
            return true;
        }
        catch (error) {
            this.logger.error('Failed to fetch remote config', error instanceof Error ? error : new Error(String(error)));
            this.initialized = true;
            return false;
        }
    }
    /**
     * Helper to safely extract value from parameter
     */
    getParameterValue(param) {
        // Check if the parameter has the expected structure and return the value
        const typedParam = param;
        return typedParam?.defaultValue?.text;
    }
    /**
     * Get a configuration value with a specific hierarchy:
     * 1. Team-specific value for this service
     * 2. Global team value
     * 3. Workshop-provided value for this service
     * 4. Global workshop value
     * 5. Default value provided locally
     */
    async getValue(key, defaultValue) {
        if (!this.initialized) {
            this.logger.warn('Getting value before initialization, using default', { key });
            return defaultValue;
        }
        if (!this.remoteConfig) {
            return this.defaultValues[key] ?? defaultValue;
        }
        try {
            // Get the template with all parameters
            const template = await this.remoteConfig.getTemplate();
            // Try each key in priority order
            const paramKeys = [
                `${this.teamId}.${this.servicePrefix}.${key}`,
                `${this.teamId}.${key}`,
                `workshop.${this.servicePrefix}.${key}`,
                `workshop.${key}`,
                key,
            ];
            for (const paramKey of paramKeys) {
                if (template.parameters && paramKey in template.parameters) {
                    const param = template.parameters[paramKey];
                    const value = this.getParameterValue(param);
                    if (value) {
                        try {
                            // Try to parse as JSON if it looks like JSON
                            if (typeof value === 'string' &&
                                (value.startsWith('{') ||
                                    value.startsWith('[') ||
                                    value === 'true' ||
                                    value === 'false' ||
                                    !isNaN(Number(value)))) {
                                return JSON.parse(value);
                            }
                            return value;
                        }
                        catch (e) {
                            // If parsing fails, return as string
                            return value;
                        }
                    }
                }
            }
            // Fall back to local defaults if no remote value found
            return this.defaultValues[key] ?? defaultValue;
        }
        catch (error) {
            this.logger.error(`Error getting remote config value for key: ${key}`, error instanceof Error ? error : new Error(String(error)));
            return this.defaultValues[key] ?? defaultValue;
        }
    }
    /**
     * Get all config values relevant to a service
     */
    async getAllValues() {
        const result = { ...this.defaultValues };
        if (!this.remoteConfig) {
            return result;
        }
        try {
            // Get the server template
            const template = await this.remoteConfig.getTemplate();
            // Extract parameters relevant to this service
            if (template.parameters) {
                for (const [key, param] of Object.entries(template.parameters)) {
                    if (key.startsWith(`${this.teamId}.${this.servicePrefix}.`) ||
                        key.startsWith(`${this.teamId}.`) ||
                        key.startsWith(`workshop.${this.servicePrefix}.`) ||
                        key.startsWith(`workshop.`)) {
                        const shortKey = key.includes('.') ? key.split('.').slice(-1)[0] : key;
                        const value = this.getParameterValue(param);
                        if (value) {
                            try {
                                if (!shortKey)
                                    continue;
                                if (typeof value === 'string' &&
                                    (value.startsWith('{') ||
                                        value.startsWith('[') ||
                                        value === 'true' ||
                                        value === 'false' ||
                                        !isNaN(Number(value)))) {
                                    result[shortKey] = JSON.parse(value);
                                }
                                else {
                                    result[shortKey] = value;
                                }
                            }
                            catch (e) {
                                if (shortKey) {
                                    result[shortKey] = value;
                                }
                            }
                        }
                    }
                }
            }
            return result;
        }
        catch (error) {
            this.logger.error('Error getting all config values', error instanceof Error ? error : new Error(String(error)));
            return result;
        }
    }
}
exports.RemoteConfigService = RemoteConfigService;
//# sourceMappingURL=remote-config.js.map