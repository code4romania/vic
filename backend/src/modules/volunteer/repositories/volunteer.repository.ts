import { InjectRepository } from '@nestjs/typeorm';
import { RepositoryWithPagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { Repository } from 'typeorm';
import { VolunteerEntity } from '../entities/volunteer.entity';
import { IVolunteerRepository } from '../intefaces/volunteer-repository.interface';
import {
  CreateVolunteerOptions,
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
        volunteerProfile: true,
        archivedBy: true,
        blockedBy: true,
        organization: true,
        user: true,
      },
    });

    return VolunteerModelTransformer.fromEntity(volunteer);
  }
}
