import React from 'react';

const ProfileHeader = ({ user }:{user: any}) => {
  return (
    <div className="container text-center p-8">
      <img src={user.avatarUrl} alt="User avatar" className="mx-auto h-24 w-24 rounded-full border-4 border-purple-500"/>
      <h1 className="text-2xl font-bold mt-4">{user.name}</h1>
      <p className="text-purple-200">{user.bio}</p>
    </div>
  );
};

export default ProfileHeader;
