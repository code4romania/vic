import { Expose } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IEventsMobileListItemModel } from 'src/modules/event/models/event.model';
import { format, isSameDay } from 'date-fns';

export class MobileEventListItemPresenter {
  constructor(event: IEventsMobileListItemModel) {
    this.id = event.id;
    this.name = event.name;
    this.image =
      'https://emoji.slack-edge.com/TFMSWR5JT/dragos/584b8f200c433c5e.jpg';

    this.startDate = event.startDate;
    this.endDate = event.endDate;

    this.isPublic = event.isPublic;

    this.location = event.location;
    this.eventInterval = this.formatEventDate(event.startDate, event.endDate);
  }

  @Expose()
  @ApiProperty({
    description: 'The uuid of the event',
    example: '525dcdf9-4117-443e-a0c3-bf652cdc5c1b',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: 'The event name',
    example: 'Event Name',
  })
  name: string;

  @Expose()
  @ApiProperty({
    description: 'The event location/address',
  })
  location: string;

  @Expose()
  @ApiProperty({ description: 'The Start Date of the Event' })
  startDate: Date;

  @Expose()
  @ApiProperty({ description: 'The Start Date of the Event' })
  endDate: Date;

  @Expose()
  @ApiProperty({
    description:
      'The interval in which the event occurs, is made of start and end date',
  })
  eventInterval: string;

  @Expose()
  @ApiProperty({ description: 'The image of the Event' })
  image: string;

  @Expose()
  @ApiProperty({ description: 'Wether the event is public or not' })
  isPublic: boolean;

  private formatEventDate = (startDate: Date, endDate?: Date): string => {
    let eventDate = '';
    if (!endDate) {
      eventDate = `${this.formatDate(startDate)}, ${this.getHoursAndMinutes(
        startDate,
      )}`;
    } else {
      if (isSameDay(new Date(startDate), new Date(endDate))) {
        eventDate = `${this.formatDate(startDate)}, ${this.getHoursAndMinutes(
          startDate,
        )} - ${this.getHoursAndMinutes(endDate)}`;
      } else {
        eventDate = `${this.formatDate(startDate)}, ${this.getHoursAndMinutes(
          startDate,
        )} - ${this.formatDate(endDate)}, ${this.getHoursAndMinutes(endDate)}`;
      }
    }

    return eventDate;
  };

  private formatDate = (value?: Date | string | null): string =>
    value ? format(new Date(value), 'dd MMM yyyy') : '-';

  private getHoursAndMinutes = (value: Date | string): string =>
    format(new Date(value), 'HH:mm');
}
