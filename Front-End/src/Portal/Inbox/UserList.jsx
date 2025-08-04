import React from 'react';
import './UserList.css';

const UserList = ({ name, description }) => {
  return (
    <div className="user-item">
      <div className="avatar">
        <img src="https://ui-avatars.com/api/?name=Ishwar" alt="User Avatar" />
      </div>
      <div className="user-info">
        <span className="user-name">{name}</span>
        <span className="user-description">{description}</span>
      </div>
    </div>
  );
};

export default UserList;