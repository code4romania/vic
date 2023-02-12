import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { AdminUserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { OrganizationStructureType } from '../enums/organization-structure-type.enum';
import { OrganizationEntity } from './organization.entity';

export const ORGANIZATION_STRUCTURE_CONSTRAINTS = {
  ORGANIZATION_NAME_TYPE_UNIQUE: 'organization-name-type',
};

@Unique(ORGANIZATION_STRUCTURE_CONSTRAINTS.ORGANIZATION_NAME_TYPE_UNIQUE, [
  'name',
  'organizationId',
  'type',
])
@Entity({ name: 'organization_structure' })
export class OrganizationStructureEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({
    type: 'enum',
    enum: OrganizationStructureType,
    name: 'type',
  })
  type: OrganizationStructureType;

  @Column({ type: 'string', name: 'created_by' })
  createdById: string;

  @ManyToOne(() => AdminUserEntity)
  @JoinColumn({ name: 'created_by' })
  createdBy: AdminUserEntity;

  @Column({ type: 'varchar', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}
