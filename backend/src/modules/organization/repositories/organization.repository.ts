import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ArrayOfPropetyType } from 'src/common/helpers/typescript-extends';
import { Brackets, EntityManager, Repository } from 'typeorm';
import { OrganizationEntity } from '../entities/organization.entity';
import { IOrganizationRepository } from '../interfaces/organization-repository.interface';
import {
  FindManyOrganizationsOptions,
  ICreateOrganizationModel,
  IFindOrganizationModel,
  IOrganizationModel,
  OrganizationTransformer,
  OrganizationUniqueFields,
  UpdateOrganizationOptions,
} from '../models/organization.model';
import { OrganizationStatus } from '../enums/organization-status.enum';

// What volunteers may see in the app (decision 1): confirmed (active, not pending or suspended) and validated.
const VISIBLE_TO_VOLUNTEERS =
  'organization.status = :visibleStatus AND organization.validated_at IS NOT NULL';
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
    manager?: EntityManager,
  ): Promise<IOrganizationModel> {
    // create organization entity
    const newOrganizationEntity =
      OrganizationTransformer.toEntity(organization);

    // save organization entity
    const organizationEntity = await this.repositoryFor(manager).save(
      newOrganizationEntity,
    );

    // return organization model
    return OrganizationTransformer.fromEntity(organizationEntity);
  }

  public async update(
    id: string,
    options: UpdateOrganizationOptions,
    manager?: EntityManager,
  ): Promise<IOrganizationModel> {
    if (!id) return null;

    // update organization entity
    await this.repositoryFor(manager).update({ id }, options);

    // return organization model
    const entity = await this.repositoryFor(manager).findOne({ where: { id } });
    return OrganizationTransformer.fromEntity(entity);
  }

  // Organizations other than `exceptId` that already use one of these values, ignoring case.
  public async findConflicts(
    fields: OrganizationUniqueFields,
    exceptId?: string,
  ): Promise<IOrganizationModel[]> {
    const checks = Object.entries(fields).filter(([, value]) => !!value);
    if (!checks.length) return [];

    const columns: Record<string, string> = {
      name: 'organization.name',
      email: 'organization.email',
      phone: 'organization.phone',
      taxId: 'organization.taxId',
    };
    const query = this.organizationRepository
      .createQueryBuilder('organization')
      .where(
        new Brackets((qb) => {
          checks.forEach(([field, value], index) => {
            qb.orWhere(
              `lower(trim(${columns[field]})) = lower(trim(:v${index}))`,
              {
                [`v${index}`]: value,
              },
            );
          });
        }),
      );
    if (exceptId) {
      query.andWhere('organization.id <> :exceptId', { exceptId });
    }

    return (await query.getMany()).map(OrganizationTransformer.fromEntity);
  }

  // Confirmed by their first admin, waiting for a super admin.
  public async findPendingValidation(): Promise<IOrganizationModel[]> {
    const entities = await this.organizationRepository
      .createQueryBuilder('organization')
      .where('organization.status = :status', {
        status: OrganizationStatus.ACTIVE,
      })
      .andWhere('organization.validated_at IS NULL')
      .orderBy('organization.created_on', 'ASC')
      .getMany();

    return entities.map(OrganizationTransformer.fromEntity);
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
        statuses: [VolunteerStatus.ACTIVE, VolunteerStatus.INACTIVE],
      })
      .andWhere(VISIBLE_TO_VOLUNTEERS, {
        visibleStatus: OrganizationStatus.ACTIVE,
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
      .andWhere(VISIBLE_TO_VOLUNTEERS, {
        visibleStatus: OrganizationStatus.ACTIVE,
      })
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
    // Organizations where the user is an active volunteer, plus those where the organization made
    // them inactive: they can still see the organization and download documents (#472, #589).
    // Inactive after leaving by themselves (archived_by = the user) is not "mine" any more.
    const organizationEntities = await this.organizationRepository
      .createQueryBuilder('organization')
      .innerJoinAndSelect(
        'organization.volunteers',
        'volunteers',
        'volunteers.userId = :userId',
        { userId },
      )
      .where(
        new Brackets((qb) =>
          qb
            .where('volunteers.status = :active', {
              active: VolunteerStatus.ACTIVE,
            })
            .orWhere(
              'volunteers.status = :inactive AND volunteers.archivedById IS DISTINCT FROM :userId',
              { inactive: VolunteerStatus.INACTIVE },
            ),
        ),
      )
      .getMany();

    return organizationEntities.map((entity) =>
      OrganizationVolunteerTransformer.fromEntity(entity, userId),
    );
  }

  public count(): Promise<number> {
    return this.organizationRepository.count();
  }

  private repositoryFor(
    manager?: EntityManager,
  ): Repository<OrganizationEntity> {
    return manager
      ? manager.getRepository(OrganizationEntity)
      : this.organizationRepository;
  }
}
