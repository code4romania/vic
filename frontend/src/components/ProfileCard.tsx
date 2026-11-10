import React from 'react';
import i18n from '../common/config/i18n';
import { Sex } from '../common/enums/sex.enum';
import { ICity } from '../common/interfaces/city.interface';
import { formatLocation } from '../common/utils/utils';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';
import { initialsOf } from './UserMenu';

interface ProfileCardProps {
  name: string;
  logo: string;
  age?: number | null;
  sex: Sex;
  location: ICity;
  children?: React.ReactNode;
}

const ProfileCard = ({ name, logo, age, sex, location, children }: ProfileCardProps) => {
  return (
    <Card className="h-full flex justify-center align-center">
      <CardBody>
        <div className="flex flex-col items-center gap-3 px-2 pt-4 pb-6 text-center">
          {logo ? (
            <img
              src={`${logo}`}
              alt="Profile picture"
              className="logo w-28 lg:w-32 border-white border-4 shadow-blur text-transparent"
            />
          ) : (
            <span className="w-28 h-28 lg:w-32 lg:h-32 rounded-full bg-navy text-yellow font-titilliumBold text-4xl flex items-center justify-center">
              {initialsOf(name)}
            </span>
          )}
          <h2 className="text-cool-gray-900">{name}</h2>
          {!!age && (
            <small className="text-cool-gray-500">{i18n.t('general:years_old', { age })}</small>
          )}
          {sex && (
            <small className="text-cool-gray-500">
              {i18n.t('general:sex', { sex_type: i18n.t(`general:${sex}`) })}
            </small>
          )}
          <small className="text-cool-gray-500">{formatLocation(location)}</small>
          {children}
        </div>
      </CardBody>
    </Card>
  );
};

export default ProfileCard;
