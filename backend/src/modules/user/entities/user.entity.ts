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
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
  Unique,
} from 'typeorm';
import { SEX, UserType } from '../enums/user.enum';
import { UserPersonalDataEntity } from './user-personal-data.entity';
import { NotificationsSettingsEntity } from 'src/modules/notifications/entities/notifications-settings.entity';

export const USER_CONSTRAINTS = {
  COGNITO_USER_TYPE_EMAIL_UNIQUE: 'cognito-userType-email-unique',
};

@Entity({ name: 'user' })
@Unique(USER_CONSTRAINTS.COGNITO_USER_TYPE_EMAIL_UNIQUE, [
  'cognitoId',
  'type',
  'email',
])
@TableInheritance({ column: { type: 'varchar', name: 'type', enum: UserType } }) // TODO: can include type in the entity response from the db?
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'cognito_id' })
  cognitoId: string;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({ type: 'text', name: 'email' })
  email: string;

  @Column({ type: 'text', name: 'phone' })
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
  @Column({ type: 'text', name: 'first_name' })
  firstName: string;

  @Column({ type: 'text', name: 'last_name' })
  lastName: string;

  @Column({ type: 'date', name: 'birthday', nullable: true })
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

  @Column({ type: 'varchar', name: 'user_personal_data_id', nullable: true })
  userPersonalDataId: string;

  @OneToOne(() => UserPersonalDataEntity, { eager: true })
  @JoinColumn({ name: 'user_personal_data_id' })
  userPersonalData: UserPersonalDataEntity;

  @Column({
    type: 'varchar',
    name: 'notifications_settings_id',
    nullable: true,
  })
  notificationsSettingsId: string;

  @OneToOne(() => NotificationsSettingsEntity, { eager: true })
  @JoinColumn({ name: 'notifications_settings_id' })
  notificationsSettings: NotificationsSettingsEntity;

  @Column({
    type: 'varchar',
    nullable: true,
    name: 'active_organization_id',
  })
  activeOrganizationId: string;

  @ManyToOne(() => OrganizationEntity)
  @JoinColumn({ name: 'active_organization_id' })
  activeOrganization: OrganizationEntity;
}
