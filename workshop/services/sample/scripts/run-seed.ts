import fs from 'fs';
import path from 'path';
import { Client } from 'pg';
import config from '../src/config/config';
import { Logger } from '@city-services/common';

const logger = new Logger({ service: config.serviceName });

async function runSeed() {
  const client = new Client({
    host: config.db.host,
    port: config.db.port,
    user: config.db.username,
    password: config.db.password,
    database: config.db.database,
  });

  try {
    logger.info('Connecting to database...');
    await client.connect();

    const seedPath = path.join(__dirname, '../src/migrations/seed.sql');
    logger.info(`Reading seed file: ${seedPath}`);
    const seedSql = fs.readFileSync(seedPath, 'utf8');

    logger.info('Executing seed SQL...');
    await client.query(seedSql);

    logger.info('Seed data loaded successfully');
  } catch (error: unknown) {
    logger.error('Error seeding database', error as Error);
    throw error;
  } finally {
    await client.end();
  }
}

runSeed().catch((err) => {
  logger.error('Failed to seed database', err);
  process.exit(1);
});
