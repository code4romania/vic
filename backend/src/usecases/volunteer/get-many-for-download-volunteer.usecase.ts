import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { IVolunteerDownload } from 'src/common/interfaces/volunteer-download.interface';
import { FindManyVolunteersOptions } from 'src/modules/volunteer/model/volunteer.model';
import { VolunteerFacade } from 'src/modules/volunteer/services/volunteer.facade';

@Injectable()
export class GetVolunteersForDownloadUseCase
  implements IUseCaseService<IVolunteerDownload[]>
{
  constructor(private readonly volunteerFacade: VolunteerFacade) {}

  public async execute(
    findOptions: FindManyVolunteersOptions,
  ): Promise<IVolunteerDownload[]> {
    const volunteers = await this.volunteerFacade.findMany({
      ...findOptions,
      limit: 0,
      page: 0,
    });

    return volunteers.items.map((volunteer): IVolunteerDownload => {
      return {
        Nume: volunteer.user.name,
        'Data nasterii': volunteer.user.birthday,
        Locatie:
          volunteer.user.location.name +
          ', jud ' +
          volunteer.user.location.county.name,
        Email: volunteer.volunteerProfile.email,
        Telefon: volunteer.volunteerProfile.phone,
        'Perioada activitate': volunteer.volunteerProfile.activeSince,
        'Nume filiala': volunteer.volunteerProfile.branch?.name,
        'Nume departament': volunteer.volunteerProfile.department?.name,
        'Nume rol': volunteer.volunteerProfile.role?.name,
        'Arhivat din': volunteer.archivedOn,
        'Data blocarii': volunteer.blockedOn,
      };
    });
  }
}
