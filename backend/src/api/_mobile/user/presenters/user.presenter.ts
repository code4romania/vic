import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { UserPersonalDataPresenter } from './user-personal-data.presenter';
import { OrganizationProfilePresenter } from '../../organization/presenters/organization-profile.presenter';

export class UserPresenter {
  constructor(user: IRegularUserModel) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.phone = user.phone;
    this.userPersonalData = user.userPersonalData
      ? new UserPersonalDataPresenter(user.userPersonalData)
      : null;
    this.activeOrganization = user.activeOrganization
      ? new OrganizationProfilePresenter(user.activeOrganization)
      : null;
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

  @Expose()
  @ApiProperty({
    description: 'The user email',
    example: 'email@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: 'The user phone',
    example: '+40766666666',
  })
  phone: string;

  @Expose()
  @ApiProperty({
    type: UserPersonalDataPresenter,
  })
  userPersonalData: UserPersonalDataPresenter;

  @Expose()
  @ApiProperty({
    type: OrganizationProfilePresenter,
  })
  activeOrganization: OrganizationProfilePresenter;
}
