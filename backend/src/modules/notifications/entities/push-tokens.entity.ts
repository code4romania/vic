import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { RegularUserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({ name: 'push_tokens' })
@Unique('token_device_user', ['token', 'deviceId', 'userId'])
export class PushTokensEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'device_id' })
  deviceId: string;

  @Column({ type: 'text', name: 'token' })
  token: string;

  @Column({ type: 'text', name: 'user_id' })
  userId: string;

  @ManyToOne(() => RegularUserEntity)
  @JoinColumn({ name: 'user_id' })
  user: RegularUserEntity;
}
