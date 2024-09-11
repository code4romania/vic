import { Body, Param, Patch, UseGuards } from '@nestjs/common';
import { Controller } from '@nestjs/common';
import { ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { MobileJwtAuthGuard } from 'src/modules/auth/guards/jwt-mobile.guard';
import { ExtractUser } from 'src/common/decorators/extract-user.decorator';
import { IRegularUserModel } from 'src/modules/user/models/regular-user.model';
import { UuidValidationPipe } from 'src/infrastructure/pipes/uuid.pipe';
import { SignDocumentContractByVolunteerUsecase } from 'src/usecases/documents/new_contracts/sign-document-contract-by-volunteer.usecase';
import { RejectDocumentContractByVolunteerUsecase } from 'src/usecases/documents/new_contracts/reject-document-contact-by-volunteer.usecase';
import { SignDocumentContractByVolunteerDto } from './dto/SignDocumentContractByVolunteer.dto';
import { RejectDocumentContractByVolunteerDto } from './dto/RejectDocumentContractByVolunteer.dto';

// @UseGuards(MobileJwtAuthGuard, ContractVolunteerGuard)
@UseGuards(MobileJwtAuthGuard)
@ApiBearerAuth()
@Controller('mobile/documents/contracts')
export class MobileDocumentsContractController {
  constructor(
    private readonly signDocumentContractByVolunteerUsecase: SignDocumentContractByVolunteerUsecase,
    private readonly rejectDocumentContractByVolunteerUsecase: RejectDocumentContractByVolunteerUsecase,
  ) {}

  @ApiParam({ name: 'contractId', type: 'string' })
  @Patch(':contractId/sign')
  async sign(
    @Body() body: SignDocumentContractByVolunteerDto,
    @ExtractUser() { id }: IRegularUserModel,
    @Param('contractId', UuidValidationPipe) contractId: string,
  ): Promise<void> {
    const contract = await this.signDocumentContractByVolunteerUsecase.execute({
      contractId,
      userId: id,
      organizationId: body.organizationId, // TODO: can use activeOrganization but is a bit danger if the mobile doesn't set it
      volunteerSignatureBase64: body.volunteerSignatureBase64,
      legalGuardianSignatureBase64: body.legalGuardianSignatureBase64,
    });

    return contract;
  }

  @ApiParam({ name: 'contractId', type: 'string' })
  @Patch(':contractId/reject')
  async reject(
    @Body() body: RejectDocumentContractByVolunteerDto,
    @ExtractUser() { id }: IRegularUserModel,
    @Param('contractId', UuidValidationPipe) contractId: string,
  ): Promise<void> {
    await this.rejectDocumentContractByVolunteerUsecase.execute({
      contractId,
      userId: id,
      organizationId: body.organizationId,
      rejectionReason: body.reason,
    });
  }
}
