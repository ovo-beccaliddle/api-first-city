/**
 * Configuration for the sample service
 */
import 'dotenv/config';
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
    firebaseConfig?: {
        projectId: string;
        clientEmail?: string | undefined;
        privateKey?: string | undefined;
        serviceAccountPath?: string | undefined;
    };
    teamId?: string;
}
declare class ConfigCache {
    private static instance;
    private cachedConfig;
    private initializing;
    private initialized;
    private constructor();
    static getInstance(): ConfigCache;
    initialize(): Promise<void>;
    getConfig(): Config;
    getValue<T>(key: string, defaultValue: T): Promise<T>;
}
export declare const configCache: ConfigCache;
export declare const initializeConfig: () => Promise<void>;
declare const config: {
    readonly port: number;
    readonly environment: string;
    readonly version: string;
    readonly serviceRegistry: {
        url: string;
        heartbeatInterval: number;
    };
    readonly iam: {
        url: string;
    };
    readonly serviceName: string;
    readonly db: {
        host: string;
        port: number;
        username: string;
        password: string;
        database: string;
    };
    getValue<T>(key: string, defaultValue: T): Promise<T>;
};
export default config;
