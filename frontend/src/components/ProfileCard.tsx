import React from 'react';

interface ProfileCardProps {
  name: string;
  profileImage: string;
  age: string | number;
  sex: string;
  location: string;
}

const ProfileCard = ({ name, profileImage, age, sex, location }: ProfileCardProps) => {
  return (
    <div className="w-full min-w-fit bg-white shadow-section rounded-lg">
      <div className="flex flex-col items-center gap-4 px-2 pt-4 pb-8">
        <h2 className="text-cool-gray-700">{name}</h2>
        <img
          src={`${profileImage}`}
          alt="Profile picture"
          className="w-44 h-44 border-white border-4 shadow-blur logo"
        />
        <small className="text-cool-gray-500">{age} de ani</small>
        <small className="text-cool-gray-500">Sex {sex}</small>
        <small className="text-cool-gray-500">{location}</small>
      </div>
    </div>
  );
};

export default ProfileCard;
