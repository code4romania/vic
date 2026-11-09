import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { ContractEntity } from '../entities/contract.entity';
import { IContractRepository } from '../interfaces/contract-repository.interface';
import {
  CreateContractOptions,
  IContractModel,
  FindManyContractOptions,
  ContractTransformer,
  FindContractOptions,
  UpdateContractOptions,
} from '../models/contract.model';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { ClientContractStatus } from '../enums/client-contract-status.enum';
import { ContractStatus } from '../enums/contract-status.enum';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';

@Injectable()
export class ContractRepositoryService
  extends RepositoryWithPagination<ContractEntity>
  implements IContractRepository
{
  constructor(
    @InjectRepository(ContractEntity)
    private readonly contractRepository: Repository<ContractEntity>,
  ) {
    super(contractRepository);
  }

  async create(newContract: CreateContractOptions): Promise<IContractModel> {
    const contract = await this.contractRepository.save(
      ContractTransformer.toEntity(newContract),
    );

    return this.find({ id: contract.id });
  }

  async findMany(
    findOptions: FindManyContractOptions,
  ): Promise<Pagination<IContractModel>> {
    const {
      orderBy,
      orderDirection,
      organizationId,
      status,
      search,
      startDate,
      endDate,
      volunteerName,
      volunteerId,
      type,
    } = findOptions;

    const query = this.contractRepository
      .createQueryBuilder('contract')
      .withDeleted()
      .leftJoinAndMapOne(
        'contract.organization',
        'contract.organization',
        'organization',
      )
      .leftJoinAndMapOne('contract.template', 'contract.template', 'template')
      .leftJoinAndMapOne(
        'contract.volunteer',
        'contract.volunteer',
        'volunteer',
      )
      .leftJoinAndMapOne('volunteer.user', 'volunteer.user', 'user')
      .select()
      .where(
        'contract.organizationId = :organizationId and volunteer.status = :volunteerStatus',
        {
          organizationId,
          volunteerStatus: VolunteerStatus.ACTIVE,
        },
      )
      .orderBy(
        this.buildOrderByQuery(orderBy || 'createdOn', 'contract'),
        orderDirection || OrderDirection.ASC,
      );

    // map search query
    if (search) {
      query.andWhere(
        this.buildBracketSearchQuery(
          ['contract.contractNumber', 'user.name'],
          search,
        ),
      );
    }

    if (startDate) {
      query.andWhere('contract.startDate >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('contract.endDate <= :endDate', { endDate });
    }

    if (status) {
      query.andWhere(contractStatusCondition(status, 'contract'), {
        statusNow: new Date(),
        activeStatus: ContractStatus.ACTIVE,
      });
    }

    if (volunteerName) {
      query.andWhere('user.name = :volunteerName', {
        volunteerName,
      });
    }

    if (volunteerId) {
      query.andWhere('contract.volunteerId = :volunteerId', { volunteerId });
    }

    if (type) {
      query.andWhere('contract.type = :type', { type });
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      ContractTransformer.fromEntity,
    );
  }

  async find(findOptions: FindContractOptions): Promise<IContractModel> {
    const contract = await this.contractRepository.findOne({
      where: findOptions,
      relations: {
        volunteer: {
          user: {
            notificationsSettings: true,
          },
        },
        template: true,
        createdByAdmin: true,
      },
      withDeleted: true,
    });

    return ContractTransformer.fromEntity(contract);
  }

  async update(
    id: string,
    updates: UpdateContractOptions,
  ): Promise<IContractModel> {
    const contractToUpdate = await this.contractRepository.preload({
      id,
      ...updates,
    });

    await this.contractRepository.save(contractToUpdate);

    return this.find({ id });
  }

  async delete(id: string): Promise<string> {
    const contract = await this.contractRepository.findOneBy({ id });

    if (contract) {
      await this.contractRepository.remove(contract);
      return id;
    }

    return null;
  }

  // #488: how many contracts of an organization show the given status ("În așteptare" on the dashboard)
  async countByStatus(
    organizationId: string,
    status: ClientContractStatus,
  ): Promise<number> {
    return this.contractRepository
      .createQueryBuilder('contract')
      .where('contract.organizationId = :organizationId', { organizationId })
      .andWhere(contractStatusCondition(status, 'contract'), {
        statusNow: new Date(),
        activeStatus: ContractStatus.ACTIVE,
      })
      .getCount();
  }
}

// #488: the SQL behind each shown status. Uses :statusNow and :activeStatus.
export const contractStatusCondition = (
  status: ClientContractStatus,
  alias: string,
): string => {
  const pastEnd = `(${alias}.endDate IS NOT NULL AND ${alias}.endDate < :statusNow)`;
  switch (status) {
    case ClientContractStatus.EXPIRED:
      return pastEnd;
    case ClientContractStatus.SIGNED:
      return `(${alias}.status = :activeStatus AND NOT ${pastEnd})`;
    default:
      return `(${alias}.status <> :activeStatus AND NOT ${pastEnd})`;
  }
};
