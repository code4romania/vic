import { BaseEntity } from 'src/infrastructure/base/base-entity';
import { RegularUserEntity } from 'src/modules/user/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { NotificationsFrom } from '../enums/NotificationsFrom.enum';

@Entity({ name: 'notifications_settings' })
export class NotificationsSettingsEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: NotificationsFrom,
    name: 'notifications_from',
    default: NotificationsFrom.MY_ORGANIZATIONS,
  })
  notificationsFrom: NotificationsFrom;

  @Column({ type: 'boolean', name: 'notifications_via_email', default: true })
  notificationsViaEmail: boolean;

  @Column({ type: 'boolean', name: 'notifications_via_push', default: false })
  notificationsViaPush: boolean;

  @Column({ type: 'text', name: 'user_id' })
  userId: string;

  @OneToOne(() => RegularUserEntity)
  @JoinColumn({ name: 'user_id' })
  user: RegularUserEntity;
}
