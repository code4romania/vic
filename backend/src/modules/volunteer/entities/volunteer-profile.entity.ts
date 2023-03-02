import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { OrganizationStructureEntity } from 'src/modules/organization/entities/organization-structure.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'volunteer_profile' })
export class VolunteerProfileEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'email' })
  email: string;

  @Column({ type: 'text', name: 'phone' })
  phone: string;

  @Column({ type: 'timestamptz', name: 'active_since', nullable: true })
  activeSince: Date;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'branch_id',
  })
  branchId: string;

  @ManyToOne(() => OrganizationStructureEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'branch_id' })
  branch: OrganizationStructureEntity;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'department_id',
  })
  departmentId: string;

  @ManyToOne(() => OrganizationStructureEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'department_id' })
  department: OrganizationStructureEntity;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'role_id',
  })
  roleId: string;

  @ManyToOne(() => OrganizationStructureEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'role_id' })
  role: OrganizationStructureEntity;
}
