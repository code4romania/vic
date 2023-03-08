import { InjectRepository } from '@nestjs/typeorm';
import { format, subYears } from 'date-fns';
import { DATE_CONSTANTS } from 'src/common/constants/constants';
import { AgeRangeEnum } from 'src/common/enums/age-range.enum';
import { OrderDirection } from 'src/common/enums/order-direction.enum';
import {
  Pagination,
  RepositoryWithPagination,
} from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { VolunteerEntity } from '../entities/volunteer.entity';
import { IVolunteerRepository } from '../intefaces/volunteer-repository.interface';
import {
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

  async findMany(
    findOptions: FindManyVolunteersOptions,
  ): Promise<Pagination<IVolunteerModel>> {
    const {
      orderBy,
      orderDirection,
      organizationId,
      status,
      search,
      branchId,
      departmentId,
      roleId,
      locationId,
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
    if (branchId) {
      query.andWhere('volunteerProfile.branchId = :branchId', { branchId });
    }

    // department
    if (departmentId) {
      query.andWhere('volunteerProfile.departmentId = :departmentId', {
        departmentId,
      });
    }

    // branch
    if (roleId) {
      query.andWhere('volunteerProfile.roleId = :roleId', { roleId });
    }

    // location
    if (locationId) {
      query.andWhere('location.id = :locationId', { locationId });
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

  async update({
    id,
    ...updates
  }: UpdateVolunteerOptions): Promise<IVolunteerModel> {
    await this.volunteerRepository.update({ id }, updates);

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
        },
        archivedBy: true,
        blockedBy: true,
        organization: true,
      },
    });

    return VolunteerModelTransformer.fromEntity(volunteer);
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
