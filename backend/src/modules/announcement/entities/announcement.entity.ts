import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { OrganizationStructureEntity } from 'src/modules/organization/entities/organization-structure.entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';
import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AnnouncementStatus } from '../enums/announcement-status.enum';

@Entity({ name: 'announcement' })
export class AnnouncementEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'description' })
  description: string;

  @Column({ type: 'enum', enum: AnnouncementStatus, name: 'status' })
  status: AnnouncementStatus;

  @Column({
    type: 'timestamp with time zone',
    name: 'published_on',
    nullable: true,
  })
  publishedOn: Date;

  @Column({ type: 'string', name: 'organization_id' })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;

  @ManyToMany(() => OrganizationStructureEntity, {
    eager: true,
    onDelete: 'SET NULL',
  })
  @JoinTable()
  targets: OrganizationStructureEntity[];

  @Column({ type: 'integer', name: 'targeted_volunteers', default: 0 })
  targetedVolunteers: number;
}
