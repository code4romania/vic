import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  IException,
  IBusinessError,
} from 'src/common/exceptions/exceptions.interface';

@Injectable()
export class ExceptionsService implements IException {
  badRequestException(data: IBusinessError): void {
    throw new BadRequestException(data);
  }
  internalServerErrorException(data: IBusinessError): void {
    throw new InternalServerErrorException(data);
  }
  forbiddenException(data: IBusinessError): void {
    throw new ForbiddenException(data);
  }
  unauthorizedException(data: IBusinessError): void {
    throw new UnauthorizedException(data);
  }
  notFoundException(data: IBusinessError): void {
    throw new NotFoundException(data);
  }
}
