import { IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { BasePaginationFilterDto } from 'src/infrastructure/base/base-pagination-filter.dto';

export class GetManyContractsByVolunteerDto extends BasePaginationFilterDto {
  @ApiProperty({
    description: 'The ID of the organization',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  organizationId: string;
}
