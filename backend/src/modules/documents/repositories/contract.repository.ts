import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { In, LessThanOrEqual, MoreThanOrEqual, Not, Repository } from 'typeorm';
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
      pending,
      contractStatus,
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
      if (status === ClientContractStatus.NOT_STARTED) {
        query.andWhere(
          'contract.startDate > :date AND contract.status = :status',
          {
            date: new Date(),
            status: ContractStatus.APPROVED,
          },
        );
      } else if (status === ClientContractStatus.ACTIVE) {
        query.andWhere(
          'contract.startDate <= :date AND contract.endDate >= :date AND contract.status = :status',
          { date: new Date(), status: ContractStatus.APPROVED },
        );
      } else if (status === ClientContractStatus.CLOSED) {
        query.andWhere(
          'contract.endDate <= :date AND contract.status = :status',
          {
            date: new Date(),
            status: ContractStatus.APPROVED,
          },
        );
      } else {
        query.andWhere('contract.status = :status', { status });
      }
    }

    if (contractStatus) {
      query.andWhere('contract.status = :contractStatus', {
        contractStatus,
      });
    }

    // get all pending
    if (pending) {
      query.andWhere(
        '(contract.status = :pendingVolunteer OR contract.status = :pendingAdmin)',
        {
          pendingVolunteer: ContractStatus.PENDING_VOLUNTEER,
          pendingAdmin: ContractStatus.PENDING_ADMIN,
        },
      );
    }

    if (volunteerName) {
      query.andWhere('user.name = :volunteerName', {
        volunteerName,
      });
    }

    if (volunteerId) {
      query.andWhere('contract.volunteerId = :volunteerId', { volunteerId });
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      ContractTransformer.fromEntity,
    );
  }

  async find(findOptions: FindContractOptions): Promise<IContractModel> {
    const { startDate, ...options } = findOptions;

    const contract = await this.contractRepository.findOne({
      where: {
        ...options,
        ...(startDate
          ? {
              startDate: LessThanOrEqual(startDate),
              endDate: MoreThanOrEqual(startDate),
              status: Not(ContractStatus.REJECTED),
            }
          : {}),
      },
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

  async count(findOptions: FindContractOptions): Promise<number> {
    const { statuses, ...options } = findOptions;
    const count = await this.contractRepository.count({
      where: { ...options, status: In(statuses) },
    });
    return count;
  }
}
