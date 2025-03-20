import { Table, TableColumn } from 'typeorm';
export class CreateResourceTable1710000000000 {
    async up(queryRunner) {
        // Create enum type for resource status
        await queryRunner.query(`
      CREATE TYPE resource_status AS ENUM (
        'active',
        'inactive',
        'pending',
        'archived'
      )
    `);
        // Create uuid-ossp extension if it doesn't exist
        await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
        // Create the resource table
        await queryRunner.createTable(new Table({
            name: 'resource',
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    default: 'uuid_generate_v4()',
                },
                {
                    name: 'name',
                    type: 'varchar',
                    isNullable: false,
                },
                {
                    name: 'description',
                    type: 'text',
                    isNullable: true,
                },
                {
                    name: 'status',
                    type: 'resource_status',
                    isNullable: false,
                    default: "'pending'",
                },
                {
                    name: 'tags',
                    type: 'text',
                    isNullable: true,
                    default: null,
                },
                {
                    name: 'created_at',
                    type: 'timestamp with time zone',
                    default: 'CURRENT_TIMESTAMP',
                },
                {
                    name: 'updated_at',
                    type: 'timestamp with time zone',
                    default: 'CURRENT_TIMESTAMP',
                },
            ],
        }), true);
        // Add updated_at trigger using TypeORM's built-in features
        await queryRunner.addColumn('resource', new TableColumn({
            name: 'updated_at',
            type: 'timestamp with time zone',
            default: 'CURRENT_TIMESTAMP',
        }));
    }
    async down(queryRunner) {
        await queryRunner.dropTable('resource');
        await queryRunner.query('DROP TYPE IF EXISTS resource_status');
    }
}
