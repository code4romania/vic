import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Pagination } from 'src/infrastructure/base/repository-with-pagination.class';
import { SuperAdminGuard } from 'src/modules/auth/guards/super-admin.guard';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import {
  IAdminVolunteerListItem,
  ListAdminVolunteersUseCase,
} from 'src/usecases/admin/list-admin-overview.usecase';
import { GetAdminVolunteersDto } from './dto/get-admin-lists.dto';

// #511: VIC super admins only, like AdminOrganizationsController.
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard, SuperAdminGuard)
@Controller('admin/volunteers')
export class AdminVolunteersController {
  constructor(
    private readonly listAdminVolunteersUseCase: ListAdminVolunteersUseCase,
  ) {}

  @Get()
  async getAll(
    @Query() { page, limit, search }: GetAdminVolunteersDto,
  ): Promise<Pagination<IAdminVolunteerListItem>> {
    return this.listAdminVolunteersUseCase.execute({ page, limit, search });
  }
}
