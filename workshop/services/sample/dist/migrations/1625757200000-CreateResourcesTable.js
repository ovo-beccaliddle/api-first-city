"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateResourcesTable1625757200000 = void 0;
const typeorm_1 = require("typeorm");
const types_gen_1 = require("../generated/types.gen");
class CreateResourcesTable1625757200000 {
    async up(queryRunner) {
        // Create enum type for resource status
        await queryRunner.query(`
            CREATE TYPE resource_status_enum AS ENUM (
                '${types_gen_1.ResourceStatus.ACTIVE}', 
                '${types_gen_1.ResourceStatus.INACTIVE}', 
                '${types_gen_1.ResourceStatus.PENDING}', 
                '${types_gen_1.ResourceStatus.ARCHIVED}'
            )
        `);
        // Create resources table
        await queryRunner.createTable(new typeorm_1.Table({
            name: 'resources',
            columns: [
                {
                    name: 'id',
                    type: 'varchar',
                    isPrimary: true,
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
                    type: 'resource_status_enum',
                    isNullable: false,
                    default: `'${types_gen_1.ResourceStatus.ACTIVE}'`,
                },
                {
                    name: 'tags',
                    type: 'text',
                    isNullable: false,
                    default: "''",
                },
                {
                    name: 'createdAt',
                    type: 'timestamp',
                    default: 'now()',
                },
                {
                    name: 'updatedAt',
                    type: 'timestamp',
                    default: 'now()',
                },
            ],
        }), true);
        // Create index on name for faster searches
        await queryRunner.query(`
            CREATE INDEX idx_resources_name ON resources (name);
        `);
    }
    async down(queryRunner) {
        // Drop the table
        await queryRunner.dropTable('resources');
        // Drop the enum type
        await queryRunner.query(`DROP TYPE resource_status_enum`);
    }
}
exports.CreateResourcesTable1625757200000 = CreateResourcesTable1625757200000;
//# sourceMappingURL=1625757200000-CreateResourcesTable.js.map