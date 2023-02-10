import React from 'react';
import i18n from '../common/config/i18n';
import { Sex } from '../common/enums/sex.enum';
import Card from '../layouts/CardLayout';
import CardBody from './CardBody';

interface ProfileCardProps {
  name: string;
  logo: string;
  age: number;
  sex: Sex;
  location: string;
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
            className="logo w-32 lg:w-44 border-white border-4 shadow-blur"
          />
          <small className="text-cool-gray-500">{i18n.t('general:years_old', { age })}</small>
          <small className="text-cool-gray-500">
            {i18n.t('general:sex', { sex_type: i18n.t('general:sex', { context: sex }) })}
          </small>
          <small className="text-cool-gray-500">{location}</small>
        </div>
      </CardBody>
    </Card>
  );
};

export default ProfileCard;
