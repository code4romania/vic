import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CancelAccessRequestDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;
}
