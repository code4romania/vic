import { IsString, MaxLength } from 'class-validator';

export class UpdateOrganizationDescriptionDto {
  @IsString()
  @MaxLength(700)
  description: string;
}
