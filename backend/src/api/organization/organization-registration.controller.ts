import {
  Body,
  Controller,
  Post,
  Req,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiExtraModels,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { RegisterOrganizationUseCase } from 'src/usecases/organization/register-organization.usecase';
import { RegisterOrganizationDto } from './dto/register-organization.dto';
import {
  OrganizationFilesInterceptor,
  OrganizationUploads,
} from './organization-files';
import { MaskedEmailPresenter } from './presenters/masked-email.presenter';

// Public: a new NGO registers in VIC (decision 4). 5 per minute per IP.
@ApiExtraModels(RegisterOrganizationDto)
@Controller('organizations')
export class OrganizationRegistrationController {
  constructor(
    private readonly registerOrganizationUseCase: RegisterOrganizationUseCase,
  ) {}

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      allOf: [
        { $ref: '#/components/schemas/RegisterOrganizationDto' },
        {
          type: 'object',
          required: ['statute'],
          properties: {
            statute: {
              type: 'string',
              format: 'binary',
              description: 'PDF, at most 10 MB',
            },
            logo: {
              type: 'string',
              format: 'binary',
              description: 'Image, at most 5 MB',
            },
          },
        },
      ],
    },
  })
  @ApiCreatedResponse({ type: MaskedEmailPresenter })
  @UseInterceptors(OrganizationFilesInterceptor())
  @Post('register')
  async register(
    @Body() dto: RegisterOrganizationDto,
    @UploadedFiles() files: OrganizationUploads,
    @Req() req: Request,
  ): Promise<MaskedEmailPresenter> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { acceptedTerms, ...options } = dto;
    const { maskedEmail } = await this.registerOrganizationUseCase.execute(
      options,
      { logo: files?.logo?.[0], statute: files?.statute?.[0] },
      req.ip,
    );
    return new MaskedEmailPresenter(maskedEmail);
  }
}
