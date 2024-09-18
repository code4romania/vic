import { IsOptional, IsString } from 'class-validator';

export class RejectDocumentContractByNgoDTO {
  @IsString()
  @IsOptional()
  rejectionReason: string;
}
