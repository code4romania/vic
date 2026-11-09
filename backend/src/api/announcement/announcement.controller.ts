import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { CreateAnnouncementUseCase } from 'src/usecases/announcement/create-announcement.usecase';
import { DeleteAnnouncementUseCase } from 'src/usecases/announcement/delete-announcement.usecase';
import { GetManyAnnouncementUseCase } from 'src/usecases/announcement/get-many-announcement.usecase';
import { GetOneAnnouncementUseCase } from 'src/usecases/announcement/get-one-announcement.usecase';
import { UpdateAnnouncementUseCase } from 'src/usecases/announcement/update-announcement.usecase';
import { ChangeAnnouncementStatusUseCase } from 'src/usecases/announcement/change-announcement-status.usecase';
import { AnnouncementStatus } from 'src/modules/announcement/enums/announcement-status.enum';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { GetManyAnnouncementDto } from './dto/get-many-announcement.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';
import { AnnouncementGuard } from './guards/announcement.guard';
import { AnnouncementPresenter } from './presenters/announcement.presenter';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard, AnnouncementGuard)
@Controller('announcement')
export class AnnouncementController {
  constructor(
    private readonly getManyAnnouncementUseCase: GetManyAnnouncementUseCase,
    private readonly createAnnouncementUseCase: CreateAnnouncementUseCase,
    private readonly updateAnnouncementUseCase: UpdateAnnouncementUseCase,
    private readonly deleteAnnouncementUseCase: DeleteAnnouncementUseCase,
    private readonly getOneAnnouncementUseCase: GetOneAnnouncementUseCase,
    private readonly changeAnnouncementStatusUseCase: ChangeAnnouncementStatusUseCase,
  ) {}

  @Get()
  @ApiPaginatedResponse(AnnouncementPresenter)
  async getAll(
    @Query() filters: GetManyAnnouncementDto,
    @ExtractUser() { organizationId }: IAdminUserModel,
  ): Promise<PaginatedPresenter<AnnouncementPresenter>> {
    const announcements = await this.getManyAnnouncementUseCase.execute({
      ...filters,
      organizationId,
    });

    return new PaginatedPresenter<AnnouncementPresenter>({
      ...announcements,
      items: announcements.items.map(
        (announcement) => new AnnouncementPresenter(announcement),
      ),
    });
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(@Param('id') id: string): Promise<AnnouncementPresenter> {
    const announcement = await this.getOneAnnouncementUseCase.execute({ id });

    return new AnnouncementPresenter(announcement);
  }

  @ApiBody({ type: CreateAnnouncementDto })
  @Post()
  async create(
    @Body() createAnnouncementDto: CreateAnnouncementDto,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<AnnouncementPresenter> {
    const announcement = await this.createAnnouncementUseCase.execute(
      {
        ...createAnnouncementDto,
        organizationId: admin.organizationId,
      },
      admin,
    );

    return new AnnouncementPresenter(announcement);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateAnnouncementDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) id: string,
    @Body() updateAnnouncementDto: UpdateAnnouncementDto,
  ): Promise<AnnouncementPresenter> {
    const announcement = await this.updateAnnouncementUseCase.execute(
      id,
      updateAnnouncementDto,
    );

    return new AnnouncementPresenter(announcement);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/activate')
  async activate(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<AnnouncementPresenter> {
    return new AnnouncementPresenter(
      await this.changeAnnouncementStatusUseCase.execute(
        id,
        AnnouncementStatus.ACTIVE,
        admin,
      ),
    );
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/deactivate')
  async deactivate(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<AnnouncementPresenter> {
    return new AnnouncementPresenter(
      await this.changeAnnouncementStatusUseCase.execute(
        id,
        AnnouncementStatus.INACTIVE,
        admin,
      ),
    );
  }

  // Archiving is manual and final (VIC 2.0, #503)
  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/archive')
  async archive(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<AnnouncementPresenter> {
    return new AnnouncementPresenter(
      await this.changeAnnouncementStatusUseCase.execute(
        id,
        AnnouncementStatus.ARCHIVED,
        admin,
      ),
    );
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(
    @Param('id', UuidValidationPipe) id: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<string> {
    return this.deleteAnnouncementUseCase.execute(id, admin);
  }
}
