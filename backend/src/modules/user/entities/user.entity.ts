import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { CityEntity } from 'src/modules/location/entities/city.entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';
import { VolunteerEntity } from 'src/modules/volunteer/entities/volunteer.entity';
import {
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { SEX, UserType } from '../enums/user.enum';

@Entity({ name: 'user' })
@TableInheritance({ column: { type: 'varchar', name: 'type', enum: UserType } }) // TODO: can include type in the entity response from the db?
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true, name: 'cognito_id' })
  cognitoId: string;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({ type: 'text', unique: true, name: 'email' })
  email: string;

  @Column({ type: 'text', unique: true, name: 'phone' })
  phone: string;
}

@ChildEntity(UserType.ADMIN)
export class AdminUserEntity extends UserEntity {
  @Column({
    type: 'varchar',
    nullable: true,
    name: 'organization_id',
  })
  organizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'organization_id' })
  organization: OrganizationEntity;
}

@ChildEntity(UserType.REGULAR)
export class RegularUserEntity extends UserEntity {
  @Column({ type: 'timestamptz', name: 'birthday', nullable: true })
  birthday: Date;

  @Column({ type: 'varchar', name: 'sex', enum: SEX, nullable: true })
  sex: SEX;

  @Column({ type: 'text', name: 'profile_picture', nullable: true })
  profilePicture: string;

  @Column({
    type: 'integer',
    nullable: true,
    name: 'location_id',
  })
  locationId: number;

  @ManyToOne(() => CityEntity)
  @JoinColumn({ name: 'location_id' })
  location: CityEntity;

  @OneToMany(() => VolunteerEntity, (volunteer) => volunteer.user)
  volunteer: VolunteerEntity[];
}
