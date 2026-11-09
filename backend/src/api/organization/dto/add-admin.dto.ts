import { ApiProperty } from '@nestjs/swagger';
import { IsNormalizedEmail, IsSixDigitCode } from 'src/api/auth/dto/validators';
import { PersonName, Phone } from './organization-fields';

export class AddAdminDto {
  @ApiProperty({ example: 'Bogdan' })
  @PersonName()
  firstName: string;

  @ApiProperty({ example: 'Ionescu' })
  @PersonName()
  lastName: string;

  @ApiProperty({ example: 'bogdan@exemplu.ro' })
  @IsNormalizedEmail()
  email: string;

  @ApiProperty({ example: '+40722222222' })
  @Phone()
  phone: string;

  // #508: adding an admin is a sensitive action, confirmed with the code emailed to the caller
  @ApiProperty({ example: '123456' })
  @IsSixDigitCode()
  code: string;
}
