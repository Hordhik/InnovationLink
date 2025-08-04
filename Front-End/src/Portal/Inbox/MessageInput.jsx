import React from 'react';
import './MessageInput.css';

const MessageInput = () => {
  return (
    <div className="message-input-container">
      <button className="attach-button">
        <img src="https://www.flaticon.com/svg/static/icons/svg/130/130761.svg" alt="Attach" />
      </button>
      <input type="text" placeholder="Type your message ..." className="message-input" />
      <button className="send-button">
        {/* You can add a send icon here */}
      </button>
    </div>
  );
};

export default MessageInput;