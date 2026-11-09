import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ExceptionsService } from 'src/infrastructure/exceptions/exceptions.service';
import { AUTH_EMAILS } from 'src/modules/auth/constants/auth-emails';
import { AuthMailerService } from 'src/modules/auth/services/auth-mailer.service';
import { OrganizationStructureType } from 'src/modules/organization/enums/organization-structure-type.enum';
import { IAdminUserModel } from 'src/modules/user/models/admin-user.model';
import { UserFacadeService } from 'src/modules/user/services/user-facade.service';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';
import { VolunteerExceptionMessages } from 'src/modules/volunteer/exceptions/volunteer.exceptions';
import { IVolunteerModel } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';
import { GetOrganizationUseCaseService } from '../organization/get-organization.usecase';
import { GetOneOrganizationStructureUseCase } from '../organization/organization-structure/get-one-organization-structure.usecase';

export interface AddVolunteerOptions {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  birthday?: Date;
  locationId?: number;
  departmentId?: string;
  notes?: string;
  // Where the volunteer came from, e.g. "Import CSV" (#473)
  source?: string;
  status: VolunteerStatus.CANDIDATE | VolunteerStatus.ACTIVE;
}

// #471: the NGO adds a volunteer from one form. Someone without a VIC account gets a placeholder user
// (has_account = false) that their sign-up in the app claims later. Active sends an invitation email;
// Candidate sends nothing. VOLUNTEER_009 when the email is already a volunteer of the organization.
@Injectable()
export class AddVolunteerUseCase implements IUseCaseService<IVolunteerModel> {
  constructor(
    private readonly userFacade: UserFacadeService,
    private readonly volunteerFacade: VolunteerFacade,
    private readonly getOrganizationUseCase: GetOrganizationUseCaseService,
    private readonly getOneOrganizationStructureUseCase: GetOneOrganizationStructureUseCase,
    private readonly authMailer: AuthMailerService,
    private readonly exceptionService: ExceptionsService,
  ) {}

  async execute(
    options: AddVolunteerOptions,
    admin: IAdminUserModel,
  ): Promise<IVolunteerModel> {
    const { organizationId } = admin;
    const organization =
      await this.getOrganizationUseCase.execute(organizationId);

    // 1. The department, when given, is one of this organization's
    if (options.departmentId) {
      try {
        await this.getOneOrganizationStructureUseCase.execute({
          id: options.departmentId,
          organizationId,
          type: OrganizationStructureType.DEPARTMENT,
        });
      } catch {
        this.exceptionService.badRequestException(
          VolunteerExceptionMessages.VOLUNTEER_PROFILE_002,
        );
      }
    }

    // 2. The person: an existing user with this email (account or placeholder), or a new placeholder
    let user = await this.userFacade.findRegularUser({ email: options.email });
    if (user) {
      const existing = await this.volunteerFacade.find({
        userId: user.id,
        organizationId,
      });
      if (existing) {
        this.exceptionService.badRequestException(
          VolunteerExceptionMessages.VOLUNTEER_009,
        );
      }
    } else {
      user = await this.userFacade.createRegularUser({
        firstName: options.firstName,
        lastName: options.lastName,
        email: options.email,
        phone: options.phone ?? null,
        birthday: options.birthday ?? null,
        locationId: options.locationId ?? null,
        hasAccount: false,
      } as Parameters<UserFacadeService['createRegularUser']>[0]);
    }

    // 3. The volunteer, with a profile holding the email and department
    const volunteer = await this.volunteerFacade.create({
      userId: user.id,
      organizationId,
      status: options.status,
      notes: options.notes ?? null,
      source: options.source ?? null,
    });
    await this.volunteerFacade.createProfile({
      volunteerId: volunteer.id,
      email: options.email,
      departmentId: options.departmentId,
      activeSince:
        options.status === VolunteerStatus.ACTIVE ? new Date() : undefined,
    });
    if (!user.activeOrganization) {
      await this.userFacade.updateRegularUser(user.id, {
        activeOrganizationId: organizationId,
      });
    }

    // 4. Active: invite them to the app
    if (options.status === VolunteerStatus.ACTIVE) {
      await this.authMailer.send(
        options.email,
        AUTH_EMAILS.volunteerInvitation(organization.name, user.hasAccount),
      );
    }

    return this.volunteerFacade.find({ id: volunteer.id });
  }
}
