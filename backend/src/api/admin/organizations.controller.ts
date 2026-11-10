import {
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse } from '@nestjs/swagger';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { SuperAdminGuard } from 'src/modules/auth/guards/super-admin.guard';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IWebRequestUser } from 'src/modules/auth/interfaces/request-user.interface';
import { ListPendingValidationUseCase } from 'src/usecases/organization/list-pending-validation.usecase';
import {
  SuspendOrganizationUseCase,
  UnsuspendOrganizationUseCase,
} from 'src/usecases/organization/suspend-organization.usecase';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import {
  IAdminOrganizationListItem,
  ListAdminOrganizationsUseCase,
} from 'src/usecases/admin/list-admin-overview.usecase';
import { GetAdminOrganizationsDto } from './dto/get-admin-lists.dto';
import { ValidateOrganizationUseCase } from 'src/usecases/organization/validate-organization.usecase';
import { OrganizationPresenter } from '../organization/presenters/organization-presenter.interface';
import { PendingOrganizationPresenter } from '../organization/presenters/pending-organization.presenter';

// VIC super admins only. The JWT guard runs first, then SuperAdminGuard; @Roles cannot be used because the
// global RolesGuard runs before the JWT guards (decisions R28). A plain admin gets 403.
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard, SuperAdminGuard)
@Controller('admin/organizations')
export class AdminOrganizationsController {
  constructor(
    private readonly listPendingValidationUseCase: ListPendingValidationUseCase,
    private readonly validateOrganizationUseCase: ValidateOrganizationUseCase,
    private readonly suspendOrganizationUseCase: SuspendOrganizationUseCase,
    private readonly unsuspendOrganizationUseCase: UnsuspendOrganizationUseCase,
    private readonly listAdminOrganizationsUseCase: ListAdminOrganizationsUseCase,
  ) {}

  // #511
  @Get()
  async getAll(
    @Query()
    {
      page,
      limit,
      search,
      status,
      awaitingValidation,
    }: GetAdminOrganizationsDto,
  ): Promise<Pagination<IAdminOrganizationListItem>> {
    return this.listAdminOrganizationsUseCase.execute({
      page,
      limit,
      search,
      status,
      awaitingValidation,
    });
  }

  @ApiOkResponse({ type: PendingOrganizationPresenter, isArray: true })
  @Get('pending-validation')
  async pendingValidation(): Promise<PendingOrganizationPresenter[]> {
    const organizations = await this.listPendingValidationUseCase.execute();
    return organizations.map(
      (organization) => new PendingOrganizationPresenter(organization),
    );
  }

  @ApiOkResponse({ type: OrganizationPresenter })
  @Patch(':id/validate')
  async validate(
    @Param('id', ParseUUIDPipe) id: string,
    @ExtractUser() superAdmin: IWebRequestUser,
  ): Promise<OrganizationPresenter> {
    return new OrganizationPresenter(
      await this.validateOrganizationUseCase.execute(id, superAdmin.id),
    );
  }

  @ApiOkResponse({ type: OrganizationPresenter })
  @Patch(':id/suspend')
  async suspend(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrganizationPresenter> {
    return new OrganizationPresenter(
      await this.suspendOrganizationUseCase.execute(id),
    );
  }

  @ApiOkResponse({ type: OrganizationPresenter })
  @Patch(':id/unsuspend')
  async unsuspend(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrganizationPresenter> {
    return new OrganizationPresenter(
      await this.unsuspendOrganizationUseCase.execute(id),
    );
  }
}
