import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class RejectAccessRequestDto {
  // #500: required, and sent to the volunteer
  @ApiProperty({ maxLength: 225 })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString()
  @IsNotEmpty()
  @MaxLength(225)
  rejectionReason: string;
}
