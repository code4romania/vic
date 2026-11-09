import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxDate,
  MaxLength,
  MinLength,
} from 'class-validator';
import { IsNormalizedEmail } from 'src/api/auth/dto/validators';
import { VolunteerStatus } from 'src/modules/volunteer/enums/volunteer-status.enum';

const trimmed = Transform(({ value }) =>
  typeof value === 'string' ? value.trim() : value,
);
// An optional field left empty by the form means "not given".
const blankAsMissing = Transform(({ value }) =>
  typeof value === 'string' && value.trim() === '' ? undefined : value,
);

export const ADDABLE_VOLUNTEER_STATUSES = [
  VolunteerStatus.CANDIDATE,
  VolunteerStatus.ACTIVE,
];

// #471: the NGO adds a volunteer by hand.
export class AddVolunteerDto {
  @ApiProperty({ example: 'Ana' })
  @trimmed
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  firstName: string;

  @ApiProperty({ example: 'Popescu' })
  @trimmed
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  lastName: string;

  @ApiProperty({ example: 'ana@exemplu.ro' })
  @IsNormalizedEmail()
  email: string;

  @ApiPropertyOptional({ example: '+40700000000' })
  @blankAsMissing
  @trimmed
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ type: Date })
  @blankAsMissing
  @IsOptional()
  @IsDate()
  @MaxDate(() => new Date())
  birthday?: Date;

  @ApiPropertyOptional({ description: 'The city (location) id' })
  @IsOptional()
  @IsInt()
  locationId?: number;

  @ApiPropertyOptional({ description: "One of the organization's departments" })
  @blankAsMissing
  @IsOptional()
  @IsUUID()
  departmentId?: string;

  @ApiPropertyOptional({
    description: 'Internal notes, never shown to the volunteer',
  })
  @blankAsMissing
  @trimmed
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  notes?: string;

  @ApiProperty({
    enum: ADDABLE_VOLUNTEER_STATUSES,
    description: 'Active sends an invitation email; Candidate sends nothing',
  })
  @IsIn(ADDABLE_VOLUNTEER_STATUSES)
  status: VolunteerStatus.CANDIDATE | VolunteerStatus.ACTIVE;
}
