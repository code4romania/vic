import { BaseEntity } from 'src/core/base/base-entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { UserType } from '../enums/user-type.enum';

@Entity({ name: 'user' })
export class UserEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', name: 'cognito_id' })
  cognitoId: string;

  @Column({
    type: 'enum',
    enum: UserType,
    name: 'type',
  })
  type: UserType;

  @Column({ type: 'text', name: 'name' })
  name: string;

  @Column({ type: 'text', unique: true, name: 'email' })
  email: string;

  @Column({ type: 'text', unique: true, name: 'phone' })
  phone: string;
}
