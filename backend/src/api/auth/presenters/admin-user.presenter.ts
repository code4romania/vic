import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

export class AdminUserPresenter {
  constructor(adminUser: IAdminUserModel) {
    this.id = adminUser.id;
    this.name = adminUser.name;
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
