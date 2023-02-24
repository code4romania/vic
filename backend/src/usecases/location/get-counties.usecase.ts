import { Injectable } from '@nestjs/common';
import { IUseCaseService } from 'src/common/interfaces/use-case-service.interface';
import { ICountyModel } from 'src/modules/location/model/county.model';
import { LocationFacade } from 'src/modules/location/services/location.facade';

@Injectable()
export class GetCountiesUseCase implements IUseCaseService<ICountyModel[]> {
  constructor(private readonly locationFacade: LocationFacade) {}

  public async execute(): Promise<ICountyModel[]> {
    return this.locationFacade.findCounties();
  }
}
