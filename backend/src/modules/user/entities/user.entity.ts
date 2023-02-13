import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { OrganizationEntity } from 'src/modules/organization/entities/organization.entity';
import {
  ChildEntity,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  TableInheritance,
} from 'typeorm';
import { SEX, UserType } from '../enums/user.enum';

@Entity({ name: 'user' })
@TableInheritance({ column: { type: 'varchar', name: 'type', enum: UserType } })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'cognito_id' })
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

  @OneToOne(() => OrganizationEntity)
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
}
