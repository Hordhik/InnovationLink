import React from 'react';
import './Message.css';

const Message = ({ text, time, isSentByMe }) => {
  return (
    <div className={`message-container ${isSentByMe ? 'sent-by-me' : ''}`}>
      <div className="message-content">
        <div className="message-text">{text}</div>
        <div className="message-time">{time}</div>
      </div>
    </div>
  );
};

export default Message;