import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IAnnouncementResponseModel } from 'src/modules/announcement/models/announcement-response.model';

// #504
export class AnnouncementResponsePresenter {
  constructor(response: IAnnouncementResponseModel) {
    this.id = response.id;
    this.comment = response.comment;
    this.createdOn = response.createdOn;
    this.user = response.user;
    this.volunteerId = response.volunteerId ?? null;
  }

  @Expose()
  @ApiProperty()
  id: string;

  @Expose()
  @ApiProperty({ description: "The volunteer's comment" })
  comment: string;

  @Expose()
  @ApiProperty({ description: 'When the volunteer answered' })
  createdOn: Date;

  @Expose()
  @ApiProperty()
  user: { id: string; name: string; email: string };

  @Expose()
  @ApiProperty({ nullable: true })
  volunteerId: string;
}
