import {
  DeleteVolunteerUsecase,
  IDeletedVolunteerData,
} from 'src/usecases/volunteer/delete-volunteer.usecase';
import {
  GetVolunteerEventsUseCase,
  IVolunteerEvents,
  IVolunteerStats,
} from 'src/usecases/volunteer/get-volunteer-events.usecase';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiHeader,
  ApiParam,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  IMPORT_MAX_BYTES,
  ImportVolunteersResult,
  ImportVolunteersUseCase,
} from 'src/usecases/volunteer/import-volunteers.usecase';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { GetManyVolunteersUseCase } from 'src/usecases/volunteer/get-many-volunteers.usecase';
import { GetVolunteersDto } from './dto/get-volunteers.dto';
import { ActivateVolunteerUsecase } from 'src/usecases/volunteer/activate-volunteer.usecase';
import { ArchiveVolunteerUsecase } from 'src/usecases/volunteer/archive-volunteer.usescase';
import { BlockVolunteerUsecase } from 'src/usecases/volunteer/block-volunteer.usecase';
import { GetOneVolunteerUsecase } from 'src/usecases/volunteer/get-one-volunteer.usecase';
import { VolunteerGuard } from './guards/volunteer.guard';
import { VolunteerPresenter } from './presenters/volunteer.presenter';
import { UpdateVolunteerProfileDto } from '../_mobile/volunteer/dto/update-volunteer-profile.dto';
import { UpdateVolunteerProfileUsecase } from 'src/usecases/volunteer/update-volunteer-profile.usecase';
import { jsonToExcelBuffer } from 'src/common/helpers/utils';
import { IVolunteerDownload } from 'src/modules/volunteer/intefaces/volunteer-download.interface';
import { GetVolunteersForDownloadUseCase } from 'src/usecases/volunteer/get-many-for-download-volunteer.usecase';
import { Response } from 'express';
import { GetVolunteerReportUseCase } from 'src/usecases/volunteer/get-volunteer-report.usecase';
import { UpdateVolunteerDetailsDto } from './dto/update-volunteer-details.dto';
import { UpdateVolunteerDetailsUsecase } from 'src/usecases/volunteer/update-volunteer-details.usecase';
import { AddVolunteerUseCase } from 'src/usecases/volunteer/add-volunteer.usecase';
import { AddVolunteerDto } from './dto/add-volunteer.dto';
import {
  SENSITIVE_CODE_HEADER,
  SensitiveActionUsecase,
} from 'src/usecases/security/sensitive-action.usecase';
import { IWebRequestUser } from 'src/modules/auth/interfaces/request-user.interface';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard, VolunteerGuard)
@Controller('volunteer')
export class VolunteerController {
  constructor(
    private readonly deleteVolunteerUsecase: DeleteVolunteerUsecase,
    private readonly getOneVolunteerUsecase: GetOneVolunteerUsecase,
    private readonly getVolunteerEventsUseCase: GetVolunteerEventsUseCase,
    private readonly getVolunteerReportUseCase: GetVolunteerReportUseCase,
    private readonly getManyVolunteersUsecase: GetManyVolunteersUseCase,
    private readonly blockVolunteerUsecase: BlockVolunteerUsecase,
    private readonly activateVolunteerUsecase: ActivateVolunteerUsecase,
    private readonly archiveVolunteerUsecase: ArchiveVolunteerUsecase,
    private readonly updateVolunteerProfileUsecase: UpdateVolunteerProfileUsecase,
    private readonly getVolunteersForDownloadUseCase: GetVolunteersForDownloadUseCase,
    private readonly updateVolunteerDetailsUsecase: UpdateVolunteerDetailsUsecase,
    private readonly addVolunteerUseCase: AddVolunteerUseCase,
    private readonly importVolunteersUseCase: ImportVolunteersUseCase,
    private readonly sensitiveActionUsecase: SensitiveActionUsecase,
  ) {}

