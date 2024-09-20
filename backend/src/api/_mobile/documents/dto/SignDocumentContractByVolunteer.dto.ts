import { IsString, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SignDocumentContractByVolunteerDto {
  @ApiProperty({ description: 'The ID of the organization' })
  @IsUUID()
  organizationId: string;

  @ApiProperty({ description: 'Base64 encoded volunteer signature' })
  @IsString()
  volunteerSignatureBase64: string;

  @ApiPropertyOptional({
    description: 'Base64 encoded legal guardian signature',
  })
  @IsOptional()
  @IsString()
  legalGuardianSignatureBase64?: string;
}
