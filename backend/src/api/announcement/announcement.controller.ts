import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { CreateAnnouncementUseCase } from 'src/usecases/announcement/create-announcement.usecase';
import { DeleteAnnouncementUseCase } from 'src/usecases/announcement/delete-announcement.usecase';
import { GetAllAnnouncementUseCase } from 'src/usecases/announcement/get-all-announcement.usecase';
import { UpdateAnnouncementUseCase } from 'src/usecases/announcement/update-announcement.usecase';
import { GetOneOrganizationStructureUseCase } from 'src/usecases/organization/organization-structure/get-one-organization-structure.usecase';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AnnouncementGuard } from './guards/announcement.guard';
import { AnnouncementPresenter } from './presenters/announcement.presenter';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard, AnnouncementGuard)
@Controller('announcement')
export class AnnouncementController {
  constructor(
    private readonly getAllAnnouncementUseCase: GetAllAnnouncementUseCase,
    private readonly createAnnouncementUseCase: CreateAnnouncementUseCase,
    private readonly updateAnnouncementUseCase: UpdateAnnouncementUseCase,
    private readonly deleteAnnouncementUseCase: DeleteAnnouncementUseCase,
    private readonly getOneOrganizationStructureUseCase: GetOneOrganizationStructureUseCase,
  ) {}

  @Get()
  async getAll(
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<AnnouncementPresenter[]> {
    const announcements = await this.getAllAnnouncementUseCase.execute({
      organizationId,
    });

    return announcements.map(
      (announcement) => new AnnouncementPresenter(announcement),
    );
  }

  @ApiBody({ type: CreateAnnouncementDto })
  @Post()
  async create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<AnnouncementPresenter> {
    const targets = await Promise.all(
      createAnnouncementDto.targets.map(
        async (target) =>
          await this.getOneOrganizationStructureUseCase.execute({ id: target }),
      ),
    );
    const announcement = await this.createAnnouncementUseCase.execute({
      ...createAnnouncementDto,
      organizationId,
      targets: targets,
      publishedOn:
        createAnnouncementDto.status === AnnouncementStatus.PUBLISHED
          ? new Date()
          : null,
    });

    return new AnnouncementPresenter(announcement);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateAnnouncementDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<AnnouncementPresenter> {
    const targets = await Promise.all(
      updateAnnouncementDto.targets.map(
        async (target) =>
          await this.getOneOrganizationStructureUseCase.execute({ id: target }),
      ),
    );
    const announcement = await this.updateAnnouncementUseCase.execute({
      ...updateAnnouncementDto,
      id,
      targets: targets,
      publishedOn:
        updateAnnouncementDto.status === AnnouncementStatus.PUBLISHED
          ? new Date()
          : null,
    });

    return new AnnouncementPresenter(announcement);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(@Param('id', UuidValidationPipe) id: string): Promise<string> {
    return this.deleteAnnouncementUseCase.execute(id);
  }
}
