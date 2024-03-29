import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IUserPersonalDataModel } from 'src/modules/user/models/user-personal-data.model';

export class UserPersonalDataPresenter {
  constructor(personalData: IUserPersonalDataModel) {
    this.id = personalData.id;
    this.identityDocumentSeries = personalData.identityDocumentSeries;
    this.identityDocumentNumber = personalData.identityDocumentNumber;
    this.identityDocumentIssueDate = personalData.identityDocumentIssueDate;
    this.identityDocumentExpirationDate =
      personalData.identityDocumentExpirationDate;
    this.address = personalData.address;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the personal data',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The identity document series',
    example: 'CI',
  })
  identityDocumentSeries: string;

  @Expose()
  @ApiProperty({
    description: 'The identity document number',
    example: '123456',
  })
  identityDocumentNumber: string;

  @Expose()
  @ApiProperty({
    description: 'The user address',
    example: 'Street, City ect',
  })
  address: string;

  @Expose()
  @ApiProperty({ description: 'The identity document issue data' })
  identityDocumentIssueDate: Date;

  @Expose()
  @ApiProperty({ description: 'The identity document expiration date' })
  identityDocumentExpirationDate: Date;
}
