import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { UserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { AuthIdentityStatus, AuthRealm } from '../enums/auth.enums';

@Entity({ name: 'auth_identity' })
// One login per email per realm.
@Index('auth_identity_realm_email_unique', ['realm', 'email'], {
  unique: true,
  where: '"deleted_on" IS NULL',
})
export class AuthIdentityEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: AuthRealm, name: 'realm' })
  realm: AuthRealm;

  @Column({ type: 'text', name: 'email' })
  email: string;

  @Column({
    type: 'enum',
    enum: AuthIdentityStatus,
    name: 'status',
    default: AuthIdentityStatus.PENDING,
  })
  status: AuthIdentityStatus;

  @Column({ type: 'boolean', name: 'super_admin', default: false })
  superAdmin: boolean;

  @Column({ type: 'timestamptz', name: 'email_verified_at', nullable: true })
  emailVerifiedAt: Date;

  @Column({ type: 'timestamptz', name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @Column({ type: 'text', name: 'legacy_cognito_username', nullable: true })
  legacyCognitoUsername: string;

  // App Store 5.1.1(v): the Apple refresh token, encrypted (AppleTokenService); never selected
  @Column({
    type: 'text',
    name: 'apple_refresh_token',
    nullable: true,
    select: false,
  })
  appleRefreshToken?: string;

  @Column({ type: 'uuid', name: 'user_id', nullable: true })
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: UserEntity;
}
