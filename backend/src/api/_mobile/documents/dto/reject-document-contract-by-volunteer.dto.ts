import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectDocumentContractByVolunteerDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'Reason for rejecting the contract' })
  @IsString()
  @IsOptional()
  reason?: string;
}
