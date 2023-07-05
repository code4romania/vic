import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { UserPersonalDataPresenter } from './user-personal-data.presenter';
import { OrganizationVolunteerPresenter } from '../../organization/presenters/organization-volunteer.presenter';
import { SEX } from 'src/modules/user/enums/user.enum';
import { CityPresenter } from 'src/api/location/presenters/city.presenter';
import { NotificationsSettinsPresenter } from './notifications-settings.presenter';

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
      ? new OrganizationVolunteerPresenter(user.activeOrganization)
      : null;
    this.profilePicture = user.profilePicture;
    this.lastName = user.lastName;
    this.firstName = user.firstName;
    this.birthday = user.birthday;
    this.sex = user.sex;
    this.location = user.location;
    this.notificationsSettings = user.notificationsSettings
      ? new NotificationsSettinsPresenter(user.notificationsSettings)
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
    description: 'The user last name',
    example: 'Doe',
  })
  lastName: string;

  @Expose()
  @ApiProperty({
    description: 'The user first name',
    example: 'John',
  })
  firstName: string;

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
    description: 'The user birthday',
    example: '01.01.1990',
  })
  birthday?: Date;

  @Expose()
  @ApiProperty({
    description: 'The user sex',
    example: 'MALE/FEMALTE/OTHER',
  })
  sex?: SEX;

  @Expose()
  @ApiProperty({
    description: 'User profile picture',
  })
  profilePicture?: string;

  @Expose()
  @ApiProperty({
    description: 'Birth place',
    type: CityPresenter,
  })
  location?: CityPresenter;

  @Expose()
  @ApiProperty({
    type: UserPersonalDataPresenter,
  })
  userPersonalData: UserPersonalDataPresenter;

  @Expose()
  @ApiProperty({
    type: OrganizationVolunteerPresenter,
  })
  activeOrganization: OrganizationVolunteerPresenter;

  @Expose()
  @ApiProperty({
    type: NotificationsSettinsPresenter,
  })
  notificationsSettings: NotificationsSettinsPresenter;
}
