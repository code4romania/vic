import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IUserModel } from 'src/modules/user/models/base-user.model';

export class UserPresenter<T extends IUserModel> {
  constructor(user: T) {
    this.id = user.id;
    this.name = user.name;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the user',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The user name' })
  name: string;
}
