import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { DocumentContractStatistics } from 'src/modules/documents/models/document-contract.model';

export class DocumentContractStatisticsPresenter {
  constructor(statistics: DocumentContractStatistics) {
    this.pendingNgoRepresentativeSignature =
      statistics.pendingNgoRepresentativeSignature;
    this.pendingVolunteerSignature = statistics.pendingVolunteerSignature;
    this.activeContracts = statistics.activeContracts;
    this.soonToExpire = statistics.soonToExpire;
  }

  @Expose()
  @ApiProperty({
    description: 'The number of contracts pending NGO representative signature',
    example: 10,
  })
  pendingNgoRepresentativeSignature: number;

  @Expose()
  @ApiProperty({
    description: 'The number of contracts pending volunteer signature',
    example: 5,
  })
  pendingVolunteerSignature: number;

  @Expose()
  @ApiProperty({
    description: 'The number of active contracts',
    example: 20,
  })
  activeContracts: number;

  @Expose()
  @ApiProperty({
    description: 'The number of contracts soon to expire',
    example: 3,
  })
  soonToExpire: number;
}
