import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayOfPropetyType } from 'src/common/helpers/typescript-extends';
import { Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { IOrganizationRepository } from '../interfaces/organization-repository.interface';
import {
  FindManyOrganizationsOptions,
  ICreateOrganizationModel,
  IFindOrganizationModel,
  IOrganizationModel,
  IUpdateOrganizationModel,
  OrganizationTransformer,
} from '../models/organization.model';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import {
  IOrganizationWithVolunteersModel,
  OrganizationWithVolunteersTransformer,
} from '../models/organization-with-volunteers.model';
import {
  IOrganizationWithEventsModel,
  OrganizationWithEventTransformer,
} from '../models/organization-with-events.model';
import { EventEntity } from 'src/modules/event/entities/event.entity';
import { EventStatus } from 'src/modules/event/enums/event-status.enum';
import {
  IOrganizationVolunteerModel,
  OrganizationVolunteerTransformer,
} from '../models/organization-volunteer.models';

@Injectable()
export class OrganizationRepositoryService
  extends RepositoryWithPagination<OrganizationEntity>
  implements IOrganizationRepository
{
  constructor(
    @InjectRepository(OrganizationEntity)
    private readonly organizationRepository: Repository<OrganizationEntity>,
  ) {
    super(organizationRepository);
  }

  public async create(
    organization: ICreateOrganizationModel,
  ): Promise<IOrganizationModel> {
    // create organization entity
    const newOrganizationEntity =
      OrganizationTransformer.toEntity(organization);

    // save organization entity
    const organizationEntity = await this.organizationRepository.save(
      newOrganizationEntity,
    );

    // return organization model
    return OrganizationTransformer.fromEntity(organizationEntity);
  }

  public async update(
    id: string,
    updates: IUpdateOrganizationModel,
  ): Promise<IOrganizationModel> {
    // update organization entity
    await this.organizationRepository.update({ id }, { ...updates });

    // return organization model
    return this.find({ id });
  }

  public async find(
    options:
      | Partial<IFindOrganizationModel>
      | ArrayOfPropetyType<IFindOrganizationModel>,
  ): Promise<IOrganizationModel> {
    // get organization entity by id
    const organizationEntity = await this.organizationRepository.findOne({
      where: options,
    });

    // return organization model
    return organizationEntity
      ? OrganizationTransformer.fromEntity(organizationEntity)
      : null;
  }

  public async findMany(
    findOptions: FindManyOrganizationsOptions,
  ): Promise<Pagination<IOrganizationWithVolunteersModel>> {
    const { orderBy, search, orderDirection, userId } = findOptions;

    const query = this.organizationRepository
      .createQueryBuilder('organization')
      .loadRelationCountAndMap(
        'organization.numberOfVolunteers',
        `organization.volunteers`,
        'numberOfVolunteers',
        (qb) =>
          qb.where(`"numberOfVolunteers"."status" = :status`, {
            status: VolunteerStatus.ACTIVE,
          }),
      )
      .select()
      .leftJoin(
        'organization.volunteers',
        'volunteer',
        'volunteer.userId = :userId AND volunteer.organizationId = organization.id',
        {
          userId,
        },
      )
      .where('(volunteer.status IN (:...statuses) OR volunteer.id IS NULL)', {
        statuses: [VolunteerStatus.ACTIVE, VolunteerStatus.ARCHIVED],
      })
      .orderBy(
        this.buildOrderByQuery(orderBy || 'name', 'organization'),
        orderDirection || OrderDirection.ASC,
      );

    if (search) {
      query.andWhere(
        this.buildBracketSearchQuery(['organization.name'], search),
      );
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      OrganizationWithVolunteersTransformer.fromEntity,
    );
  }

  public async findWithEvents(
    organizationId: string,
    userId: string,
  ): Promise<IOrganizationWithEventsModel> {
    // get organization entity by id with upcoming public events
    const organizationEntity = await this.organizationRepository
      .createQueryBuilder('organization')
      .loadRelationCountAndMap(
        'organization.numberOfVolunteers',
        `organization.volunteers`,
        'numberOfVolunteers',
        (qb) =>
          qb.where(`"numberOfVolunteers"."status" = :status`, {
            status: VolunteerStatus.ACTIVE,
          }),
      )
      .select()
      .leftJoinAndSelect(
        'organization.events',
        'event',
        'event.isPublic = :isPublic AND (event.endDate > :date OR event.endDate IS NULL) AND event.status = :status',
        {
          isPublic: true,
          date: new Date(),
          status: EventStatus.PUBLISHED,
        },
      )
      .leftJoinAndSelect(
        'organization.volunteers',
        'volunteer',
        'volunteer.userId = :userId',
        {
          userId,
        },
      )
      .where('organization.id = :organizationId', { organizationId })
      .getOne();

    // return organization model
    return OrganizationWithEventTransformer.fromEntity(
      organizationEntity as OrganizationEntity & {
        events: EventEntity[];
        numberOfVolunteers: number;
      },
    );
  }

  public async findMyOrganizations(
    userId: string,
  ): Promise<IOrganizationVolunteerModel[]> {
    // get all organizations where this user has an active volunteer profile
    const organizationEntities = await this.organizationRepository.find({
      where: {
        volunteers: {
          userId,
          status: VolunteerStatus.ACTIVE,
        },
      },
      relations: {
        volunteers: true,
      },
    });

    return organizationEntities.map((entity) =>
      OrganizationVolunteerTransformer.fromEntity(entity, userId),
    );
  }

  public count(): Promise<number> {
    return this.organizationRepository.count();
  }
}
