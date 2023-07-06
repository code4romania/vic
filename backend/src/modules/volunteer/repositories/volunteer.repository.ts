import { InjectRepository } from '@nestjs/typeorm';
import { format, subYears } from 'date-fns';
import { DATE_CONSTANTS } from 'src/common/constants/constants';
import { AgeRangeEnum } from 'src/common/enums/age-range.enum';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { VolunteerEntity } from '../entities/volunteer.entity';
import { VolunteerStatus } from '../enums/volunteer-status.enum';
import { IVolunteerRepository } from '../intefaces/volunteer-repository.interface';
import {
  CountVolunteerOptions,
  CreateVolunteerOptions,
  FindManyVolunteersOptions,
  FindVolunteerOptions,
  IVolunteerModel,
  UpdateVolunteerOptions,
  VolunteerModelTransformer,
} from '../model/volunteer.model';

export class VolunteerRepositoryService
  extends RepositoryWithPagination<VolunteerEntity>
  implements IVolunteerRepository
{
  constructor(
    @InjectRepository(VolunteerEntity)
    private readonly volunteerRepository: Repository<VolunteerEntity>,
  ) {
    super(volunteerRepository);
  }

  public async findAll(
    options: FindVolunteerOptions,
  ): Promise<IVolunteerModel[]> {
    const volunteers = await this.volunteerRepository.find({
      where: options,
      relations: { organization: true },
    });
    return volunteers.map(VolunteerModelTransformer.fromEntity);
  }

  async findMany(
    findOptions: FindManyVolunteersOptions,
  ): Promise<Pagination<IVolunteerModel>> {
    const {
      orderBy,
      orderDirection,
      organizationId,
      status,
      search,
      branch,
      department,
      role,
      city,
      county,
      age,
      activeSinceStart,
      activeSinceEnd,
    } = findOptions;

    let query = this.volunteerRepository
      .createQueryBuilder('volunteer')
      .leftJoinAndMapOne(
        'volunteer.volunteerProfile',
        'volunteer.volunteerProfile',
        'volunteerProfile',
      )
      .leftJoinAndMapOne(
        'volunteerProfile.branch',
        'volunteerProfile.branch',
        'branch',
      )
      .leftJoinAndMapOne(
        'volunteerProfile.role',
        'volunteerProfile.role',
        'role',
      )
      .leftJoinAndMapOne(
        'volunteerProfile.department',
        'volunteerProfile.department',
        'department',
      )
      .leftJoinAndMapOne('volunteer.user', 'volunteer.user', 'user')
      .leftJoinAndMapOne('user.location', 'user.location', 'location')
      .leftJoinAndMapOne('location.county', 'location.county', 'county')
      .leftJoinAndMapOne(
        'volunteer.organization',
        'volunteer.organization',
        'organization',
      )
      .leftJoinAndMapOne(
        'volunteer.blockedBy',
        'volunteer.blockedBy',
        'blockedBy',
      )
      .leftJoinAndMapOne(
        'volunteer.archivedBy',
        'volunteer.archivedBy',
        'archivedBy',
      )
      .select()
      .where(
        'volunteer.organizationId = :organizationId AND status = :status',
        { organizationId, status },
      )
      .orderBy(
        this.buildOrderByQuery(orderBy || 'createdOn', 'volunteer'),
        orderDirection || OrderDirection.ASC,
      );

    // map search query
    if (search) {
      query.andWhere(
        this.buildBracketSearchQuery(
          ['user.name', 'volunteerProfile.email', 'volunteerProfile.phone'],
          search,
        ),
      );
    }

    // branch
    if (branch) {
      query.andWhere('branch.name = :branch', { branch });
    }

    // department
    if (department) {
      query.andWhere('department.name = :department', {
        department,
      });
    }

    // branch
    if (role) {
      query.andWhere('role.name = :role', { role });
    }

    // location
    if (city && county) {
      query.andWhere(
        'location.name = :city AND county.abbreviation = :county',
        {
          city,
          county,
        },
      );
    }

    // birthday/age
    if (age) {
      query = this.addAgeRangeConditionToQuery(query, age);
    }

    // range
    if (activeSinceStart) {
      query = this.addRangeConditionToQuery(
        query,
        'volunteerProfile.activeSince',
        activeSinceStart,
        activeSinceEnd,
      );
    }

    return this.paginateQuery(
      query,
      findOptions.limit,
      findOptions.page,
      VolunteerModelTransformer.fromEntity,
    );
  }

  async findAllActiveByDepartmentIds(
    departmentIds: string[],
  ): Promise<IVolunteerModel[]> {
    const volunteers = await this.volunteerRepository.find({
      where: {
        status: VolunteerStatus.ACTIVE,
        volunteerProfile: {
          departmentId: In(departmentIds),
        },
      },
      relations: {
        volunteerProfile: true,
      },
    });

    return volunteers.map(VolunteerModelTransformer.fromEntity);
  }

  async update({
    id,
    ...updates
  }: UpdateVolunteerOptions): Promise<IVolunteerModel> {
    const toUpdate = await this.volunteerRepository.preload({ id, ...updates });

    if (!toUpdate) return null;

    await this.volunteerRepository.save(toUpdate);

    return this.find({ id });
  }

  async create(newVolunteer: CreateVolunteerOptions): Promise<IVolunteerModel> {
    const volunteer = await this.volunteerRepository.save(
      VolunteerModelTransformer.toEntity(newVolunteer),
    );

    return this.find({ id: volunteer.id });
  }

  async find(options: FindVolunteerOptions): Promise<IVolunteerModel> {
    // TODO: how and where to write a FindOptions to EntityWhereOptions mapper?
    const volunteer = await this.volunteerRepository.findOne({
      where: options,
      relations: {
        volunteerProfile: {
          branch: true,
          department: true,
          role: true,
        },
        user: {
          location: {
            county: true,
          },
          notificationsSettings: true,
        },
        archivedBy: true,
        blockedBy: true,
        organization: true,
      },
    });

    return VolunteerModelTransformer.fromEntity(volunteer);
  }

  async count(options: CountVolunteerOptions): Promise<number> {
    const { departmentIds, ...filters } = options;
    return this.volunteerRepository.count({
      where: {
        ...filters,
        ...(departmentIds?.length
          ? {
              volunteerProfile: {
                departmentId: In(departmentIds),
              },
            }
          : {}),
      },
    });
  }

  private addAgeRangeConditionToQuery(
    query: SelectQueryBuilder<VolunteerEntity>,
    ageRange: AgeRangeEnum,
  ): SelectQueryBuilder<VolunteerEntity> {
    switch (ageRange) {
      case AgeRangeEnum['0_18']:
        query.andWhere('user.birthday >= :date', {
          date: format(subYears(new Date(), 18), DATE_CONSTANTS.YYYY_MM_DD),
        });
        break;
      case AgeRangeEnum['18_30']:
        query.andWhere('user.birthday BETWEEN :startAge AND :endAge', {
          startAge: format(subYears(new Date(), 30), DATE_CONSTANTS.YYYY_MM_DD),
          endAge: format(subYears(new Date(), 19), DATE_CONSTANTS.YYYY_MM_DD),
        });
        break;
      case AgeRangeEnum['30_50']:
        query.andWhere('user.birthday BETWEEN :startAge AND :endAge', {
          startAge: format(subYears(new Date(), 50), DATE_CONSTANTS.YYYY_MM_DD),
          endAge: format(subYears(new Date(), 31), DATE_CONSTANTS.YYYY_MM_DD),
        });
        break;
      case AgeRangeEnum['OVER_50']:
        query.andWhere('user.birthday <= :date', {
          date: format(subYears(new Date(), 50), DATE_CONSTANTS.YYYY_MM_DD),
        });
        break;
    }

    return query;
  }
}
