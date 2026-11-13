import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IEventModel } from 'src/modules/event/models/event.model';
import { IdAndNamePresenter } from 'src/infrastructure/presenters/id-name.presenter';

// The event picker of „Adaugă ore”: id and name as before, plus the start date the menu shows
// on the right of each row („13 NOV”).
export class MobileEventOptionPresenter extends IdAndNamePresenter<IEventModel> {
  constructor(event: IEventModel) {
    super(event);
    this.startDate = event.startDate;
  }

  @Expose()
  @ApiProperty({
    description: 'When the event starts',
    example: '2026-11-13T09:00:00.000Z',
  })
  startDate: Date;
}
