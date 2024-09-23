import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignDocumentContractByNgoDto {
  @ApiProperty({ description: 'Base64 encoded legal representative signature' })
  @IsString()
  legalRepresentativeSignatureBase64: string;
}
