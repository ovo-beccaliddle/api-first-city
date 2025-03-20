import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { ResourceEntity } from '../models/resource.entity';
import config from '../config';
import { Logger } from '@city-services/common';
const logger = new Logger({ service: config.serviceName });
export const dataSource = new DataSource({
    type: 'postgres',
    host: config.db.host,
    port: config.db.port,
    username: config.db.username,
    password: config.db.password,
    database: config.db.database,
    synchronize: config.environment === 'development',
    logging: config.environment === 'development',
    entities: [ResourceEntity],
    migrations: ['src/migrations/*.ts'],
});
export default dataSource;
export const initializeDatabase = async () => {
    try {
        logger.info(`Attempting to connect to database at ${config.db.host}:${config.db.port}/${config.db.database}`);
        logger.info(`Database connection details: Host=${config.db.host}, Port=${config.db.port}, User=${config.db.username}, Database=${config.db.database}`);
        if (!dataSource.isInitialized) {
            await dataSource.initialize();
            logger.info('Database connection established successfully');
        }
        return dataSource;
    }
    catch (error) {
        logger.error('Error connecting to database', error instanceof Error ? error : new Error(String(error)));
        logger.error('Please ensure PostgreSQL is running and the connection details are correct in .env file');
        logger.info('You can run the database using: docker-compose up sample-service-db');
        throw error;
    }
};
