import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';

// The logged-in admin (login and GET /auth/web/me). AdminUserPresenter stays { id, name }, because the
// activity log uses it for other admins and must not show their email or phone.
export class AdminProfilePresenter {
  constructor(admin: IAdminUserModel & { superAdmin?: boolean }) {
    this.id = admin.id;
    this.name = admin.name;
    this.email = admin.email;
    this.phone = admin.phone;
    this.organizationId = admin.organizationId;
    this.superAdmin = admin.superAdmin === true;
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

  @Expose()
  @ApiProperty({ description: 'The user email' })
  email: string;

  @Expose()
  @ApiProperty({ description: 'The user phone' })
  phone: string;

  @Expose()
  @ApiProperty({ description: 'The organization the admin manages' })
  organizationId: string;

  @Expose()
  @ApiProperty({ description: 'Sees the NGO validation page' })
  superAdmin: boolean;
}