  // #473: import Candidates from a CSV or Excel file (`file`)
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description:
            'CSV (UTF-8) or Excel, header row: Prenume, Nume, Email, Telefon, Localitate, Județ, Departament',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', { limits: { fileSize: IMPORT_MAX_BYTES } }),
  )
  @Post('import')
  async import(
    @UploadedFile() file: Express.Multer.File,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<ImportVolunteersResult> {
    return this.importVolunteersUseCase.execute(file, admin);
  }

  // #471: add a volunteer by hand, as Candidate or Active
  @ApiBody({ type: AddVolunteerDto })
  @Post()
  async add(
    @Body() data: AddVolunteerDto,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.addVolunteerUseCase.execute(data, admin);
    return new VolunteerPresenter(volunteer);
  }

  @Get()
  @ApiPaginatedResponse(VolunteerPresenter)
  async getMany(
    @Query() filters: GetVolunteersDto,
    @ExtractUser() user: IAdminUserModel,
  ): Promise<PaginatedPresenter<VolunteerPresenter>> {
    const volunteers = await this.getManyVolunteersUsecase.execute({
      organizationId: user.organizationId,
      ...filters,
    });

    return new PaginatedPresenter({
      ...volunteers,
      items: volunteers.items.map(
        (volunteer) => new VolunteerPresenter(volunteer),
      ),
    });
  }

  @Get('download')
  @ApiHeader({ name: SENSITIVE_CODE_HEADER, required: true })
  async downloadAccessRequests(
    @Res({ passthrough: true }) res: Response,
    @ExtractUser() user: IWebRequestUser,
    @Query() filters: GetVolunteersDto,
    @Headers(SENSITIVE_CODE_HEADER) code: string,
  ): Promise<void> {
    // #593: the volunteers' personal data leaves VIC only after the emailed code
    await this.sensitiveActionUsecase.verify(user, code);

    const data = await this.getVolunteersForDownloadUseCase.execute({
      ...filters,
      organizationId: user.organizationId,
    });

    // set here, so an error above answers JSON
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="Voluntari.xlsx"',
    });
    res.end(jsonToExcelBuffer<IVolunteerDownload>(data, 'Voluntari'));
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(
    @Param('id', UuidValidationPipe) volunteerId: string,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.getOneVolunteerUsecase.execute(volunteerId);
    return new VolunteerPresenter(volunteer);
  }

  // #480: total approved hours and number of events
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id/stats')
  async getStats(
    @Param('id', UuidValidationPipe) volunteerId: string,
  ): Promise<IVolunteerStats> {
    return this.getVolunteerEventsUseCase.stats(volunteerId);
  }

  // #485: the volunteer's events, upcoming and finished, read only
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id/events')
  async getEvents(
    @Param('id', UuidValidationPipe) volunteerId: string,
  ): Promise<IVolunteerEvents> {
    return this.getVolunteerEventsUseCase.execute(volunteerId);
  }

  // #479: the full report as a PDF download
  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id/report')
  async getReport(
    @Param('id', UuidValidationPipe) volunteerId: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { fileName, pdf } =
      await this.getVolunteerReportUseCase.execute(volunteerId);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });
    res.end(pdf);
  }

  // #484: delete the volunteer and all their data in this NGO; final
  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(
    @Param('id', UuidValidationPipe) volunteerId: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<IDeletedVolunteerData> {
    return this.deleteVolunteerUsecase.execute(volunteerId, admin);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/archive')
  async archive(
    @Param('id', UuidValidationPipe) volunteerId: string,
    @ExtractUser() user: IAdminUserModel,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.archiveVolunteerUsecase.execute(
      volunteerId,
      user,
    );
    return new VolunteerPresenter(volunteer);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/block')
  async block(
    @Param('id', UuidValidationPipe) volunteerId: string,
    @ExtractUser() user: IAdminUserModel,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.blockVolunteerUsecase.execute(
      volunteerId,
      user,
    );
    return new VolunteerPresenter(volunteer);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Patch(':id/activate')
  async activate(
    @Param('id', UuidValidationPipe) volunteerId: string,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.activateVolunteerUsecase.execute(
      volunteerId,
      admin,
    );
    return new VolunteerPresenter(volunteer);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateVolunteerDetailsDto })
  @Patch(':id/details')
  async updateDetails(
    @Param('id', UuidValidationPipe) volunteerId: string,
    @Body() details: UpdateVolunteerDetailsDto,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.updateVolunteerDetailsUsecase.execute(
      volunteerId,
      details,
      admin,
    );
    return new VolunteerPresenter(volunteer);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: UpdateVolunteerProfileDto })
  @Patch(':id')
  async update(
    @Param('id', UuidValidationPipe) volunteerId: string,
    @Body() updatesDTO: UpdateVolunteerProfileDto,
    @ExtractUser() admin: IAdminUserModel,
  ): Promise<VolunteerPresenter> {
    const volunteer = await this.updateVolunteerProfileUsecase.execute(
      volunteerId,
      updatesDTO,
      admin,
    );
    return new VolunteerPresenter(volunteer);
  }
}
