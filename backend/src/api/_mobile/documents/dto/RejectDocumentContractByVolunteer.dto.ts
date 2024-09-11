import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectDocumentContractByVolunteerDto {
  @ApiProperty({ description: 'Organization ID' })
  @IsString()
  organizationId: string;

  @ApiProperty({ description: 'Reason for rejecting the contract' })
  @IsString()
  @IsOptional()
  reason?: string;
}
