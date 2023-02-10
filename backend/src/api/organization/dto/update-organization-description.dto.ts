import { IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateOrganizationDescriptionDto {
  @IsString()
  @MinLength(50)
  @MaxLength(250)
  description: string;
}
