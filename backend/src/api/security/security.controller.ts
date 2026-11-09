import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { WebJwtAuthGuard } from 'src/modules/auth/guards/jwt-web.guard';
import { IWebRequestUser } from 'src/modules/auth/interfaces/request-user.interface';
import { ChangeEmailUsecase } from 'src/usecases/security/change-email.usecase';
import { DeleteOrganizationUsecase } from 'src/usecases/security/delete-organization.usecase';
import { OrganizationBackupUsecase } from 'src/usecases/security/organization-backup.usecase';
import { SensitiveActionUsecase } from 'src/usecases/security/sensitive-action.usecase';
import { clearRefreshCookie } from '../auth/cookies';
import {
  ConfirmEmailChangeDto,
  DeleteOrganizationDto,
  RequestEmailChangeDto,
  RequestSensitiveCodeDto,
} from './dto/security.dto';

// VIC 2.0, #508: Setări > Date și securitate.
@ApiBearerAuth()
@UseGuards(WebJwtAuthGuard)
@Controller('security')
export class SecurityController {
  constructor(
    private readonly sensitiveAction: SensitiveActionUsecase,
    private readonly changeEmail: ChangeEmailUsecase,
    private readonly deleteOrganization: DeleteOrganizationUsecase,
    private readonly backup: OrganizationBackupUsecase,
  ) {}

  // The emailed code before deleting the NGO or adding an admin
  @HttpCode(HttpStatus.OK)
  @Post('code')
  async requestCode(
    @ExtractUser() admin: IWebRequestUser,
    @Body() { action }: RequestSensitiveCodeDto,
  ): Promise<{ maskedEmail: string }> {
    return this.sensitiveAction.requestCode(admin, action);
  }

  // Change email, step 1: a code to the current address and one to the new address
  @HttpCode(HttpStatus.OK)
  @Post('email/codes')
  async requestEmailChange(
    @ExtractUser() admin: IWebRequestUser,
    @Body() { newEmail }: RequestEmailChangeDto,
  ): Promise<{ maskedEmail: string; newEmail: string }> {
    return this.changeEmail.requestCodes(admin, newEmail);
  }

  // Change email, step 2: both codes
  @HttpCode(HttpStatus.OK)
  @Post('email')
  async confirmEmailChange(
    @ExtractUser() admin: IWebRequestUser,
    @Body() { code, newEmailCode }: ConfirmEmailChangeDto,
  ): Promise<{ email: string }> {
    return this.changeEmail.confirm(admin, code, newEmailCode);
  }

  // "Backup complet": one Excel workbook with all the organization's data
  @Get('backup')
  async getBackup(
    @ExtractUser() { organizationId }: IWebRequestUser,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    const { fileName, data } = await this.backup.execute(organizationId);
    res.set({
      'Content-Type':
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': `attachment; filename="${fileName}"`,
      'Access-Control-Expose-Headers': 'Content-Disposition',
    });
    res.end(data);
  }

  // Danger zone: deletes the organization and all its data, for good
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post('organization/delete')
  async deleteOrganizationAccount(
    @ExtractUser() admin: IWebRequestUser,
    @Body() { confirmation, code }: DeleteOrganizationDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<void> {
    await this.deleteOrganization.execute(admin, confirmation, code);
    clearRefreshCookie(res);
  }
}
