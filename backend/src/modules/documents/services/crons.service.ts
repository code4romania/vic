import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { In, LessThan, Not, Repository } from 'typeorm';
import { DocumentContractStatus } from '../enums/contract-status.enum';
import { InjectRepository } from '@nestjs/typeorm';
import { DocumentContractEntity } from '../entities/document-contract.entity';

@Injectable()
export class CronsService {
  constructor(
    @InjectRepository(DocumentContractEntity)
    private readonly documentContractRepository: Repository<DocumentContractEntity>,
  ) {}

  /**
   * At 01:00 (Server Time) every day.
   */
  @Cron('0 1 * * *')
  async checkForExpiredContracts() {
    // Get contracts that have a pending status and the contract's starting date is past.
    const contracts = await this.documentContractRepository.find({
      where: {
        status: Not(
          In([
            DocumentContractStatus.APPROVED,
            DocumentContractStatus.REJECTED_VOLUNTEER,
            DocumentContractStatus.REJECTED_NGO,
            DocumentContractStatus.ACTION_EXPIRED,
          ]),
        ),
        documentStartDate: LessThan(new Date()),
      },
    });

    for (const contract of contracts) {
      // 1. Update each contract with ACTION_EXPIRED status
      await this.documentContractRepository.update(contract.id, {
        status: DocumentContractStatus.ACTION_EXPIRED,
      });

      // 2. Send notification to volunteer
      // TODO: Send notification to volunteer
    }
  }
}
