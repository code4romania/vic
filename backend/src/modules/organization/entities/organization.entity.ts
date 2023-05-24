import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'organization' })
export class OrganizationEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true, name: 'name' })
  name: string;

  @Column({ type: 'text', unique: true, name: 'email' })
  email: string;

  @Column({ type: 'text', unique: true, name: 'phone' })
  phone: string;

  @Column({ type: 'text', name: 'address' })
  address: string;

  @Column({ type: 'text', name: 'activity_area', nullable: true })
  activityArea: string;

  @Column({ type: 'text', name: 'description', nullable: true })
  description: string;

  @Column({ type: 'text', name: 'logo', nullable: true })
  logo: string;

  @OneToMany(() => VolunteerEntity, (volunteer) => volunteer.organization)
  volunteers: VolunteerEntity[];
}
