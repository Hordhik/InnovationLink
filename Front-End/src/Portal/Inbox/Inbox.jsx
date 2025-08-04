import React from 'react';
import UserList from './UserList';
import Message from './Message';
import MessageInput from './MessageInput';
import './Inbox.css';

const Inbox = () => {
  const users = [
    { name: 'Ishwar', company: 'UI2DEV' },
    { name: 'Ishwar', company: 'UI2DEV' },
    { name: 'Ishwar', company: 'UI2DEV' },
    { name: 'Ishwar', company: 'UI2DEV' },
    { name: 'Ishwar', company: 'UI2DEV' },
  ];

  const messages = [
    {
      id: 1,
      text: "One of India's most prestigious startup events, organized by AICRA, bringing together. organized by AICRA, bringing together.",
      time: '8:30 AM',
      isSentByMe: false,
    },
    {
      id: 2,
      text: "One of India's most prestigious startup events, organized by AICRA, bringing together. organized by AICRA, bringing together.",
      time: '8:30 AM',
      isSentByMe: true,
    },
    {
      id: 3,
      text: "One of India's most prestigious startup events, organized by AICRA, bringing together. One of India's most prestigious startup events.",
      time: '8:30 AM',
      isSentByMe: true,
    },
    {
      id: 4,
      text: "One of India's most prestigious startup events, organized by AICRA, bringing together. organized by AICRA, bringing together.",
      time: '8:30 AM',
      isSentByMe: false,
    },
  ];

  return (
    <div className="inbox-container">
      <div className="users">
        {users.map((user, index) => (
          <UserList key={index} name={user.name} company={user.company} />
        ))}
      </div>
      <div className="chat-box">
        <div className="chat-header">
          {/* Header content like "Jan, 14" */}
          <span className="date-divider">Jan, 14</span>
        </div>
        <div className="messages-list">
          {messages.map((message) => (
            <Message
              key={message.id}
              text={message.text}
              time={message.time}
              isSentByMe={message.isSentByMe}
            />
          ))}
        </div>
        <MessageInput />
      </div>
    </div>
  );
};

export default Inbox;