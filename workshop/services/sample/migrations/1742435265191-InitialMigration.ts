import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialMigration1742435265191 implements MigrationInterface {
    name = 'InitialMigration1742435265191'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."resource_status_enum" AS ENUM('active', 'inactive', 'pending', 'archived')`);
        await queryRunner.query(`CREATE TABLE "resource" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "description" character varying, "status" "public"."resource_status_enum" NOT NULL DEFAULT 'pending', "tags" text, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e2894a5867e06ae2e8889f1173f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "resource"`);
        await queryRunner.query(`DROP TYPE "public"."resource_status_enum"`);
    }

}
