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
import { APP_TIME_ZONE } from 'src/common/helpers/bucharest-time';
import { EXPIRING_SOON_DAYS } from '../models/contract.model';

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
      .where('contract.organizationId = :organizationId', { organizationId })
      .orderBy(
        this.buildOrderByQuery(orderBy || 'createdOn', 'contract'),
        orderDirection || OrderDirection.ASC,
      );

    // B9: a volunteer's own contracts (their tab on the web, their history in the app) whatever
    // their status; the organization's list shows the active and the inactive volunteers' ones
    // (inactive keeps read-only access, #589), like the counters.
    if (!volunteerId) {
      query.andWhere('volunteer.status IN (:...listedVolunteerStatuses)', {
        listedVolunteerStatuses: CONTRACT_LIST_VOLUNTEER_STATUSES,
      });
    }

    // map search query; case and diacritics insensitive
    if (search) {
      query.andWhere(
        this.buildAccentInsensitiveSearchQuery(
          ['contract.contractNumber', 'user.name', 'user.email'],
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
    return (
      this.contractRepository
        .createQueryBuilder('contract')
        .innerJoin('contract.volunteer', 'volunteer')
        .where('contract.organizationId = :organizationId', { organizationId })
        // B9: the same contracts as the list
        .andWhere('volunteer.status IN (:...listedVolunteerStatuses)', {
          listedVolunteerStatuses: CONTRACT_LIST_VOLUNTEER_STATUSES,
        })
        .andWhere(contractStatusCondition(status, 'contract'), {
          statusNow: new Date(),
          activeStatus: ContractStatus.ACTIVE,
        })
        .getCount()
    );
  }
}

// B9: whose contracts the organization's list and its counters show
export const CONTRACT_LIST_VOLUNTEER_STATUSES = [
  VolunteerStatus.ACTIVE,
  VolunteerStatus.INACTIVE,
];

// #488: the SQL behind each shown status. Uses :statusNow and :activeStatus.
// A contract is valid through its whole last day in Bucharest: it expires the day after its end
// date there, not at the stored instant (which is that day's midnight, UTC or local).
export const contractStatusCondition = (
  status: ClientContractStatus,
  alias: string,
): string => {
  const day = (expression: string): string =>
    `((${expression}) AT TIME ZONE '${APP_TIME_ZONE}')::date`;
  const today = day('CAST(:statusNow AS timestamptz)');
  const pastEnd = `(${alias}.endDate IS NOT NULL AND ${day(`${alias}.endDate`)} < ${today})`;
  switch (status) {
    case ClientContractStatus.EXPIRED:
      return pastEnd;
    case ClientContractStatus.SIGNED:
      return `(${alias}.status = :activeStatus AND NOT ${pastEnd})`;
    case ClientContractStatus.EXPIRING_SOON:
      // #489: signed, and its last day within the next EXPIRING_SOON_DAYS days
      return `(${alias}.status = :activeStatus AND NOT ${pastEnd} AND ${alias}.endDate IS NOT NULL AND ${day(`${alias}.endDate`)} <= ${today} + ${EXPIRING_SOON_DAYS})`;
    default:
      return `(${alias}.status <> :activeStatus AND NOT ${pastEnd})`;
  }
};
