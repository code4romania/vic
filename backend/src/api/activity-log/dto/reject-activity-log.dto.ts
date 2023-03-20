import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RejectActivityLogDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(225)
  rejectionReason?: string;
}
