import { Injectable } from '@nestjs/common';
import { formatBucharestDate } from 'src/common/helpers/bucharest-time';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import {
  REGISTRATION_EXPORT_COLUMNS,
  RegistrationExportField,
} from 'src/modules/event/enums/registration-export-field.enum';
import { EventFacade } from 'src/modules/event/services/event.facade';
import { GetOneEventUseCase } from '../get-one-event.usecase';

// VIC 2.0 (#497): the event's registered volunteers, with the columns the NGO picked (all by default),
// always in the same order.
@Injectable()
export class DownloadEventRegistrationsUseCase
  implements IUseCaseService<Record<string, string | number>[]>
{
  constructor(
    private readonly eventFacade: EventFacade,
    private readonly getOneEventUseCase: GetOneEventUseCase,
  ) {}

  async execute({
    eventId,
    organizationId,
    fields,
  }: {
    eventId: string;
    organizationId: string;
    fields?: RegistrationExportField[];
  }): Promise<Record<string, string | number>[]> {
    await this.getOneEventUseCase.execute({ id: eventId, organizationId });

    const chosen = Object.values(RegistrationExportField).filter(
      (field) => !fields?.length || fields.includes(field),
    );
    const rows = await this.eventFacade.findRegistrationsForExport(eventId);

    return rows.map((row) =>
      Object.fromEntries(
        chosen.map((field) => [
          REGISTRATION_EXPORT_COLUMNS[field],
          field === RegistrationExportField.REGISTERED_ON
            ? formatBucharestDate(new Date(row.registeredOn))
            : row[field] ?? '',
        ]),
      ),
    );
  }
}
