import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class QuenstionAnswerDto {
  @IsString()
  question: string;

  @IsString()
  answer: string;
}

export class CreateAccessRequestDto {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @Type(() => QuenstionAnswerDto)
  @IsNotEmpty()
  answers: QuenstionAnswerDto[];

  @IsString()
  @IsNotEmpty()
  @IsUUID()
  organizationId: string;

  // TODO: delete the following, only for testing purpose because we don't have token
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  userId: string;
}
