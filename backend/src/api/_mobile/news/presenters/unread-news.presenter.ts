import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class UnreadNewsPresenter {
  constructor(unread: number) {
    this.unread = unread;
  }

  @Expose()
  @ApiProperty({
    description: 'News newer than the last time the volunteer opened them',
    example: 3,
  })
  unread: number;
}
