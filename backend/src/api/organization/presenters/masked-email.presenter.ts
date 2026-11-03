import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

// "Check your email": where a link was sent, masked.
export class MaskedEmailPresenter {
  constructor(maskedEmail: string) {
    this.maskedEmail = maskedEmail;
  }

  @Expose()
  @ApiProperty({ example: 'a•••@example.ro' })
  maskedEmail: string;
}
