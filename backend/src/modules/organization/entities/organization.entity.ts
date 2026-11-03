import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { EventEntity } from 'src/modules/event/entities/event.entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OrganizationStatus } from '../enums/organization-status.enum';

@Entity({ name: 'organization' })
@Index('organization_tax_id_unique', ['taxId'], {
  unique: true,
  where: '"tax_id" IS NOT NULL AND "deleted_on" IS NULL',
})
export class OrganizationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true, name: 'name' })
  name: string;

  @Column({ type: 'text', unique: true, name: 'email' })
  email: string;

  @Column({ type: 'text', unique: true, name: 'phone' })
  phone: string;

  @Column({ type: 'text', name: 'address', nullable: true })
  address: string;

  @Column({ type: 'text', name: 'activity_area', nullable: true })
  activityArea: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'text', name: 'logo', nullable: true })
  logo: string;

  // Defaults to active so every existing NGO keeps working without a data fix.
  @Column({
    type: 'varchar',
    name: 'status',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE,
  })
  status: OrganizationStatus;

  @Column({ type: 'timestamptz', name: 'validated_at', nullable: true })
  validatedAt: Date;

  @Column({ type: 'uuid', name: 'validated_by', nullable: true })
  validatedById: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'validated_by' })
  validatedBy: UserEntity;

  @Column({ type: 'text', name: 'tax_id', nullable: true })
  taxId: string;

  @Column({ type: 'text', name: 'website', nullable: true })
  website: string;

  @Column({ type: 'text', name: 'statute_url', nullable: true })
  statuteUrl: string;

  @Column({ type: 'timestamptz', name: 'suspended_at', nullable: true })
  suspendedAt: Date;

  @OneToMany(() => VolunteerEntity, (volunteer) => volunteer.organization)
  volunteers: VolunteerEntity[];

  @OneToMany(() => EventEntity, (event) => event.organization)
  events: EventEntity[];
}
