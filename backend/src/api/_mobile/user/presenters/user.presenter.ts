import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';

export class UserPresenter {
  constructor(user: IRegularUserModel) {
    this.id = user.id;
    this.name = user.name;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the User',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The user name',
    example: 'John Doe',
  })
  name: string;
}