import { Body, Delete, Query, Header, Res } from '@nestjs/common';
import { Post } from '@nestjs/common';
import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiParam } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { ApproveAccessRequestUseCase } from 'src/usecases/access-request/approve-access-request.usecase';
import { GetAccessRequestUseCase } from 'src/usecases/access-request/get-access-request.usecase';
import { RejectAccessRequestUseCase } from 'src/usecases/access-request/reject-access-request.usecase';
import { RejectAccessRequestDto } from './dto/reject-access-request.dto';
import { AccessRequestPresenter } from './presenters/access-request.presenter';
import { AccessRequestGuard } from './guards/access-request.guard';
import { DeleteAccessRequestUseCase } from 'src/usecases/access-request/delete-access-request.usecase';
import { GetManyNewAccessRequestsUseCase } from 'src/usecases/access-request/get-many-new-access-requests.usecase';
import { GetManyRejectedAccessRequestsUseCase } from 'src/usecases/access-request/get-many-rejected-access-requests.usecase';
import { GetAccessRequestsDto } from './dto/get-access-requests.dto';
import {
  ApiPaginatedResponse,
  PaginatedPresenter,
} from 'src/infrastructure/presenters/generic-paginated.presenter';
import { Response } from 'express';
import { GetAccessRequestsForDownloadUseCase } from 'src/usecases/access-request/get-many-for-download-access-requests.usecase';
import { jsonToExcelBuffer } from 'src/common/helpers/utils';
import { IAccessRequestDownload } from 'src/modules/access-request/interfaces/access-request-download.interface';

@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard, AccessRequestGuard)
@Controller('access-request')
export class AccessRequestController {
  constructor(
    private readonly getAccessRequestUseCase: GetAccessRequestUseCase,
    private readonly getManyNewAccessRequestsUseCase: GetManyNewAccessRequestsUseCase,
    private readonly getManyRejectedAccessRequestsUseCase: GetManyRejectedAccessRequestsUseCase,
    private readonly approveAccessRequestUseCase: ApproveAccessRequestUseCase,
    private readonly rejectAccessRequestUseCase: RejectAccessRequestUseCase,
    private readonly deleteAccessRequestUseCase: DeleteAccessRequestUseCase,
    private readonly getAccessRequestsForDownloadUseCase: GetAccessRequestsForDownloadUseCase,
  ) {}

  @Get('/new')
  @ApiPaginatedResponse(AccessRequestPresenter)
  async getNew(
    @Query() filters: GetAccessRequestsDto,
    @ExtractUser() user: IAdminUserModel,
  ): Promise<PaginatedPresenter<AccessRequestPresenter>> {
    const accessRequests = await this.getManyNewAccessRequestsUseCase.execute({
      ...filters,
      organizationId: user.organizationId,
    });

    return new PaginatedPresenter({
      ...accessRequests,
      items: accessRequests.items.map(
        (accessRequest) => new AccessRequestPresenter(accessRequest),
      ),
    });
  }

  @Get('/rejected')
  @ApiPaginatedResponse(AccessRequestPresenter)
  async getRejected(
    @Query() filters: GetAccessRequestsDto,
    @ExtractUser() user: IAdminUserModel,
  ): Promise<PaginatedPresenter<AccessRequestPresenter>> {
    const accessRequests =
      await this.getManyRejectedAccessRequestsUseCase.execute({
        ...filters,
        organizationId: user.organizationId,
      });

    return new PaginatedPresenter({
      ...accessRequests,
      items: accessRequests.items.map(
        (accessRequest) => new AccessRequestPresenter(accessRequest),
      ),
    });
  }

  @Get('/download')
  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment; filename="Cereri-Acces.xlsx"')
  async downloadAccessRequests(
    @Res({ passthrough: true }) res: Response,
    @ExtractUser() user: IAdminUserModel,
    @Query() filters: GetAccessRequestsDto,
  ): Promise<void> {
    const data = await this.getAccessRequestsForDownloadUseCase.execute({
      ...filters,
      organizationId: user.organizationId,
    });

    res.end(jsonToExcelBuffer<IAccessRequestDownload>(data, 'Cereri-Acces'));
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Get(':id')
  async getOne(
    @Param('id', UuidValidationPipe) accessRequestId: string,
  ): Promise<AccessRequestPresenter> {
    const accessRequest = await this.getAccessRequestUseCase.execute(
      accessRequestId,
    );
    return new AccessRequestPresenter(accessRequest);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Post(':id/approve')
  async approve(
    @ExtractUser() user: IAdminUserModel,
    @Param('id', UuidValidationPipe) accessRequestId: string,
  ): Promise<AccessRequestPresenter> {
    const accessRequest = await this.approveAccessRequestUseCase.execute({
      id: accessRequestId,
      updatedById: user.id,
    });
    return new AccessRequestPresenter(accessRequest);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @ApiBody({ type: RejectAccessRequestDto })
  @Post(':id/reject')
  async reject(
    @ExtractUser() user: IAdminUserModel,
    @Body() { rejectionReason }: RejectAccessRequestDto,
    @Param('id', UuidValidationPipe) accessRequestId: string,
  ): Promise<AccessRequestPresenter> {
    const accessRequest = await this.rejectAccessRequestUseCase.execute({
      id: accessRequestId,
      updatedById: user.id,
      rejectionReason: rejectionReason,
    });
    return new AccessRequestPresenter(accessRequest);
  }

  @ApiParam({ name: 'id', type: 'string' })
  @Delete(':id')
  async delete(
    @ExtractUser() user: IAdminUserModel,
    @Param('id', UuidValidationPipe) accessRequestId: string,
  ): Promise<string> {
    return this.deleteAccessRequestUseCase.execute(accessRequestId);
  }
}
