import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { IException, IError } from 'src/common/exceptions/exceptions.interface';

@Injectable()
export class ExceptionsService implements IException {
  badRequestException(data: IError): void {
    throw new BadRequestException(data);
  }
  internalServerErrorException(data?: IError): void {
    throw new InternalServerErrorException(data);
  }
  forbiddenException(data?: IError): void {
    throw new ForbiddenException(data);
  }
  unauthorizedException(data?: IError): void {
    throw new UnauthorizedException(data);
  }
  notFoundException(data?: IError): void {
    throw new NotFoundException(data);
  }
}
