import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class IdAndNamePresenter<T extends { id: string; name: string }> {
  constructor(record: T) {
    this.id = record.id;
    this.name = record.name;
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the record',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({ description: 'The name of the record' })
  name: string;
}
