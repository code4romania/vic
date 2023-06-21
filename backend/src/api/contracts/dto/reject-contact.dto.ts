import { IsOptional, IsString } from 'class-validator';

export class RejectContractDto {
  @IsOptional()
  @IsString()
  rejectionReason: string;
}
