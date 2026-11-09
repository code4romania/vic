import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RequestLoginResultPresenter {
  constructor(result: { maskedEmail: string }) {
    this.maskedEmail = result.maskedEmail;
  }

  @Expose()
  @ApiProperty({
    example: 'a•••@example.ro',
    description: 'Where the code was sent, for the "check your email" screen',
  })
  maskedEmail: string;
}
