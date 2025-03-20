var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { ResourceStatus } from '../generated/types.gen';
/**
 * TypeORM entity representing a resource in the database.
 * Implements the Resource interface from the OpenAPI specification,
 * excluding the timestamp fields which are handled by TypeORM decorators.
 *
 * @class ResourceEntity
 * @implements {Omit<Resource, 'createdAt' | 'updatedAt'>}
 */
let ResourceEntity = class ResourceEntity {
};
__decorate([
    PrimaryGeneratedColumn('uuid'),
    __metadata("design:type", String)
], ResourceEntity.prototype, "id", void 0);
__decorate([
    Column(),
    __metadata("design:type", String)
], ResourceEntity.prototype, "name", void 0);
__decorate([
    Column({ nullable: true }),
    __metadata("design:type", String)
], ResourceEntity.prototype, "description", void 0);
__decorate([
    Column({
        type: 'enum',
        enum: ResourceStatus,
        default: ResourceStatus.PENDING
    }),
    __metadata("design:type", String)
], ResourceEntity.prototype, "status", void 0);
__decorate([
    Column('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], ResourceEntity.prototype, "tags", void 0);
__decorate([
    CreateDateColumn({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ResourceEntity.prototype, "createdAt", void 0);
__decorate([
    UpdateDateColumn({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ResourceEntity.prototype, "updatedAt", void 0);
ResourceEntity = __decorate([
    Entity('resource')
], ResourceEntity);
export { ResourceEntity };
