import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { differenceInYears } from 'date-fns';
import { UserPersonalDataPresenter } from 'src/api/_mobile/user/presenters/user-personal-data.presenter';
import { CityPresenter } from 'src/api/location/presenters/city.presenter';
import { SEX } from 'src/modules/user/enums/user.enum';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';

export class RegularUserPresenter {
  constructor(user: IRegularUserModel) {
    this.id = user.id;
    this.name = `${user.firstName} ${user.lastName}`;
    this.email = user.email;
    this.phone = user.phone;
    this.age = this.calculateAge(user.birthday);
    this.sex = user.sex;
    this.profilePicture = user.profilePicture;
    this.location = user.location ? new CityPresenter(user.location) : null;
    this.userPersonalData = user.userPersonalData
      ? new UserPersonalDataPresenter(user.userPersonalData)
      : null;
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
  @ApiProperty({ description: 'User age' })
  age: number;

  @Expose()
  @ApiProperty({ description: 'The user name', enum: SEX, example: SEX.MALE })
  sex: SEX;

  @Expose()
  @ApiProperty({ description: 'The user profile picture' })
  profilePicture?: string;

  @Expose()
  @ApiProperty({ description: 'The users location' })
  location: CityPresenter;

  @Expose()
  @ApiProperty({ description: 'The user personal data' })
  userPersonalData?: UserPersonalDataPresenter;

  private calculateAge = (birthday: Date): number => {
    return birthday ? differenceInYears(new Date(), new Date(birthday)) : 0;
  };
}
