import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';
import { validate } from 'uuid';

@Injectable()
export class UuidValidationPipe implements PipeTransform<string> {
  async transform(value: string): Promise<string> {
    if (!validate(value)) {
      throw new BadRequestException({
        message: 'Id must be uuid format',
        error_code: null,
      });
    }
    return value;
  }
}
