// FILE: src/Inbox/UserList.jsx

import React from 'react';
import './UserList.css';

const Avatar = ({ name }) => (
  <div className="user-avatar">
    <img src={`https://ui-avatars.com/api/?name=${name.replace(' ', '+')}&background=EBF4FF&color=3B82F6&size=128`} alt={`${name}'s avatar`} />
  </div>
);

const UserList = ({ user, active, onClick }) => (
  <div className={`user-list-item ${active ? 'active' : ''}`} onClick={onClick}>
    <Avatar name={user.name} />
    <div className="user-list-info">
      <span className="user-list-name">{user.name}</span>
      <span className="user-list-description">{user.company}</span>
    </div>
  </div>
);

export default UserList;
