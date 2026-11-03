import { ApiProperty } from '@nestjs/swagger';
import { IsNormalizedEmail } from 'src/api/auth/dto/validators';
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
}
