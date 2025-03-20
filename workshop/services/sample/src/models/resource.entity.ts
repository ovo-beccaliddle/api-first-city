import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ResourceStatus } from '../generated/types.gen';
import type { Resource } from '../generated/types.gen';

/**
 * TypeORM entity representing a resource in the database.
 * Implements the Resource interface from the OpenAPI specification,
 * excluding the timestamp fields which are handled by TypeORM decorators.
 * 
 * @class ResourceEntity
 * @implements {Omit<Resource, 'createdAt' | 'updatedAt'>}
 */
@Entity('resource')
export class ResourceEntity implements Omit<Resource, 'createdAt' | 'updatedAt'> {
  /**
   * Unique identifier for the resource.
   * Uses UUID v4 format.
   * 
   * @type {string}
   */
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  /**
   * Name of the resource.
   * Required field that cannot be null.
   * 
   * @type {string}
   */
  @Column()
  name!: string;

  /**
   * Optional description of the resource.
   * 
   * @type {string | undefined}
   */
  @Column({ nullable: true })
  description?: string;

  /**
   * Current status of the resource.
   * Uses an enum to restrict possible values.
   * Defaults to PENDING if not specified.
   * 
   * @type {ResourceStatus}
   * @default ResourceStatus.PENDING
   */
  @Column({
    type: 'enum',
    enum: ResourceStatus,
    default: ResourceStatus.PENDING
  })
  status!: ResourceStatus;

  /**
   * Array of tags associated with the resource.
   * Stored as a string array in the database.
   * 
   * @type {string[] | undefined}
   */
  @Column('simple-array', { nullable: true })
  tags?: string[];

  /**
   * Timestamp of when the resource was created.
   * Automatically managed by TypeORM.
   * 
   * @type {Date}
   */
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  /**
   * Timestamp of when the resource was last updated.
   * Automatically managed by TypeORM.
   * 
   * @type {Date}
   */
  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;
}
