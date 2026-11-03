import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import {
  ITeamMember,
  TeamMemberStatus,
} from 'src/usecases/team/list-team.usecase';

// A colleague on the Team page. Only admins of the same organization see each other's email and phone.
export class TeamMemberPresenter {
  constructor(member: ITeamMember) {
    this.id = member.id;
    this.name = member.name;
    this.email = member.email;
    this.phone = member.phone;
    this.status = member.status;
    this.inviteExpiresAt = member.inviteExpiresAt;
    this.lastInviteSentAt = member.lastInviteSentAt;
    this.lastInviteSentBy = member.lastInviteSentBy;
    this.lastLoginAt = member.lastLoginAt;
  }

  @Expose()
  @ApiProperty({ description: 'The admin user id, for the Team routes' })
  id: string;
  @Expose() @ApiProperty() name: string;
  @Expose() @ApiProperty() email: string;
  @Expose() @ApiProperty() phone: string;
  @Expose() @ApiProperty({ enum: TeamMemberStatus }) status: TeamMemberStatus;
  @Expose() @ApiProperty({ nullable: true }) inviteExpiresAt: Date;
  @Expose() @ApiProperty({ nullable: true }) lastInviteSentAt: Date;

  @Expose()
  @ApiProperty({
    nullable: true,
    description: 'Null for the cutover transition link',
  })
  lastInviteSentBy: string;

  @Expose() @ApiProperty({ nullable: true }) lastLoginAt: Date;
}
