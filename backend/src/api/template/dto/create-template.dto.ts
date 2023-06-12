import { IsString, MaxLength, MinLength } from 'class-validator';

export class CreateTemplateDto {
  @IsString()
  @MaxLength(250)
  @MinLength(2)
  name: string;
}
