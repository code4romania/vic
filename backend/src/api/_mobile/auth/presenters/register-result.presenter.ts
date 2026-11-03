import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RegisterResultPresenter {
  constructor(result: { maskedEmail: string; phone?: string }) {
    this.maskedEmail = result.maskedEmail;
    this.phone = result.phone;
  }

  @Expose()
  @ApiProperty({ example: 'e•••@example.ro' })
  maskedEmail: string;

  @Expose()
  @ApiPropertyOptional({ description: 'Prefills CreateUser' })
  phone?: string;
}
