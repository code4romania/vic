import React from 'react';
import i18n from '../common/config/i18n';
import { Sex } from '../common/enums/sex.enum';
import { ICity } from '../common/interfaces/city.interface';
import { formatLocation } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';

interface ProfileCardProps {
  name: string;
  logo: string;
  age: number;
  sex: Sex;
  location: ICity;
}

const ProfileCard = ({ name, logo, age, sex, location }: ProfileCardProps) => {
  return (
    <Card>
      <CardBody>
        <div className="flex flex-col items-center gap-4 px-2 pt-4 pb-8">
          <h2 className="text-cool-gray-700">{name}</h2>
          <img
            src={`${logo}`}
            alt="Profile picture"
            className="logo w-32 lg:w-44 border-white border-4 shadow-blur text-transparent"
          />
          <small className="text-cool-gray-500">{i18n.t('general:years_old', { age })}</small>
          {sex && (
            <small className="text-cool-gray-500">
              {i18n.t('general:sex', { sex_type: i18n.t(`general:${sex}`) })}
            </small>
          )}
          <small className="text-cool-gray-500">{formatLocation(location)}</small>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProfileCard;
